# Build stage
FROM node:20-slim AS build
WORKDIR /app
COPY . .
ARG VITE_API_BASE_URL
ENV VITE_API_BASE_URL=${VITE_API_BASE_URL}
RUN if [ -d "source-repo" ]; then cd source-repo && npm install --legacy-peer-deps && npm run build && cp -r dist /app/dist; else npm install --legacy-peer-deps && npm run build; fi

# Production stage - Nginx static server with dynamic PORT substitution
FROM nginx:alpine AS production
ENV PORT=80
COPY --from=build /app/dist /usr/share/nginx/html
COPY default.conf.template /etc/nginx/templates/default.conf.template
EXPOSE 80 3000
CMD ["nginx", "-g", "daemon off;"]
