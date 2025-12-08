# Frontend Dockerfile
FROM node:16-alpine as builder

# Establecer directorio de trabajo CORRECTO
WORKDIR /app

# Copiar package.json desde la ubicación correcta
COPY casino-frontend/package*.json ./

RUN npm install

# Copiar el código fuente desde la subcarpeta
COPY casino-frontend/ .

RUN npm run build

# Etapa de producción
FROM nginx:alpine

# Copiar los archivos construidos
COPY --from=builder /app/build /usr/share/nginx/html

# Copiar configuración de nginx si es necesaria
# COPY nginx.conf /etc/nginx/nginx.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]