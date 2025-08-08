FROM node:20-alpine

# Install artillery and netcat for health checks
RUN npm install -g artillery@latest && \
    apk add --no-cache netcat-openbsd

# Set working directory
WORKDIR /app

# Copy test files
COPY . .

# Make the script executable
RUN chmod +x run-load-test.sh

# Default command
CMD ["./run-load-test.sh"]
