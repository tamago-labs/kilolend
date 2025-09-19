FROM python:3.9-alpine

# Install minimal required packages
RUN apk add --no-cache \
    gcc \
    musl-dev \
    libffi-dev

# Create application directory
WORKDIR /app

# Copy enclave application
COPY kilolend_enclave.py /app/kilolend_enclave.py

# Set executable permissions
RUN chmod +x kilolend_enclave.py

# Expose the vsock port (for documentation)
EXPOSE 5005

# Run the enclave server
CMD ["python3", "kilolend_enclave.py"]