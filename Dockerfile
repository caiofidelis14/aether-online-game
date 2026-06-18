FROM node:22-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

FROM node:22-alpine
WORKDIR /app
COPY server/package*.json ./server/
RUN cd server && npm ci --omit=dev
COPY --from=builder /app/dist ./dist
COPY server ./server
EXPOSE 3001
ENV PORT=3001
CMD ["node", "server/server.mjs"]
