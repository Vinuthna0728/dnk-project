import rembg
import logging

logger = logging.getLogger(__name__)

class ONNXModelManager:
    def __init__(self):
        self._session = None

    def initialize(self):
        # Startup hook - fast no-op or background warmup
        logger.info("ONNXModelManager initialized.")

    @property
    def session(self):
        if self._session is None:
            try:
                self._session = rembg.new_session("u2netp")
            except Exception as e:
                logger.warning(f"ONNX u2netp session deferred or offline: {e}")
                self._session = None
        return self._session

onnx_worker = ONNXModelManager()
