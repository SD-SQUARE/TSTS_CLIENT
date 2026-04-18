#!/bin/sh
set -eu

# If SSL_CERT_FILE is not provided, try to find a .pem file in /etc/nginx/certs (excluding rootCA.pem)
if [ -z "${SSL_CERT_FILE:-}" ]; then
  FOUND_CERT=$(ls /etc/nginx/certs/*.pem 2>/dev/null | grep -v "rootCA.pem" | head -n 1)
  if [ -n "$FOUND_CERT" ]; then
    SSL_CERT_FILE=$(basename "$FOUND_CERT")
    # Auto-detect key if not provided
    if [ -z "${SSL_KEY_FILE:-}" ]; then
      BASE_NAME=$(echo "$SSL_CERT_FILE" | sed 's/\.pem$//')
      if [ -f "/etc/nginx/certs/${BASE_NAME}-key.pem" ]; then
        SSL_KEY_FILE="${BASE_NAME}-key.pem"
      fi
    fi
  fi
fi

# Set defaults if still empty and export for envsubst
export SSL_CERT_FILE="${SSL_CERT_FILE:-staging.myapp.local.pem}"
export SSL_KEY_FILE="${SSL_KEY_FILE:-staging.myapp.local-key.pem}"

CERT_FILE="/etc/nginx/certs/$SSL_CERT_FILE"
KEY_FILE="/etc/nginx/certs/$SSL_KEY_FILE"
TEMPLATE="/etc/nginx/nginx.http.conf.template"

if [ -f "$CERT_FILE" ] && [ -f "$KEY_FILE" ]; then
  TEMPLATE="/etc/nginx/nginx.ssl.conf.template"
fi

envsubst '$VITE_API_PROTOCOL $VITE_API_HOST $VITE_API_PORT $VITE_API_BASE_PATH $SSL_CERT_FILE $SSL_KEY_FILE' \
  < "$TEMPLATE" \
  > /etc/nginx/nginx.conf

exec nginx -g 'daemon off;'
