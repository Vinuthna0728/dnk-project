import os
from google import genai
from dotenv import load_dotenv

load_dotenv()

class GeminiManager:
    def __init__(self):
        self.client = None
        self.vision_model = "gemini-2.5-flash"

    def initialize(self):
        api_key = os.getenv("GEMINI_API_KEY")
        if api_key:
            try:
                self.client = genai.Client(api_key=api_key)
            except Exception as e:
                print(f"Warning: Gemini Client init error: {e}")
                self.client = None
        else:
            self.client = None

gemini_worker = GeminiManager()
