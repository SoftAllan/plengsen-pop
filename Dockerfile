# One Dockerfile for development and deployment.
FROM node:24-alpine AS development
WORKDIR /app
EXPOSE 5173
# compose.yaml mounts the source here. Dependencies stay in a named volume.
# The first start also writes package-lock.json into the project directory.
CMD ["sh", "-c", "npm install --no-audit --no-fund && npm run dev"]

FROM node:24-alpine AS build
WORKDIR /app
COPY package*.json ./
RUN if [ -f package-lock.json ]; then npm ci --no-audit --no-fund; else npm install --no-audit --no-fund; fi
COPY index.html vite.config.js LICENSE ./
COPY src ./src
COPY public ./public
COPY scripts ./scripts
RUN npm run build

FROM nginx:stable-alpine AS production
COPY docker/nginx.conf /etc/nginx/nginx.conf
COPY --from=build /app/dist /usr/share/nginx/html
USER nginx
EXPOSE 8080
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD wget -q -O /dev/null http://127.0.0.1:8080/ || exit 1
ENTRYPOINT ["nginx"]
CMD ["-g", "daemon off;"]
