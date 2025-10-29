# --- build ---
    FROM node:20-alpine AS build
    WORKDIR /app
    COPY package.json package-lock.json* pnpm-lock.yaml* yarn.lock* ./
    RUN \
      if [ -f package-lock.json ]; then npm ci; \
      elif [ -f pnpm-lock.yaml ]; then npm i -g pnpm && pnpm i --frozen-lockfile; \
      elif [ -f yarn.lock ]; then yarn install --frozen-lockfile; \
      else npm i; fi
    COPY . .
    # VITE_API_BASE vem do docker-compose como ARG
    ARG VITE_API_BASE=/api/v1
    ENV VITE_API_BASE=$VITE_API_BASE
    RUN npm run build
    
    # --- serve estático ---
    FROM nginx:alpine
    COPY --from=build /app/dist /usr/share/nginx/html
    # SPA fallback (histórico)
    RUN printf 'server {\n  listen 80;\n  server_name _;\n  root /usr/share/nginx/html;\n  index index.html;\n  location / {\n    try_files $uri /index.html;\n  }\n}\n' > /etc/nginx/conf.d/default.conf
    EXPOSE 80
    