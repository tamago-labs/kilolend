FROM python:3.7.9-alpine3.12

# Create application directory
WORKDIR /app

# Copy enclave application
COPY kilolend_enclave.py .

# Run the enclave server
CMD ["/usr/local/bin/python3", "kilolend_enclave.py"]
