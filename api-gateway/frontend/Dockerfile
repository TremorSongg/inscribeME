# ── Stage 1: Build ────────────────────────────────────────────
FROM node:20-alpine AS build

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .
RUN npm run build

# ── Stage 2: Nginx ─────────────────────────────────────────────
FROM nginx:1.27-alpine

# Elimina la config por defecto de nginx
RUN rm /etc/nginx/conf.d/default.conf

# Copia la config personalizada para SPA
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Copia el build de Vite
COPY --from=build /app/dist /usr/share/nginx/html

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
