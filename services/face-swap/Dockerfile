FROM python:3.12-slim

RUN apt-get update && apt-get install -y --no-install-recommends \
    libgl1 \
    libglib2.0-0 \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# The service downloads buffalo_l ONNX models lazily at startup.
# `inswapper_128.onnx` still needs to be mounted or baked into the image via
# INSIGHTFACE_MODEL_DIR /app/.insightface or services/face-swap/models.

COPY . .

ENV PORT=8000

EXPOSE 8000

CMD ["sh", "-c", "uvicorn main:app --host 0.0.0.0 --port ${PORT}"]
