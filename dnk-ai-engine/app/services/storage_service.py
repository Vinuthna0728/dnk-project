import os
import hashlib
import time
import aiofiles
from fastapi import UploadFile

async def save_raw_image(file: UploadFile, artisan_id: str) -> str:
    timestamp = str(int(time.time()))
    hash_str = hashlib.sha256(f"{artisan_id}{timestamp}".encode()).hexdigest()

    file_path = f"static/raw/artisan_{artisan_id}_{hash_str}.webp"
    os.makedirs(os.path.dirname(file_path), exist_ok=True)

    async with aiofiles.open(file_path, "wb") as f:
        content = await file.read()
        await f.write(content)

    return file_path
