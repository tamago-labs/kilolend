FROM python:3.9-slim

# Install system dependencies
RUN apt-get update && apt-get install -y \
    gcc \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app

# Copy requirements first for better caching
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy application
COPY app.py .

# Create non-root user for security
RUN useradd -m -u 1000 enclave
USER enclave

# Expose port (though vsock doesn't use traditional networking)
EXPOSE 5000

# Run the application
CMD ["python", "-u", "app.py"]