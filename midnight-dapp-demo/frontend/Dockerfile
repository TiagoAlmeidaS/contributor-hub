FROM oven/bun:latest

WORKDIR /app

COPY frontend/package.json frontend/bun.lockb ./
RUN bun install --frozen-lockfile

COPY frontend/src ./src
COPY frontend/index.html ./
COPY frontend/vite.config.ts ./

EXPOSE 3000

CMD ["bun", "run", "dev", "--host", "0.0.0.0"]
