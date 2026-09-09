import cv2
import numpy as np
from rembg import remove
from app.core.onnx_session import onnx_worker

def apply_adaptive_lighting(bgr_image):
    lab = cv2.cvtColor(bgr_image, cv2.COLOR_BGR2LAB)
    l_channel, a, b = cv2.split(lab)
    clahe = cv2.createCLAHE(clipLimit=2.0, tileGridSize=(8, 8))
    cl = clahe.apply(l_channel)
    merged_lab = cv2.merge((cl, a, b))
    enhanced_bgr = cv2.cvtColor(merged_lab, cv2.COLOR_LAB2BGR)
    return enhanced_bgr

def hex_to_bgr(hex_color):
    hex_color = hex_color.lstrip('#')
    rgb = tuple(int(hex_color[i:i+2], 16) for i in (0, 2, 4))
    return rgb[::-1]

def process_studio_image(input_image_bytes: bytes, apply_shadow: bool = True, bg_color: str = "#FFFFFF") -> bytes:
    nparr_test = np.frombuffer(input_image_bytes, np.uint8)
    img_test = cv2.imdecode(nparr_test, cv2.IMREAD_UNCHANGED)
    if img_test is None:
        raise ValueError("Invalid or corrupted image file provided.")

    try:
        if onnx_worker.session is not None:
            cutout_bytes = remove(input_image_bytes, session=onnx_worker.session)
        else:
            cutout_bytes = remove(input_image_bytes)

        nparr = np.frombuffer(cutout_bytes, np.uint8)
        img = cv2.imdecode(nparr, cv2.IMREAD_UNCHANGED)

        if img is not None and len(img.shape) == 3 and img.shape[2] == 4:
            bgr = img[:, :, :3]
            alpha = img[:, :, 3]
        else:
            bgr = img_test[:, :, :3] if len(img_test.shape) == 3 else cv2.cvtColor(img_test, cv2.COLOR_GRAY2BGR)
            alpha = np.full((bgr.shape[0], bgr.shape[1]), 255, dtype=np.uint8)

        enhanced_bgr = apply_adaptive_lighting(bgr)

        TARGET_SIZE = 1024
        MARGIN_PX = int(TARGET_SIZE * 0.08)
        MAX_DIM = TARGET_SIZE - (MARGIN_PX * 2)

        h, w = enhanced_bgr.shape[:2]
        scale = min(MAX_DIM / max(w, 1), MAX_DIM / max(h, 1))
        new_w, new_h = max(int(w * scale), 1), max(int(h * scale), 1)

        resized_bgr = cv2.resize(enhanced_bgr, (new_w, new_h), interpolation=cv2.INTER_AREA)
        resized_alpha = cv2.resize(alpha, (new_w, new_h), interpolation=cv2.INTER_AREA)

        bg_bgr = hex_to_bgr(bg_color)
        canvas = np.full((TARGET_SIZE, TARGET_SIZE, 3), bg_bgr, dtype=np.uint8)

        x_offset = (TARGET_SIZE - new_w) // 2
        y_offset = (TARGET_SIZE - new_h) // 2

        if apply_shadow:
            shadow_mask = cv2.GaussianBlur(resized_alpha, (45, 45), 0)
            shadow_mask = shadow_mask.astype(float) / 255.0
            shadow_offset_y = 15

            y_start = min(y_offset + shadow_offset_y, TARGET_SIZE)
            y_end = min(y_offset + new_h + shadow_offset_y, TARGET_SIZE)
            x_start = min(x_offset, TARGET_SIZE)
            x_end = min(x_offset + new_w, TARGET_SIZE)

            sh_h = y_end - y_start
            sh_w = x_end - x_start

            if sh_h > 0 and sh_w > 0:
                for c in range(3):
                    canvas[y_start:y_end, x_start:x_end, c] = (
                        canvas[y_start:y_end, x_start:x_end, c] * (1 - shadow_mask[:sh_h, :sh_w] * 0.6)
                    ).astype(np.uint8)

        alpha_factor = (resized_alpha.astype(float) / 255.0)[:, :, np.newaxis]
        canvas[y_offset:y_offset+new_h, x_offset:x_offset+new_w] = (
            alpha_factor * resized_bgr + (1 - alpha_factor) * canvas[y_offset:y_offset+new_h, x_offset:x_offset+new_w]
        ).astype(np.uint8)

        encode_param = [int(cv2.IMWRITE_WEBP_QUALITY), 85]
        _, encoded_webp = cv2.imencode('.webp', canvas, encode_param)
        return encoded_webp.tobytes()

    except Exception as e:
        raw_img = img_test[:, :, :3] if len(img_test.shape) == 3 else cv2.cvtColor(img_test, cv2.COLOR_GRAY2BGR)
        corrected = apply_adaptive_lighting(raw_img)
        encode_param = [int(cv2.IMWRITE_WEBP_QUALITY), 85]
        _, encoded_webp = cv2.imencode('.webp', corrected, encode_param)
        return encoded_webp.tobytes()
