FROM python:3.11-slim

WORKDIR /app

# Ensure Python output is sent straight to logs without buffering
# This was causing startup prints to appear AFTER shutdown in Hugging Face logs
ENV PYTHONUNBUFFERED=1
ENV PYTHONDONTWRITEBYTECODE=1

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY . .

RUN mkdir -p /app/data

ENV NEO4J_URI=""
ENV NEO4J_USERNAME=""
ENV NEO4J_PASSWORD=""

EXPOSE ${PORT:-7860}

# Use PORT env var (Railway sets this), fallback to 7860 for local dev
CMD uvicorn main:app --host 0.0.0.0 --port ${PORT:-7860} --workers 1 --log-level info --timeout-keep-alive 75