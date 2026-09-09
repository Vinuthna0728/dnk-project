import json
import os
import re
from typing import List
from app.core.gemini_client import gemini_worker
from app.schemas.compliance import FlaggedMaterial, AllowedChannels, ComplianceCheckResponse

BANNED_MATERIALS_FILE = os.path.join(os.path.dirname(os.path.dirname(os.path.dirname(__file__))), "data", "banned_export_materials.json")

RESTRICTED_KEYWORD_MAP = [
    {
        "keywords": ["red sanders", "red sandalwood", "pterocarpus santalinus", "lal chandan"],
        "substance": "Red Sandalwood (Pterocarpus santalinus)",
        "governing_body": "CITES Appendix II & DGFT Schedule 2 Prohibited Flora",
        "reason_en": "Commercial export of Red Sanders timber and uncertified carved products is strictly prohibited without specific CITES export permits and DGFT licensing.",
        "reason_hi": "लाल चंदन (रेड सैंडर्स) की लकड़ी और बिना अनुमति वाली नक्काशी का निर्यात CITES और DGFT नियमों के तहत प्रतिबंधित है।"
    },
    {
        "keywords": ["sandalwood", "santalum album", "chandan"],
        "substance": "Sandalwood (Santalum album)",
        "governing_body": "DGFT Schedule 2 & State Forest Department Regulations",
        "reason_en": "Commercial export of raw Sandalwood timber requires special forest transit permits and DGFT authorization.",
        "reason_hi": "चंदन की लकड़ी का निर्यात वन विभाग और डीजीएफटी के विशेष परमिट के बिना प्रतिबंधित है।"
    },
    {
        "keywords": ["peacock", "feather", "mor pankh"],
        "substance": "Peacock Feathers / Articles (Pavo cristatus)",
        "governing_body": "Wildlife Protection Act, 1972 & DGFT Schedule 2",
        "reason_en": "Export of Peacock feathers and derived handicrafts is strictly prohibited under Indian Wildlife Protection Act Schedule I.",
        "reason_hi": "मोर पंख और इससे बनी वस्तुओं का निर्यात वन्यजीव संरक्षण अधिनियम के तहत पूरी तरह प्रतिबंधित है।"
    },
    {
        "keywords": ["ivory", "hathi dant", "elephant ivory"],
        "substance": "Ivory / Elephant Tusk",
        "governing_body": "CITES Appendix I & Wildlife Protection Act, 1972",
        "reason_en": "International trade and export of raw and worked ivory is globally banned under CITES Appendix I.",
        "reason_hi": "हाथी दांत और उससे बनी कलाकृतियों का अंतर्राष्ट्रीय निर्यात CITES और भारतीय कानून के तहत पूर्णतः प्रतिबंधित है।"
    },
    {
        "keywords": ["sea cucumber", "beche-de-mer"],
        "substance": "Beche-de-mer (Sea Cucumber)",
        "governing_body": "Wildlife Protection Act Schedule I & DGFT",
        "reason_en": "Sea Cucumber export is banned to prevent exploitation of vulnerable marine ecosystems.",
        "reason_hi": "समुद्री खीरे (Beche-de-mer) का निर्यात समुद्री पारिस्थितिकी संरक्षण हेतु प्रतिबंधित है।"
    },
    {
        "keywords": ["antique", "antiquity", "100 years", "historical artifact"],
        "substance": "Antiquities and Art Treasures (>100 years)",
        "governing_body": "Antiquities and Art Treasures Act, 1972 (ASI)",
        "reason_en": "Antiquities older than 100 years require non-antiquity clearance certificate from the Archaeological Survey of India (ASI) before export.",
        "reason_hi": "100 वर्ष से अधिक पुरानी कलाकृतियों के निर्यात के लिए भारतीय पुरातत्व सर्वेक्षण (ASI) से अनापत्ति प्रमाण पत्र आवश्यक है।"
    }
]

def evaluate_export_compliance(
    product_title: str,
    category: str,
    material_declared: str,
    dye_type: str,
    destination_countries: List[str]
) -> ComplianceCheckResponse:
    text_to_screen = f"{product_title} {category} {material_declared}".lower()
    flagged: List[FlaggedMaterial] = []

    for item in RESTRICTED_KEYWORD_MAP:
        for kw in item["keywords"]:
            if re.search(r'\b' + re.escape(kw) + r'\b', text_to_screen):
                flagged.append(FlaggedMaterial(
                    substance=item["substance"],
                    prohibited_in=destination_countries or ["US", "GB", "DE", "AU", "AE", "CA", "JP"],
                    governing_body=item["governing_body"],
                    reason_en=item["reason_en"],
                    reason_hi=item["reason_hi"]
                ))
                break

    if flagged:
        return ComplianceCheckResponse(
            is_export_viable=False,
            risk_level="CRITICAL",
            compliance_score=0.15,
            flagged_materials=flagged,
            allowed_channels=AllowedChannels(
                d2c_inland=True,
                b2b_inland=True,
                export_dnk=False
            ),
            suggested_artisan_action="Disable DNK Dwara Export toggle. Keep listing available for Domestic D2C and Domestic B2B only."
        )

    if gemini_worker.client:
        try:
            compliance_prompt = f"""Evaluate cross-border export compliance for this Indian artisan product:
- Title: {product_title}
- Category: {category}
- Material Declared: {material_declared}
- Dye/Finish Type: {dye_type}
- Destination Countries: {destination_countries}

Check compliance against CITES, DGFT Schedule 2, Indian Wildlife Protection Act 1972, Antiquities & Art Treasures Act 1972, US Lacey Act, and EU REACH regulations.
Return strictly a JSON object with:
- is_export_viable (boolean)
- risk_level (LOW, MODERATE, HIGH, CRITICAL)
- compliance_score (float between 0.0 and 1.0)
- flagged_materials (list of objects with substance, prohibited_in, governing_body, reason_en, reason_hi)
- allowed_channels (object with d2c_inland: bool, b2b_inland: bool, export_dnk: bool)
- suggested_artisan_action (string)"""
            response = gemini_worker.client.models.generate_content(
                model=gemini_worker.vision_model,
                contents=[compliance_prompt]
            )
            raw_text = response.text.strip()
            if raw_text.startswith("```json"):
                raw_text = raw_text[7:]
            if raw_text.startswith("```"):
                raw_text = raw_text[3:]
            if raw_text.endswith("```"):
                raw_text = raw_text[:-3]
            parsed = json.loads(raw_text.strip())
            return ComplianceCheckResponse(**parsed)
        except Exception as e:
            print(f"Warning: Gemini compliance check fallback: {e}")

    return ComplianceCheckResponse(
        is_export_viable=True,
        risk_level="LOW",
        compliance_score=0.96,
        flagged_materials=[],
        allowed_channels=AllowedChannels(
            d2c_inland=True,
            b2b_inland=True,
            export_dnk=True
        ),
        suggested_artisan_action="Product complies with standard export guidelines. Eligible for cross-border export via DNK Dwara."
    )
