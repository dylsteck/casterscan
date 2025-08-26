FROM oven/bun:latest

# Install system dependencies for gRPC and SSL connections
RUN apt-get update && apt-get install -y \
    ca-certificates \
    curl \
    dnsutils \
    && rm -rf /var/lib/apt/lists/*

# Update CA certificates for SSL/TLS connections
RUN update-ca-certificates

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
