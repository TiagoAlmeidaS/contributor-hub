FROM oven/bun:latest

WORKDIR /app

COPY package.json bun.lockb ./
RUN bun install --frozen-lockfile

COPY backend/src ./src

EXPOSE 4000

CMD ["bun", "run", "src/index.ts"]
