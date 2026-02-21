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
FROM nginx:alpine

# Copy your template
COPY ./nginx.conf /etc/nginx/templates/default.conf.template

# Copy frontend build
COPY --from=builder /app/dist /usr/share/nginx/html

EXPOSE 80
# Replace environment variables in the template and write to actual config
CMD envsubst '$VITE_API_PROTOCOL $VITE_API_HOST $VITE_API_PORT $VITE_API_BASE_PATH' \
    < /etc/nginx/templates/default.conf.template \
    > /etc/nginx/conf.d/default.conf && nginx -g 'daemon off;'

# CMD ["nginx", "-g", "daemon off;"]
