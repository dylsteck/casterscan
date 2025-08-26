FROM oven/bun:latest

# Install system dependencies for gRPC and SSL connections
RUN apt-get update && apt-get install -y \
    ca-certificates \
    curl \
    dnsutils \
    netcat-traditional \
    && rm -rf /var/lib/apt/lists/*

# Update CA certificates for SSL/TLS connections
RUN update-ca-certificates

# Create a healthcheck script for gRPC connectivity
RUN echo '#!/bin/bash\n\
# Test basic connectivity to Farcaster gRPC endpoint\n\
echo "Testing connectivity to snap.farcaster.xyz:3383..."\n\
nc -z -w5 snap.farcaster.xyz 3383 && echo "✅ gRPC endpoint reachable" || echo "❌ gRPC endpoint not reachable"\n\
echo "Testing connectivity to snap.farcaster.xyz:3381..."\n\
nc -z -w5 snap.farcaster.xyz 3381 && echo "✅ HTTP endpoint reachable" || echo "❌ HTTP endpoint not reachable"\n\
' > /usr/local/bin/connectivity-test && chmod +x /usr/local/bin/connectivity-test

WORKDIR /app

COPY package.json bun.lock ./
COPY client/package.json ./client/
COPY server/package.json ./server/
COPY shared/package.json ./shared/

COPY . .

RUN bun install

RUN bun run build:single

EXPOSE 3000
ENV NODE_ENV=production
CMD ["bun", "run", "start:single"]
