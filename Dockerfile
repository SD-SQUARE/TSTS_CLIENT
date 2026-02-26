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

COPY ./nginx.conf /etc/nginx/nginx.conf.template
COPY --from=builder /app/dist /usr/share/nginx/html
COPY /opt/tsts-project/certs /etc/nginx/certs

EXPOSE 80
EXPOSE 443

CMD envsubst '$VITE_API_PROTOCOL $VITE_API_HOST $VITE_API_PORT $VITE_API_BASE_PATH' \
    < /etc/nginx/nginx.conf.template \
    > /etc/nginx/nginx.conf && nginx -g 'daemon off;'