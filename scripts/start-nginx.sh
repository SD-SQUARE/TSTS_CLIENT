#!/bin/sh
set -eu

CERT_FILE="/etc/nginx/certs/${SSL_CERT_FILE:-staging.myapp.local.pem}"
KEY_FILE="/etc/nginx/certs/${SSL_KEY_FILE:-staging.myapp.local-key.pem}"
TEMPLATE="/etc/nginx/nginx.http.conf.template"

if [ -f "$CERT_FILE" ] && [ -f "$KEY_FILE" ]; then
  TEMPLATE="/etc/nginx/nginx.ssl.conf.template"
fi

envsubst '$VITE_API_PROTOCOL $VITE_API_HOST $VITE_API_PORT $VITE_API_BASE_PATH $SSL_CERT_FILE $SSL_KEY_FILE' \
  < "$TEMPLATE" \
  > /etc/nginx/nginx.conf

exec nginx -g 'daemon off;'
