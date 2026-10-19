FROM node:22-alpine AS build
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build
RUN cp /app/dist/licence-pro/browser/index.csr.html /app/dist/licence-pro/browser/index.html

FROM nginx:alpine
COPY nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=build /app/dist/licence-pro/browser /usr/share/nginx/html
EXPOSE 80
