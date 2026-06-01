# Tankstelle Stettner – Website

Website für die **Tankstelle Stettner**, Sterneck 4, 84428 Buchbach.
Aufgebaut als schlanke statische Seite (nginx) + kleines Node-Backend für das Kontaktformular, paketiert in Docker – ideal für den Betrieb auf einem Raspberry Pi 5.

## Aufbau

```
.
├── docker-compose.yml      # orchestriert beide Container
├── .env.example            # Vorlage für SMTP-Zugangsdaten  → nach .env kopieren
├── web/                    # statische Website (nginx)
│   ├── Dockerfile
│   ├── nginx.conf          # serviert Seite + Reverse-Proxy /api/ → api:3000
│   └── public/             # alle Inhalte: HTML, CSS, JS, Assets
│       ├── index.html              # Startseite (alle Sektionen)
│       ├── impressum.html
│       ├── datenschutz.html
│       ├── css/ js/ assets/ downloads/
└── api/                    # Kontaktformular-Backend (Node + nodemailer)
    ├── Dockerfile
    ├── server.js
    └── package.json
```

## Inhalte der Seite

Startseite mit: Hero/Öffnungszeiten · Kraftstoffe (Super E5, Diesel B7, Super Plus, Premium Diesel B0 inkl. Vorteile) · Preis-Link zu clever-tanken · Zahlungsmethoden · Serviceleistungen · Über uns (mit Luftbild-Platzhalter) · Downloads (Transponder) · Kontaktformular + Google-Maps-Einbindung. Dazu **Impressum** und **Datenschutzerklärung** als eigene Seiten, plus Cookie-Hinweis.

## Schnellstart (auf dem Raspberry Pi 5)

```bash
# 1. SMTP-Zugangsdaten hinterlegen
cp .env.example .env
nano .env          # echte Werte des Mailpostfachs eintragen

# 2. Bauen & starten
docker compose up -d --build

# Seite läuft danach auf:  http://<pi-ip>:8080
```

Stoppen: `docker compose down` · Logs: `docker compose logs -f`

> Die Images basieren auf `node:20-alpine` und `nginx:1.27-alpine` und bauen direkt für arm64 auf dem Pi.

## Deployment über Portainer (Git-Stack)

1. **Portainer → Stacks → Add stack → Repository**.
2. Repository-URL eintragen, Branch `main`, Compose-Pfad `docker-compose.yml`.
3. Unter **Environment variables** die SMTP-Werte setzen (Namen wie in `.env.example`):
   `SMTP_HOST`, `SMTP_PORT`, `SMTP_SECURE`, `SMTP_USER`, `SMTP_PASS`, `MAIL_FROM`, `MAIL_TO`
   (optional `WEB_PORT`, Standard 8080).
4. **Deploy the stack** – Portainer klont das Repo und baut beide Images auf dem Pi.

Updates später: Code pushen, dann in Portainer **„Pull and redeploy"** (oder Auto-Update/Webhook aktivieren).

## Konfiguration

### Kontaktformular (Pflicht für den Mailversand)
Trage in `.env` die Zugangsdaten des Postfachs ein (Vorlage: `.env.example`):
`SMTP_HOST`, `SMTP_PORT`, `SMTP_SECURE`, `SMTP_USER`, `SMTP_PASS`, `MAIL_FROM`, `MAIL_TO`.
Ohne gültige SMTP-Daten zeigt das Formular eine Fehlermeldung an; die restliche Seite funktioniert normal.
Test: `curl http://<pi-ip>:8080/api/health` → `{"status":"ok"}`.

### Port ändern
In `docker-compose.yml` unter `web` → `ports` den Host-Port `8080` anpassen. Läuft auf dem Pi schon ein Reverse-Proxy (Traefik/Caddy/NPM) für HTTPS, einfach dort die Domain `tankstelle-stettner.de` auf diesen Container zeigen lassen.

## Noch zu ergänzen (Platzhalter im Code)

- **Zahlungs-Logos:** In `web/public/assets/payment/` liegen saubere SVG-Platzhalter. Für die offiziellen Marken-Logos (Visa, Mastercard, girocard, Apple Pay …) einfach die gleichnamigen SVG/PNG-Dateien ersetzen – Markenrichtlinien der Anbieter beachten.
- **Luftbilder:** `web/public/assets/images/luftbild.svg` durch echte Luftaufnahme(n) ersetzen (z. B. `luftbild.jpg`, dann Pfad in `index.html` anpassen).
- **Transponder-PDF:** Datei `transponder-antrag.pdf` in `web/public/downloads/` ablegen.
- **Logo:** `web/public/assets/logo.svg` ist ein gesetztes Wort-/Bildmarken-Logo; bei vorhandenem Original-Logo dort austauschen.

## Hinweise zum Datenschutz

- Es werden **keine externen Schriftarten** geladen (System-Fonts) – keine Verbindung zu Google Fonts.
- **Google Maps** lädt erst nach ausdrücklicher Einwilligung (Klick auf „Karte laden"). Erst dann wird eine Verbindung zu Google aufgebaut.
- Nur technisch notwendige Cookies; ein Hinweis-Banner informiert darüber.
- Diese Texte sind eine sorgfältige Vorlage, ersetzen aber **keine Rechtsberatung**. Vor dem Live-Gang idealerweise vom Inhaber/einem Fachkundigen prüfen lassen.
