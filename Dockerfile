# Usa una imagen base de Node para construir el frontend
FROM node:18-alpine AS build

WORKDIR /app

# Copia archivos y ejecuta la instalación
COPY package.json package-lock.json ./
RUN npm install

# Copia el código fuente y construye la aplicación
COPY . .
RUN npm run build

# Usa Nginx para servir la aplicación
FROM nginx:stable-alpine

# Copia la configuración de Nginx en la ubicación correcta
COPY ./nginx/nginx.conf /etc/nginx/conf.d/default.conf


# Copia la aplicación al servidor Nginx
COPY --from=build /app/dist /usr/share/nginx/html

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
