FROM python:3.10-slim AS builder
WORKDIR /app
COPY requirements.txt .
RUN pip install --no-cache-dir --only-binary=all -r requirements.txt \
    && rm -rf /root/.cache /tmp/*

FROM python:3.10-slim
# ✅ CORRECT TESSERACT PACKAGES (no libtesseract4)
RUN apt-get update && apt-get install -y \
    tesseract-ocr \
    libtesseract-dev \
    libgomp1 \
    && rm -rf /var/lib/apt/lists/* 

WORKDIR /app
ENV TRANSFORMERS_CACHE=/tmp \
    HF_HOME=/tmp \
    ONNX_CACHE=/tmp

# Copy ONLY runtime packages
COPY --from=builder /usr/local/ /usr/local/
COPY . .

EXPOSE 10000
CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "10000"]
