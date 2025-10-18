# frontend/Dockerfile
FROM node:16-alpine as build

WORKDIR /app

# Copiar package.json e instalar dependencias
COPY package*.json ./
RUN npm ci --only=production

# Copiar código y construir
COPY . .
RUN npm run build

# Stage de producción
FROM nginx:alpine
COPY --from=build /app/build /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]