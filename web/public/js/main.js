/* =========================================================
   Tankstelle Stettner – Frontend-Logik
   - Mobile-Navigation
   - Cookie-Hinweis (nur technisch notwendige Cookies)
   - Google-Maps-Consent (Opt-in, IP geht erst nach Klick an Google)
   - Kontaktformular (POST an /api/contact)
   ========================================================= */
(function () {
  "use strict";

  /* ---------- Jahr im Footer ---------- */
  var yearEl = document.getElementById("year");
  if (yearEl) yearEl.textContent = new Date().getFullYear();

  /* ---------- Mobile-Navigation ---------- */
  var toggle = document.querySelector(".nav-toggle");
  var nav = document.getElementById("hauptnav");
  if (toggle && nav) {
    toggle.addEventListener("click", function () {
      var open = nav.classList.toggle("open");
      toggle.setAttribute("aria-expanded", open ? "true" : "false");
      toggle.setAttribute("aria-label", open ? "Menü schließen" : "Menü öffnen");
    });
    nav.addEventListener("click", function (e) {
      if (e.target.tagName === "A") {
        nav.classList.remove("open");
        toggle.setAttribute("aria-expanded", "false");
      }
    });
  }

  /* ---------- Cookie-Hinweis ---------- */
  var banner = document.getElementById("cookieBanner");
  var cookieOk = document.getElementById("cookieOk");
  var COOKIE_KEY = "ts_cookie_notice_v1";
  try {
    if (banner && localStorage.getItem(COOKIE_KEY) !== "1") {
      banner.hidden = false;
    }
  } catch (e) { if (banner) banner.hidden = false; }
  if (cookieOk) {
    cookieOk.addEventListener("click", function () {
      try { localStorage.setItem(COOKIE_KEY, "1"); } catch (e) {}
      if (banner) banner.hidden = true;
    });
  }

  /* ---------- Google-Maps-Consent ---------- */
  var mapWrap = document.getElementById("mapWrap");
  var loadMapBtn = document.getElementById("loadMapBtn");
  var rememberMap = document.getElementById("rememberMap");
  var MAP_KEY = "ts_maps_consent_v1";

  function loadMap() {
    if (!mapWrap) return;
    var src = mapWrap.getAttribute("data-maps-src");
    var iframe = document.createElement("iframe");
    iframe.src = src;
    iframe.title = "Standort Tankstelle Stettner auf Google Maps";
    iframe.loading = "lazy";
    iframe.referrerPolicy = "no-referrer-when-downgrade";
    iframe.allowFullscreen = true;
    mapWrap.innerHTML = "";
    mapWrap.appendChild(iframe);
  }

  try {
    if (mapWrap && localStorage.getItem(MAP_KEY) === "1") loadMap();
  } catch (e) {}

  if (loadMapBtn) {
    loadMapBtn.addEventListener("click", function () {
      if (rememberMap && rememberMap.checked) {
        try { localStorage.setItem(MAP_KEY, "1"); } catch (e) {}
      }
      loadMap();
    });
  }

  /* ---------- Kontaktformular ---------- */
  var form = document.getElementById("contactForm");
  var status = document.getElementById("formStatus");
  var submitBtn = document.getElementById("cf-submit");

  function setStatus(msg, type) {
    if (!status) return;
    status.textContent = msg;
    status.className = "form-status" + (type ? " " + type : "");
  }

  if (form) {
    form.addEventListener("submit", function (e) {
      e.preventDefault();

      if (!form.checkValidity()) {
        setStatus("Bitte füllen Sie alle Pflichtfelder korrekt aus.", "err");
        form.reportValidity();
        return;
      }

      var payload = {
        name: form.name.value.trim(),
        email: form.email.value.trim(),
        phone: form.phone.value.trim(),
        message: form.message.value.trim(),
        website: form.website.value.trim() // Honeypot
      };

      submitBtn.disabled = true;
      setStatus("Nachricht wird gesendet …", "");

      fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      })
        .then(function (res) {
          return res.json().then(function (data) { return { ok: res.ok, data: data }; });
        })
        .then(function (r) {
          if (r.ok && r.data && r.data.success) {
            setStatus("Vielen Dank! Ihre Nachricht wurde gesendet. Wir melden uns zeitnah.", "ok");
            form.reset();
          } else {
            setStatus((r.data && r.data.error) || "Senden fehlgeschlagen. Bitte versuchen Sie es später erneut oder rufen Sie uns an.", "err");
          }
        })
        .catch(function () {
          setStatus("Verbindung fehlgeschlagen. Bitte versuchen Sie es später erneut oder rufen Sie uns unter 08086 / 8469 an.", "err");
        })
        .finally(function () {
          submitBtn.disabled = false;
        });
    });
  }
})();
