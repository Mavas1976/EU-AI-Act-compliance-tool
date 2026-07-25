# Build stage
FROM node:20-slim AS build
WORKDIR /app
COPY . .
ARG VITE_API_BASE_URL
ENV VITE_API_BASE_URL=${VITE_API_BASE_URL}
RUN if [ -d "source-repo" ]; then cd source-repo && npm install --legacy-peer-deps && npm run build && cp -r dist /app/dist; else npm install --legacy-peer-deps && npm run build; fi

# Production stage - Clean Nginx SPA server
FROM nginx:alpine AS production
COPY --from=build /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
