import base64
import json
import logging
from typing import Any, Optional

from fastapi import HTTPException
from google import genai
from google.genai import types
from qdrant_client import AsyncQdrantClient

from app.core.config import get_settings
from app.core.gemini import resolve_best_model
from app.services.hscode_service import HSCodeService
from app.schemas.catalog import ExportCatalogResponse

logger = logging.getLogger(__name__)
settings = get_settings()


class CatalogService:
    # ------------------------------------------------------------------ #
    # Internal helper                                                      #
    # ------------------------------------------------------------------ #
    @staticmethod
    def _generate_content_with_fallback(
        client: genai.Client,
        model: str,
        contents: Any,
        config: Any = None,
    ) -> Any:
        try:
            return client.models.generate_content(
                model=model,
                contents=contents,
                config=config,
            )
        except Exception as exc:
            exc_str = str(exc).lower()
            # Intercept 429, 503, quota, limit, rate, and 404 not found errors
            is_recoverable = any(
                x in exc_str for x in [
                    "429", "503", "unavailable", "quota", "exhausted",
                    "resource_exhausted", "limit", "rate", "404",
                    "not_found", "not found"
                ]
            )
            if is_recoverable:
                fallback_candidates = [
                    "gemini-3.1-flash-lite",
                    "gemini-3.5-flash-lite",
                    "gemini-3.6-flash",
                    "gemini-3.7-flash",
                ]
                candidates = [c for c in fallback_candidates if c != model]

                for candidate in candidates:
                    try:
                        logger.warning(
                            "Gemini invocation with model '%s' failed (%s). Retrying with fallback candidate '%s'...",
                            model, exc, candidate
                        )
                        return client.models.generate_content(
                            model=candidate,
                            contents=contents,
                            config=config,
                        )
                    except Exception as fallback_exc:
                        logger.warning(
                            "Fallback candidate '%s' also failed (%s). Trying next candidate...",
                            candidate, fallback_exc
                        )
                        continue

            # Unhandled or exhausted fallbacks raise 502 Bad Gateway to the backend gateway
            raise HTTPException(
                status_code=502,
                detail=f"Gemini API call failed under high demand: {exc}"
            )

    @staticmethod
    def _extract_search_keyword(
        raw_text: str,
        client: genai.Client,
        model_name: str,
        image_part: Optional[types.Part] = None,
    ) -> str:
        """
        Use Gemini to distil an artisan input (text and/or image)
        into a concise English product name suitable for HS-code vector search in Qdrant.
        """
        if image_part is not None:
            extraction_prompt = (
                "You are an expert international trade classification assistant for Dak Ghar Niryat Kendra (DNK).\n"
                "Examine this photograph of the artisan handicraft product.\n"
                f"Optional seller note: \"{raw_text}\"\n\n"
                "Rules:\n"
                "- Identify the exact physical craft item in the photo (e.g. 'Channapatna Wooden Horse Toy', "
                "'Handcrafted Brass Peacock Diya Oil Lamp', 'Blue Pottery Ceramic Vase', 'Handloom Silk Saree', "
                "'Handcrafted Wooden Toy', 'Leather Jutti Shoes', 'Darjeeling Green Tea').\n"
                "- Return ONLY the concise English trade product name for HS-code vector search.\n"
                "- Do NOT return explanations, punctuation, or generic filler.\n\n"
                "Product name:"
            )
            contents = [image_part, extraction_prompt]
        else:
            extraction_prompt = (
                "You are an international trade classification assistant for Dak Ghar Niryat Kendra (DNK).\n"
                "Given the following seller voice transcript/text (may be in Hindi, Telugu, Tamil, Kannada, or mixed language), "
                "extract ONLY the core English product name for HS code classification.\n\n"
                "Rules:\n"
                "- Return ONLY the product name — no punctuation, no explanation.\n"
                "- Use standard trade terminology (e.g. 'Fresh Mangoes', 'Handloom Cotton Saree', 'Channapatna Wooden Toy', 'Basmati Rice', 'Leather Sandals').\n"
                "- If the transcript is already in English and unambiguous, return it as-is (cleaned up).\n\n"
                f"Transcript: \"{raw_text}\"\n\n"
                "Product name:"
            )
            contents = extraction_prompt

        try:
            resp = CatalogService._generate_content_with_fallback(
                client=client,
                model=model_name,
                contents=contents,
                config=types.GenerateContentConfig(
                    temperature=0.0,        # deterministic extraction
                    max_output_tokens=32,   # product name only — keep it tight
                ),
            )
            keyword = (resp.text or "").strip().strip('"').strip()
            if keyword:
                logger.info(
                    "Keyword extraction: '%s' (has_image=%s) → '%s'",
                    raw_text[:80], image_part is not None, keyword
                )
                return keyword
        except Exception as exc:
            logger.warning(
                "Keyword extraction failed (%s: %s) — falling back to raw text.",
                type(exc).__name__, exc,
            )
        return raw_text if raw_text else "Handcrafted Indian Artisan Product"

    # ------------------------------------------------------------------ #
    # Public API                                                           #
    # ------------------------------------------------------------------ #
    @staticmethod
    async def generate_catalog(
        raw_text: str,
        qdrant: AsyncQdrantClient,
        image_base64: Optional[str] = None,
        image_mime_type: str = "image/jpeg",
    ) -> ExportCatalogResponse:
        # Step 1: Validate API key early
        api_key = settings.GEMINI_API_KEY
        if not api_key or any(
            api_key.lower().startswith(p) for p in ["your-", "aizasyyouractual"]
        ):
            raise HTTPException(
                status_code=500,
                detail="GEMINI_API_KEY is not configured in .env file.",
            )

        client = genai.Client(api_key=api_key)
        model_name = resolve_best_model(api_key)

        # Step 2: Prepare image part if provided
        image_part: Optional[types.Part] = None
        if image_base64:
            try:
                clean_b64 = image_base64
                if "," in clean_b64:
                    clean_b64 = clean_b64.split(",", 1)[1]
                image_bytes = base64.b64decode(clean_b64)
                image_part = types.Part.from_bytes(
                    data=image_bytes,
                    mime_type=image_mime_type or "image/jpeg",
                )
                logger.info(
                    "Successfully prepared image part (%d bytes, mime=%s)",
                    len(image_bytes), image_mime_type
                )
            except Exception as e:
                logger.warning("Failed to decode image_base64 (%s); continuing with text.", e)
                image_part = None

        # Step 3: Extract a clean English product keyword from image and/or text
        search_keyword = CatalogService._extract_search_keyword(
            raw_text=raw_text,
            client=client,
            model_name=model_name,
            image_part=image_part,
        )

        # Step 4: Vector search in Qdrant using the extracted trade keyword
        search_results = await HSCodeService.search_hs_codes(
            q=search_keyword, limit=1, qdrant_client=qdrant
        )

        if not search_results:
            matched_hs_code = "UNKNOWN"
            hs_score = 0.0
            hs_description = "N/A"
        else:
            top_match = search_results[0]
            matched_hs_code = top_match.payload.get("hs_code", "UNKNOWN")
            hs_score = top_match.score
            hs_description = top_match.payload.get("description", "N/A")

        # Step 5: Synthesize the export catalog with Gemini
        prompt = f"""
        You are an expert international trade catalog specialist for Dak Ghar Niryat Kendra (DNK).
        Analyze this artisan product {'photograph and ' if image_part else ''}description, then synthesize a structured export catalog JSON.

        CRITICAL REQUIREMENT:
        - The generated product title, description, and features MUST accurately describe the physical product: "{search_keyword}"{' visible in the image' if image_part else ''}.
        - Seller Input: "{raw_text if raw_text else search_keyword}"
        - Matched HS Code: {matched_hs_code} ({hs_description})

        Required JSON Keys:
        - product_title_en (string: professional, captivating export product title)
        - product_description_en (string: comprehensive product story detailing craft heritage, materials, finishing, and global appeal)
        - translated_title_local (string: Hindi or local language title)
        - category (string: e.g. "Wooden Toys & Handicrafts", "Brass & Metalware", "Textiles & Handloom", "Blue Pottery & Ceramics")
        - key_features (list of 4-5 strings detailing authentic craftsmanship, eco-friendly materials, natural colors/dyes, durability)
        - suggested_tags (list of 5-8 strings for global e-commerce SEO)
        - estimated_price_inr (integer: realistic Indian handicraft fair market price in INR, e.g. 750, 1200, 1850)
        - estimated_weight (string: realistic shipping weight, e.g. "450g", "1.2 kg")
        """

        logger.info("Generating catalog with model=%s (has_image=%s)", model_name, image_part is not None)

        if image_part is not None:
            contents = [image_part, prompt]
        else:
            contents = prompt

        try:
            response = CatalogService._generate_content_with_fallback(
                client=client,
                model=model_name,
                contents=contents,
                config=types.GenerateContentConfig(
                    response_mime_type="application/json",
                    temperature=0.2,
                ),
            )

            if response.text:
                raw_resp = response.text.strip()
                if raw_resp.startswith("```json"):
                    raw_resp = raw_resp[7:]
                elif raw_resp.startswith("```"):
                    raw_resp = raw_resp[3:]
                if raw_resp.endswith("```"):
                    raw_resp = raw_resp[:-3]
                raw_resp = raw_resp.strip()

                try:
                    parsed_json = json.loads(raw_resp)
                except Exception:
                    import re
                    sanitized = re.sub(r',\s*([\]}])', r'\1', raw_resp)
                    parsed_json = json.loads(sanitized)

                logger.info("Catalog generation succeeded with model: %s", model_name)

                # Parse price safely
                est_price = parsed_json.get("estimated_price_inr")
                if isinstance(est_price, str):
                    try:
                        import re
                        digits = re.sub(r'[^\d]', '', est_price)
                        est_price = int(digits) if digits else None
                    except Exception:
                        est_price = None

                return ExportCatalogResponse(
                    product_title_en=parsed_json.get("product_title_en", search_keyword),
                    product_description_en=parsed_json.get("product_description_en", f"Export-certified authentic {search_keyword}."),
                    translated_title_local=parsed_json.get("translated_title_local", search_keyword),
                    hs_code=matched_hs_code,
                    hs_code_confidence=hs_score,
                    category=parsed_json.get("category", "Handicrafts & Collectibles"),
                    key_features=parsed_json.get("key_features", ["Handcrafted in India", "Eco-friendly", "Authentic traditional artisan craft"]),
                    suggested_tags=parsed_json.get("suggested_tags", [search_keyword, "Indian Handicrafts", "DNK Export"]),
                    estimated_price_inr=est_price,
                    estimated_weight=parsed_json.get("estimated_weight"),
                )

            raise HTTPException(
                status_code=500,
                detail=f"Gemini model '{model_name}' returned an empty catalog response.",
            )

        except HTTPException:
            raise
        except Exception as exc:
            logger.exception("Gemini Catalog Generation Error (model=%s):", model_name)
            raise HTTPException(
                status_code=500,
                detail=f"Gemini catalog generation failed with model '{model_name}': {exc}",
            )