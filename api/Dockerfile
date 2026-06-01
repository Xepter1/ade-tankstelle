# Kontaktformular-Backend – schlankes Node-Image (arm64-kompatibel für Raspberry Pi 5)
FROM node:20-alpine

WORKDIR /app

# Nur Manifeste kopieren -> Layer-Caching für Dependencies
COPY package.json ./
RUN npm install --omit=dev --no-audit --no-fund

COPY server.js ./

# Als non-root laufen
USER node

ENV NODE_ENV=production
EXPOSE 3000

CMD ["node", "server.js"]
