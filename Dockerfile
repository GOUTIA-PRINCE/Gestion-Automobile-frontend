# etape 1: build de l'application angular
FROM node:20-alpine AS build
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build 

# etape 2: build de l'image finale
FROM nginx:alpine
COPY --from=build /app/dist/licence-pro/browser /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]