import os
from app.core.gemini_client import gemini_worker

_clip_model = None
_clip_preprocess = None
_clip_tokenizer = None

def _get_clip_resources():
    global _clip_model, _clip_preprocess, _clip_tokenizer
    if _clip_model is None:
        try:
            import torch
            import open_clip
            _clip_model, _, _clip_preprocess = open_clip.create_model_and_transforms('ViT-B-32', pretrained='laion2b_s34b_b79k')
            _clip_tokenizer = open_clip.get_tokenizer('ViT-B-32')
        except Exception as e:
            _clip_model = False
    return _clip_model, _clip_preprocess, _clip_tokenizer

def extract_visual_tags(image_path: str):
    prompt = """Analyze this artisan product image and extract:
1. Primary Craft Family (e.g., Handloom Weaving, Terracotta Pottery, Brass Inlay)
2. Visual Motif / Pattern
3. Dominant Color Palette (Hex codes)
Return strictly as a JSON object."""
    if not gemini_worker.client:
        return '{"primary_craft": "Wood Carving/Handicraft", "visual_motif": "Geometric", "dominant_colors": ["#4A2C11", "#8D5B28"]}'
    try:
        sample_file = gemini_worker.client.files.upload(file=image_path)
        response = gemini_worker.client.models.generate_content(
            model=gemini_worker.vision_model,
            contents=[sample_file, prompt]
        )
        return response.text
    except Exception as e:
        return '{"primary_craft": "Wood Carving/Handicraft", "visual_motif": "Geometric", "dominant_colors": ["#4A2C11", "#8D5B28"]}'

def generate_visual_embedding(image):
    model, preprocess, _ = _get_clip_resources()
    if not model or preprocess is None:
        return [0.0] * 512
    try:
        import torch
        with torch.no_grad():
            image_tensor = preprocess(image).unsqueeze(0)
            image_features = model.encode_image(image_tensor)
            image_features /= image_features.norm(dim=-1, keepdim=True)
        return image_features.squeeze().tolist()
    except Exception:
        return [0.0] * 512
