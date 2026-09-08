import os

import httpx
from fastapi import HTTPException


PEXELS_SEARCH_URL = "https://api.pexels.com/v1/search"


async def search_pexels_image(query: str):
    api_key = os.getenv("PEXELS_API_KEY")

    if not api_key:
        raise HTTPException(
            status_code=500,
            detail="PEXELS_API_KEY is not configured",
        )

    query = query.strip()

    if not query:
        return None

    search_query = f"{query} traditional Indian handicraft"

    headers = {
        "Authorization": api_key,
    }

    params = {
        "query": search_query,
        "per_page": 5,
        "orientation": "square",
    }

    async with httpx.AsyncClient(timeout=15.0) as client:
        response = await client.get(
            PEXELS_SEARCH_URL,
            headers=headers,
            params=params,
        )

    response.raise_for_status()

    data = response.json()
    photos = data.get("photos", [])

    if not photos:
        return None

    photo = photos[0]

    return {
        "image_url": photo["src"]["medium"],
        "photo_page_url": photo["url"],
        "photographer": photo["photographer"],
        "photographer_url": photo["photographer_url"],
    }