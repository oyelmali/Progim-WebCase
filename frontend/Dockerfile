# Build aşaması
FROM node:18-alpine as build

WORKDIR /app

# Package dosyalarını kopyala ve bağımlılıkları 
COPY package*.json ./
RUN npm ci

# Uygulama dosyaları ve build
COPY . .
RUN npm run build

# Production aşaması
FROM nginx:alpine

# Build edilmiş dosyaları nginx'e kopyalama
COPY --from=build /app/dist /usr/share/nginx/html

# Nginx konfigürasyonu
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]