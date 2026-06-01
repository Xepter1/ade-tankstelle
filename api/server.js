"use strict";

/**
 * Kontaktformular-Backend für die Tankstelle Stettner.
 * Nimmt POST /api/contact entgegen, validiert die Eingaben und versendet
 * die Anfrage per SMTP an den Tankstellen-Betreiber.
 *
 * Konfiguration ausschließlich über Umgebungsvariablen (siehe .env.example).
 */

const express = require("express");
const rateLimit = require("express-rate-limit");
const nodemailer = require("nodemailer");

const app = express();
app.set("trust proxy", 1); // hinter nginx-Reverse-Proxy
app.use(express.json({ limit: "16kb" }));

const PORT = process.env.PORT || 3000;

const SMTP_HOST = process.env.SMTP_HOST;
const SMTP_PORT = parseInt(process.env.SMTP_PORT || "587", 10);
const SMTP_SECURE = String(process.env.SMTP_SECURE || "false") === "true";
const SMTP_USER = process.env.SMTP_USER;
const SMTP_PASS = process.env.SMTP_PASS;
const MAIL_FROM = process.env.MAIL_FROM || SMTP_USER;
const MAIL_TO = process.env.MAIL_TO || "info@tankstelle-stettner.de";

if (!SMTP_HOST || !SMTP_USER || !SMTP_PASS) {
  console.warn(
    "[WARN] SMTP-Konfiguration unvollständig (SMTP_HOST/SMTP_USER/SMTP_PASS). " +
      "Das Kontaktformular kann erst Mails versenden, wenn diese Variablen gesetzt sind."
  );
}

const transporter = nodemailer.createTransport({
  host: SMTP_HOST,
  port: SMTP_PORT,
  secure: SMTP_SECURE, // true für Port 465, false für 587 (STARTTLS)
  auth: SMTP_USER ? { user: SMTP_USER, pass: SMTP_PASS } : undefined
});

// Spam-Schutz: max. 5 Anfragen pro 10 Minuten je IP
const contactLimiter = rateLimit({
  windowMs: 10 * 60 * 1000,
  max: 5,
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, error: "Zu viele Anfragen. Bitte versuchen Sie es später erneut." }
});

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function escapeHtml(str) {
  return String(str)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

app.get("/api/health", (_req, res) => res.json({ status: "ok" }));

app.post("/api/contact", contactLimiter, async (req, res) => {
  const body = req.body || {};
  const name = String(body.name || "").trim();
  const email = String(body.email || "").trim();
  const phone = String(body.phone || "").trim();
  const message = String(body.message || "").trim();
  const honeypot = String(body.website || "").trim();

  // Honeypot: ausgefüllt = Bot -> still erfolgreich tun, aber nichts senden
  if (honeypot) {
    return res.json({ success: true });
  }

  if (!name || !email || !message) {
    return res.status(400).json({ success: false, error: "Bitte füllen Sie alle Pflichtfelder aus." });
  }
  if (!EMAIL_RE.test(email)) {
    return res.status(400).json({ success: false, error: "Bitte geben Sie eine gültige E-Mail-Adresse an." });
  }
  if (name.length > 120 || email.length > 160 || phone.length > 60 || message.length > 5000) {
    return res.status(400).json({ success: false, error: "Eingaben zu lang." });
  }

  const textBody =
    `Neue Anfrage über das Kontaktformular der Website\n\n` +
    `Name:    ${name}\n` +
    `E-Mail:  ${email}\n` +
    `Telefon: ${phone || "-"}\n\n` +
    `Nachricht:\n${message}\n`;

  const htmlBody =
    `<h2>Neue Anfrage über das Kontaktformular</h2>` +
    `<p><strong>Name:</strong> ${escapeHtml(name)}<br>` +
    `<strong>E-Mail:</strong> ${escapeHtml(email)}<br>` +
    `<strong>Telefon:</strong> ${escapeHtml(phone || "-")}</p>` +
    `<p><strong>Nachricht:</strong></p>` +
    `<p>${escapeHtml(message).replace(/\n/g, "<br>")}</p>`;

  try {
    await transporter.sendMail({
      from: MAIL_FROM,
      to: MAIL_TO,
      replyTo: `${name} <${email}>`,
      subject: `Kontaktformular: Anfrage von ${name}`,
      text: textBody,
      html: htmlBody
    });
    return res.json({ success: true });
  } catch (err) {
    console.error("[ERROR] Mailversand fehlgeschlagen:", err.message);
    return res
      .status(502)
      .json({ success: false, error: "Nachricht konnte nicht gesendet werden. Bitte später erneut versuchen." });
  }
});

app.listen(PORT, () => {
  console.log(`Kontakt-API läuft auf Port ${PORT}`);
});
