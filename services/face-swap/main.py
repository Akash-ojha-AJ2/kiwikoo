"""
InsightFace Face Swap Microservice

Production-grade face identity restoration for virtual try-on.
Receives a source face (original person) and target image (generated try-on),
returns the target image with the source face seamlessly composited.

Endpoints:
  POST /swap        — face swap (base64 JSON)
  GET  /health      — readiness check
"""

import os
import io
import base64
import logging
import time

import cv2
import numpy as np
from PIL import Image
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel

from swap import FaceSwapper

logging.basicConfig(level=logging.INFO, format="%(asctime)s %(levelname)s %(message)s")
logger = logging.getLogger("face-swap")

app = FastAPI(title="InsightFace Swap Service", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=os.getenv("CORS_ORIGINS", "*").split(","),
    allow_methods=["POST", "GET"],
    allow_headers=["*"],
)

swapper: FaceSwapper | None = None


@app.on_event("startup")
async def startup():
    global swapper
    logger.info("Loading InsightFace models...")
    t0 = time.time()
    swapper = FaceSwapper()
    logger.info(f"Models loaded in {time.time() - t0:.1f}s")


class SwapRequest(BaseModel):
    source_image: str       # base64 — the REAL person (identity source)
    target_image: str       # base64 — the generated try-on image (face to replace)
    face_crop: str | None = None  # base64 — optional face close-up for better detection
    source_face_index: int = 0
    target_face_index: int = 0


class SwapResponse(BaseModel):
    success: bool
    image: str              # base64 result
    processing_ms: int
    identity_similarity_before: float | None = None
    identity_similarity_after: float | None = None
    skin_tone_delta_before: float | None = None
    skin_tone_delta_after: float | None = None
    dark_spot_artifact_score_after: float | None = None
    error: str | None = None


def decode_base64_image(b64: str) -> np.ndarray:
    """Decode base64 string to OpenCV BGR numpy array."""
    clean = b64.split(",")[-1] if "," in b64 else b64
    img_bytes = base64.b64decode(clean)
    pil_img = Image.open(io.BytesIO(img_bytes)).convert("RGB")
    return cv2.cvtColor(np.array(pil_img), cv2.COLOR_RGB2BGR)


def encode_image_base64(img: np.ndarray, quality: int = 92) -> str:
    """Encode OpenCV BGR array to base64 JPEG string."""
    _, buffer = cv2.imencode(".jpg", img, [cv2.IMWRITE_JPEG_QUALITY, quality])
    return base64.b64encode(buffer).decode("utf-8")


@app.get("/health")
async def health():
    return {
        "status": "ok",
        "models_loaded": swapper is not None,
    }


@app.post("/swap", response_model=SwapResponse)
async def swap_face(req: SwapRequest):
    if swapper is None:
        raise HTTPException(503, "Models not loaded yet")

    t0 = time.time()
    try:
        source_img = decode_base64_image(req.source_image)
        target_img = decode_base64_image(req.target_image)

        source_for_detection = source_img
        if req.face_crop:
            try:
                source_for_detection = decode_base64_image(req.face_crop)
            except Exception:
                pass

        result, metrics = swapper.swap(
            source_img=source_img,
            target_img=target_img,
            source_for_detection=source_for_detection,
            source_face_index=req.source_face_index,
            target_face_index=req.target_face_index,
        )

        elapsed_ms = int((time.time() - t0) * 1000)
        result_b64 = encode_image_base64(result)

        logger.info(f"Swap completed in {elapsed_ms}ms")
        return SwapResponse(
            success=True,
            image=result_b64,
            processing_ms=elapsed_ms,
            identity_similarity_before=metrics.get("identity_similarity_before"),
            identity_similarity_after=metrics.get("identity_similarity_after"),
            skin_tone_delta_before=metrics.get("skin_tone_delta_before"),
            skin_tone_delta_after=metrics.get("skin_tone_delta_after"),
            dark_spot_artifact_score_after=metrics.get("dark_spot_artifact_score_after"),
        )

    except ValueError as e:
        elapsed_ms = int((time.time() - t0) * 1000)
        logger.warning(f"Swap failed: {e}")
        return SwapResponse(success=False, image="", processing_ms=elapsed_ms, error=str(e))
    except Exception as e:
        elapsed_ms = int((time.time() - t0) * 1000)
        logger.error(f"Swap error: {e}", exc_info=True)
        raise HTTPException(500, f"Face swap failed: {e}")
