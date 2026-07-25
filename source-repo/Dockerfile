# Build stage
FROM node:20-slim AS build
WORKDIR /app
COPY . .
ARG VITE_API_BASE_URL
ENV VITE_API_BASE_URL=${VITE_API_BASE_URL}
RUN if [ -d "source-repo" ]; then cd source-repo && npm install --legacy-peer-deps && npm run build && cp -r dist /app/dist; else npm install --legacy-peer-deps && npm run build; fi

# Production stage - Node.js static server
FROM node:20-slim AS production
WORKDIR /app
COPY --from=build /app/dist ./dist
COPY server.js ./
EXPOSE 3000
CMD ["node", "server.js"]
