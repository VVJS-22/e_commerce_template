# ── Slim image: pre-built artifacts only ─────────────────────
FROM node:20-alpine

RUN addgroup -S appgroup && adduser -S appuser -G appgroup

WORKDIR /app

# Copy pre-built backend (single bundled file from ncc)
COPY backend/dist/ ./backend/dist/

# Copy pre-built frontend
COPY frontend/dist/ ./frontend/dist/

# Create logs directory
RUN mkdir -p /app/backend/logs && chown -R appuser:appgroup /app

USER appuser

WORKDIR /app/backend

ENV NODE_ENV=production
ENV PORT=8080

EXPOSE 8080

CMD ["node", "dist/index.js"]
