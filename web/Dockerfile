# Statische Website – nginx (arm64-kompatibel für Raspberry Pi 5)
FROM nginx:1.27-alpine

# Eigene Server-Konfiguration
RUN rm /etc/nginx/conf.d/default.conf
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Website-Dateien
COPY public/ /usr/share/nginx/html/

# Cache-Busting: __ASSET_VER__ in allen HTML-Dateien durch einen Inhalts-Hash
# von CSS+JS ersetzen. Aendert sich der Code, aendert sich der Hash -> neue
# Asset-URLs -> Browser/CDN laden automatisch die neue Version (kein Stale-Cache).
RUN VER=$(cat /usr/share/nginx/html/css/styles.css /usr/share/nginx/html/js/main.js | sha1sum | cut -c1-10) \
    && sed -i "s/__ASSET_VER__/$VER/g" /usr/share/nginx/html/*.html \
    && echo "Asset-Version: $VER"

EXPOSE 80
