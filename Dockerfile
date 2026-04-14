# Build stage
FROM node:20-alpine AS builder
WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY . .
RUN npm run build:staging

# Runtime stage
# FROM nginx:alpine
# COPY ./nginx.conf /etc/nginx/nginx.conf
# COPY --from=builder /app/dist /usr/share/nginx/html
# EXPOSE 80
# CMD ["nginx", "-g", "daemon off;"]

FROM nginx:alpine

WORKDIR /etc/nginx

COPY ./nginx.conf /etc/nginx/nginx.http.conf.template
COPY ./nginx.ssl.conf /etc/nginx/nginx.ssl.conf.template
COPY ./scripts/start-nginx.sh /start-nginx.sh

RUN chmod +x /start-nginx.sh

COPY --from=builder /app/dist /usr/share/nginx/html

EXPOSE 80
EXPOSE 443

CMD ["/start-nginx.sh"]
