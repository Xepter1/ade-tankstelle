# Statische Website – nginx (arm64-kompatibel für Raspberry Pi 5)
FROM nginx:1.27-alpine

# Eigene Server-Konfiguration
RUN rm /etc/nginx/conf.d/default.conf
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Website-Dateien
COPY public/ /usr/share/nginx/html/

EXPOSE 80
