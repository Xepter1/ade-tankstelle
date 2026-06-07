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

  /* ---------- Lightbox-Galerie ---------- */
  var lightbox = document.getElementById("lightbox");
  var lightboxImg = document.getElementById("lightboxImg");
  var lightboxClose = document.getElementById("lightboxClose");
  var lightboxPrev = document.getElementById("lightboxPrev");
  var lightboxNext = document.getElementById("lightboxNext");
  var galleryLinks = document.querySelectorAll(".gallery-link");

  var currentImageIndex = 0;
  var imagesList = [];

  if (lightbox && lightboxImg && galleryLinks.length > 0) {
    // Liste aller Galeriebilder aufbauen
    galleryLinks.forEach(function (link, index) {
      imagesList.push({
        src: link.getAttribute("href"),
        alt: link.querySelector("img").getAttribute("alt") || ""
      });

      link.addEventListener("click", function (e) {
        e.preventDefault();
        currentImageIndex = index;
        openLightbox();
      });
    });

    function openLightbox() {
      updateLightboxImage();
      lightbox.classList.add("active");
      lightbox.setAttribute("aria-hidden", "false");
      document.body.style.overflow = "hidden"; // Scrollen auf dem Body verhindern
      lightboxClose.focus();
    }

    function closeLightbox() {
      lightbox.classList.remove("active");
      lightbox.setAttribute("aria-hidden", "true");
      document.body.style.overflow = ""; // Scrollen wieder erlauben
    }

    function updateLightboxImage() {
      var imgData = imagesList[currentImageIndex];
      lightboxImg.src = imgData.src;
      lightboxImg.alt = imgData.alt;
    }

    function showNext() {
      currentImageIndex = (currentImageIndex + 1) % imagesList.length;
      updateLightboxImage();
    }

    function showPrev() {
      currentImageIndex = (currentImageIndex - 1 + imagesList.length) % imagesList.length;
      updateLightboxImage();
    }

    lightboxClose.addEventListener("click", closeLightbox);

    if (lightboxPrev) lightboxPrev.addEventListener("click", showPrev);
    if (lightboxNext) lightboxNext.addEventListener("click", showNext);

    // Klick auf den abgedunkelten Hintergrund schließt die Lightbox ebenfalls
    lightbox.addEventListener("click", function (e) {
      if (e.target === lightbox || e.target.classList.contains("lightbox-content")) {
        closeLightbox();
      }
    });

    // Tastatursteuerung für bessere Barrierefreiheit
    document.addEventListener("keydown", function (e) {
      if (!lightbox.classList.contains("active")) return;
      if (e.key === "Escape") closeLightbox();
      if (e.key === "ArrowRight") showNext();
      if (e.key === "ArrowLeft") showPrev();
    });
  }

  /* ---------- Header-Zustand beim Scrollen ---------- */
  var header = document.getElementById("top");
  if (header) {
    var onScroll = function () {
      if (window.scrollY > 24) header.classList.add("scrolled");
      else header.classList.remove("scrolled");
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
  }

  var reduceMotion = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* ---------- Scroll-Reveal (Einblenden beim Scrollen) ---------- */
  var revealEls = document.querySelectorAll("[data-reveal]");
  if (revealEls.length) {
    if (reduceMotion || !("IntersectionObserver" in window)) {
      revealEls.forEach(function (el) { el.classList.add("is-visible"); });
    } else {
      var revealObserver = new IntersectionObserver(function (entries, obs) {
        entries.forEach(function (entry, i) {
          if (entry.isIntersecting) {
            var el = entry.target;
            // sanftes Staffeln innerhalb desselben Containers
            var delay = el.parentElement ? Array.prototype.indexOf.call(el.parentElement.children, el) % 4 : 0;
            el.style.transitionDelay = (delay * 70) + "ms";
            el.classList.add("is-visible");
            obs.unobserve(el);
          }
        });
      }, { threshold: 0.12, rootMargin: "0px 0px -8% 0px" });
      revealEls.forEach(function (el) { revealObserver.observe(el); });
    }
  }

  /* ---------- Count-up der Kennzahlen ---------- */
  var counters = document.querySelectorAll("[data-count]");
  if (counters.length) {
    var animateCount = function (el) {
      var target = parseInt(el.getAttribute("data-count"), 10) || 0;
      if (reduceMotion) { el.textContent = target; return; }
      var dur = 1400, start = null;
      var step = function (ts) {
        if (!start) start = ts;
        var p = Math.min((ts - start) / dur, 1);
        var eased = 1 - Math.pow(1 - p, 3); // easeOutCubic
        el.textContent = Math.round(eased * target);
        if (p < 1) requestAnimationFrame(step);
        else el.textContent = target;
      };
      requestAnimationFrame(step);
    };
    if (!("IntersectionObserver" in window)) {
      counters.forEach(animateCount);
    } else {
      var countObserver = new IntersectionObserver(function (entries, obs) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) { animateCount(entry.target); obs.unobserve(entry.target); }
        });
      }, { threshold: 0.6 });
      counters.forEach(function (el) { countObserver.observe(el); });
    }
  }
})();
