# src/backend/Dockerfile
FROM python:3.12-slim

ENV PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1 \
    PIP_NO_CACHE_DIR=1

WORKDIR /app

# deps de build (se necessário para wheels)
RUN apt-get update && apt-get install -y --no-install-recommends build-essential && rm -rf /var/lib/apt/lists/*

# requisitos
COPY requirements.txt /app/requirements.txt
RUN pip install --upgrade pip && pip install -r /app/requirements.txt

# código
COPY . /app

# porta interna
EXPOSE 8000

# arrancar via compose (lá definimos --root-path /api/v1)
CMD ["uvicorn", "apps.api_main:app", "--host", "0.0.0.0", "--port", "8000", "--proxy-headers"]
