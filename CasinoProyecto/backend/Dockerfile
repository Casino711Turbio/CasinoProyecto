# Backend Dockerfile - Multi-stage build
FROM python:3.9-slim as builder

WORKDIR /app

# Instalar dependencias de compilación SOLO en etapa de build
RUN apt-get update && \
    apt-get install -y --no-install-recommends \
    gcc \
    g++ \
    default-libmysqlclient-dev \
    pkg-config && \
    rm -rf /var/lib/apt/lists/*

# Copiar e instalar dependencias Python
COPY requirements.txt .
RUN pip install --user --no-cache-dir -r requirements.txt

# Etapa final - imagen limpia
FROM python:3.9-slim

WORKDIR /app

# Instalar solo runtime dependencies
RUN apt-get update && \
    apt-get install -y --no-install-recommends \
    default-mysql-client \
    && rm -rf /var/lib/apt/lists/* \
    && apt-get clean

# Copiar dependencias instaladas desde la etapa builder
COPY --from=builder /root/.local /root/.local

# Asegurar que Python encuentre las dependencias
ENV PATH=/root/.local/bin:$PATH
ENV PYTHONPATH=/app

# Copiar código de la aplicación
COPY . .

# Crear usuario no-root para seguridad
RUN useradd --create-home --shell /bin/bash appuser && \
    chown -R appuser:appuser /app
USER appuser

# Exponer puerto
EXPOSE 8000

# Comando de ejecución
CMD ["python", "manage.py", "runserver", "0.0.0.0:8000"]