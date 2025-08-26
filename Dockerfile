FROM oven/bun:latest

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
