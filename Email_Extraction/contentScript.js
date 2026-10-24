// Prevent double injection when script is executed multiple times
if (window.__reader_content_script_installed) {
  console.log('Reader content script already installed');
} else {
  window.__reader_content_script_installed = true;

  console.log('Content Script loaded');

  const SELECTORS = {
  gmail: {
    subject: 'h2[data-subject-threading], h2',
    from: '.hP, .gD, [data-email]',
    body: '.a3s.aiL, .a3s.ajx, .msg, .h7 .mGp, [role="main"] .mGp'
  }
};

function isGmail() { return location.hostname.includes('mail.google.com'); }
function isWhatsApp() { return location.hostname.includes('web.whatsapp.com'); }
function isTelegram() { return location.hostname.includes('web.telegram.org'); }

const domainAgeCache = new Map();
let currentRiskAnalysis = null;
let currentRiskAnalysisPromise = null;

function injectAnimatedBorderStyles() {
  if (document.getElementById("ml-animated-style")) return;

  const style = document.createElement("style");
  style.id = "ml-animated-style";

  style.innerHTML = `
    @keyframes rainbowMove {
      0% { background-position: 0% 50%; }
      100% { background-position: 200% 50%; }
    }

    .ml-rainbow-border {
      border-radius: 8px;
      padding: 6px 10px;
      border: 3px solid transparent;
      background: linear-gradient(white, white) padding-box,
                  linear-gradient(90deg, red, orange, yellow, green, blue, violet, red) border-box;
      background-size: 200% 200%;
      animation: rainbowMove 2.5s linear infinite;
      transition: all 0.6s ease;
    }

    .ml-final-red {
      border: 3px solid red !important;
      background: white !important;
      animation: none !important;
      transition: all 0.6s ease;
    }

    .ml-fullpage-rainbow-border {
      position: fixed;
      inset: 0;
      pointer-events: none;
      z-index: 2147483647;
      opacity: 1;
      transition: opacity 0.35s ease;
    }

    .ml-fullpage-backdrop {
      position: absolute;
      inset: 0;
      pointer-events: none;
      background:
        radial-gradient(circle at center, rgba(255, 255, 255, 0.05) 0%, rgba(255, 255, 255, 0.02) 28%, rgba(255, 255, 255, 0) 62%),
        linear-gradient(180deg, rgba(10, 14, 22, 0.06) 0%, rgba(10, 14, 22, 0.04) 100%);
      backdrop-filter: blur(3px);
      -webkit-backdrop-filter: blur(3px);
      opacity: 0;
      overflow: hidden;
      transition: opacity 0.45s ease, backdrop-filter 1.2s cubic-bezier(0.4, 0, 0.2, 1), -webkit-backdrop-filter 1.2s cubic-bezier(0.4, 0, 0.2, 1), background 1.2s cubic-bezier(0.4, 0, 0.2, 1);
    }

    .ml-fullpage-backdrop::before,
    .ml-fullpage-backdrop::after {
      content: "";
      position: absolute;
      inset: -18%;
      pointer-events: none;
      opacity: 0;
      transition: opacity 1.35s cubic-bezier(0.4, 0, 0.2, 1), transform 1.35s cubic-bezier(0.4, 0, 0.2, 1);
    }

    .ml-fullpage-backdrop::before {
      background: radial-gradient(circle at center, rgba(220, 38, 38, 0.34) 0%, rgba(220, 38, 38, 0.2) 26%, rgba(185, 28, 28, 0.1) 50%, rgba(185, 28, 28, 0) 74%);
      transform: scale(0.46);
      filter: blur(20px);
    }

    .ml-fullpage-backdrop::after {
      background: radial-gradient(circle at center, rgba(127, 29, 29, 0) 24%, rgba(153, 27, 27, 0.1) 52%, rgba(127, 29, 29, 0.2) 76%, rgba(69, 10, 10, 0.3) 100%);
      transform: scale(1.16);
      filter: blur(26px);
    }

    .ml-fullpage-edge {
      position: absolute;
      pointer-events: none;
      background: linear-gradient(90deg, red, orange, yellow, green, blue, violet, red);
      background-size: 200% 200%;
      animation: rainbowMove 2.5s linear infinite;
      transition: all 0.6s ease;
    }

    .ml-fullpage-edge-top,
    .ml-fullpage-edge-bottom {
      left: 0;
      width: 100%;
      height: 3px;
    }

    .ml-fullpage-edge-left,
    .ml-fullpage-edge-right {
      top: 0;
      width: 3px;
      height: 100%;
      background: linear-gradient(180deg, red, orange, yellow, green, blue, violet, red);
      background-size: 200% 200%;
    }

    .ml-fullpage-edge-top { top: 0; }
    .ml-fullpage-edge-bottom { bottom: 0; }
    .ml-fullpage-edge-left { left: 0; }
    .ml-fullpage-edge-right { right: 0; }

    .ml-fullpage-final-red .ml-fullpage-edge {
      animation: none !important;
      background: red !important;
    }

    .ml-fullpage-final-red {
      position: fixed;
      inset: 0;
      pointer-events: auto;
      z-index: 2147483647;
    }

    .ml-fullpage-rainbow-border .ml-fullpage-backdrop {
      opacity: 1;
    }

    .ml-buffer-loader {
      position: absolute;
      top: 50%;
      left: 50%;
      width: 120px;
      height: 120px;
      transform: translate(-50%, -50%);
      pointer-events: none;
      opacity: 1;
      filter: drop-shadow(0 8px 16px rgba(0, 0, 0, 0.15));
      transition: opacity 0.35s ease, transform 0.35s ease;
    }

    .ml-buffer-loader::before {
      content: "";
      position: absolute;
      inset: -20px;
      border-radius: 50%;
      background: radial-gradient(circle, rgba(255, 255, 255, 0.05) 0%, rgba(255, 255, 255, 0.02) 40%, transparent 70%);
      opacity: 0.8;
      filter: blur(12px);
    }

    .ml-buffer-segment {
      position: absolute;
      top: 50%;
      left: 50%;
      width: 4px;
      height: 14px;
      margin-left: -2px;
      margin-top: -7px;
      border-radius: 999px;
      background: hsl(var(--segment-hue) 100% 65%);
      opacity: 0.15;
      transform:
        rotate(var(--segment-angle))
        translateY(calc(var(--segment-radius) * -1))
        scale(1, 1);
      transform-origin: center center;
      box-shadow: 0 0 0 transparent;
      filter: blur(0.5px) brightness(0.7);
      animation: ml-buffer-segment-wave 0.72s cubic-bezier(0.4, 0, 0.2, 1) infinite;
      animation-delay: var(--segment-delay);
      will-change: transform, opacity, filter, box-shadow;
    }

    .ml-fullpage-final-red .ml-buffer-loader {
      opacity: 0 !important;
      transform: translate(-50%, -50%) scale(0.86);
    }

    .ml-warning-panel {
      position: absolute;
      top: 50%;
      left: 50%;
      width: min(92vw, 420px);
      transform: translate(-50%, -50%) scale(0.96);
      opacity: 0;
      pointer-events: none;
      background: rgba(255, 255, 255, 0.96);
      color: #111827;
      border-radius: 18px;
      padding: 24px 22px 20px;
      box-shadow: 0 28px 60px rgba(0, 0, 0, 0.24);
      border: 1px solid rgba(255, 255, 255, 0.72);
      transition: opacity 0.35s ease, transform 0.35s ease;
      font-family: Arial, sans-serif;
      text-align: center;
    }

    .ml-warning-title {
      margin: 0 0 10px;
      font-size: 24px;
      line-height: 1.2;
      font-weight: 700;
      color: #b91c1c;
    }

    .ml-warning-text {
      margin: 0 0 18px;
      font-size: 14px;
      line-height: 1.5;
      color: #374151;
    }

    .ml-risk-chip {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      min-width: 96px;
      margin: 0 auto 12px;
      padding: 7px 12px;
      border-radius: 999px;
      background: rgba(185, 28, 28, 0.1);
      color: #991b1b;
      font: 700 12px/1 Arial, sans-serif;
      letter-spacing: 0.04em;
      text-transform: uppercase;
    }

    .ml-risk-details {
      margin: 0 0 16px;
      text-align: left;
      border-radius: 12px;
      background: rgba(248, 250, 252, 0.95);
      border: 1px solid rgba(226, 232, 240, 0.9);
      overflow: hidden;
    }

    .ml-risk-details summary {
      padding: 12px 14px;
      cursor: pointer;
      font: 600 13px/1.3 Arial, sans-serif;
      color: #1f2937;
      list-style: none;
    }

    .ml-risk-details summary::-webkit-details-marker {
      display: none;
    }

    .ml-risk-reasons {
      margin: 0;
      padding: 0 18px 14px 30px;
      color: #4b5563;
      font: 400 12px/1.5 Arial, sans-serif;
    }

    .ml-risk-reasons li + li {
      margin-top: 6px;
    }

    .ml-risk-meta {
      margin: 0 0 10px;
      color: #6b7280;
      font: 500 12px/1.4 Arial, sans-serif;
    }

    .ml-warning-button {
      border: 0;
      border-radius: 999px;
      padding: 11px 18px;
      background: #b91c1c;
      color: #fff;
      font-size: 14px;
      font-weight: 600;
      cursor: pointer;
      box-shadow: 0 10px 24px rgba(185, 28, 28, 0.22);
      transition: transform 0.2s ease, background 0.2s ease;
      pointer-events: auto;
    }

    .ml-warning-button:hover {
      background: #991b1b;
      transform: translateY(-1px);
    }

    .ml-warning-button:active {
      transform: translateY(0);
    }

    .ml-url-warning-bar {
      position: fixed;
      top: 0;
      left: 0;
      width: 100%;
      height: 40px;
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 0 16px;
      box-sizing: border-box;
      background: linear-gradient(90deg, rgba(127, 29, 29, 0.96) 0%, rgba(220, 38, 38, 0.96) 52%, rgba(153, 27, 27, 0.96) 100%);
      color: #fff;
      font: 500 14px/1.2 Arial, sans-serif;
      letter-spacing: 0.01em;
      box-shadow: 0 6px 18px rgba(127, 29, 29, 0.28);
      transform: translateY(-100%);
      opacity: 0;
      transition: transform 0.3s ease, opacity 0.3s ease;
      z-index: 2147483647;
      pointer-events: none;
    }

    .ml-url-warning-bar.ml-visible {
      transform: translateY(0);
      opacity: 1;
    }

    .ml-url-warning-bar-text {
      pointer-events: none;
    }

    .ml-url-warning-bar-close {
      position: absolute;
      right: 12px;
      top: 50%;
      transform: translateY(-50%);
      display: inline-flex;
      align-items: center;
      justify-content: center;
      width: 20px;
      height: 20px;
      border: 0;
      border-radius: 999px;
      background: rgba(255, 255, 255, 0.18);
      color: #fff;
      font: 700 12px/1 Arial, sans-serif;
      cursor: pointer;
      transition: background 0.18s ease, transform 0.18s ease;
      pointer-events: auto;
    }

    .ml-url-warning-bar-close:hover {
      background: rgba(255, 255, 255, 0.26);
      transform: translateY(-50%) scale(1.06);
    }

    .ml-floating-warning-banner {
      position: fixed;
      right: 20px;
      bottom: 20px;
      display: inline-flex;
      align-items: center;
      gap: 8px;
      padding: 12px 16px;
      border-radius: 10px;
      background: rgba(185, 28, 28, 0.88);
      color: #fff;
      font: 600 14px/1.2 Arial, sans-serif;
      box-shadow: 0 14px 28px rgba(0, 0, 0, 0.22);
      cursor: pointer;
      z-index: 2147483647;
      transition: transform 0.2s ease, background 0.2s ease;
      pointer-events: auto;
    }

    .ml-floating-warning-banner:hover {
      transform: scale(1.04);
      background: rgba(185, 28, 28, 0.94);
    }

    .ml-warning-tooltip {
      position: absolute;
      right: 0;
      bottom: calc(100% + 10px);
      width: 250px;
      padding: 10px 12px;
      border-radius: 8px;
      background: #222;
      color: #fff;
      font: 400 12px/1.45 Arial, sans-serif;
      box-shadow: 0 12px 24px rgba(0, 0, 0, 0.22);
      opacity: 0;
      transform: translateY(6px);
      transition: opacity 0.18s ease, transform 0.18s ease;
      pointer-events: none;
    }

    .ml-warning-tooltip-title {
      margin: 0 0 6px;
      font: 700 12px/1.4 Arial, sans-serif;
      color: #fff;
    }

    .ml-warning-tooltip-body {
      margin: 0;
      color: rgba(255, 255, 255, 0.88);
    }

    .ml-warning-tooltip.ml-visible {
      opacity: 1;
      transform: translateY(0);
    }

    .ml-fullpage-final-red .ml-fullpage-backdrop {
      opacity: 1;
      background:
        radial-gradient(circle at center, rgba(255, 235, 235, 0.08) 0%, rgba(255, 235, 235, 0.03) 18%, rgba(255, 235, 235, 0) 42%),
        linear-gradient(180deg, rgba(85, 10, 10, 0.18) 0%, rgba(120, 16, 16, 0.28) 100%);
      backdrop-filter: blur(9px);
      -webkit-backdrop-filter: blur(9px);
    }

    .ml-fullpage-final-red .ml-fullpage-backdrop::before,
    .ml-fullpage-final-red .ml-fullpage-backdrop::after {
      opacity: 1;
    }

    .ml-fullpage-final-red .ml-fullpage-backdrop::before {
      transform: scale(1.24);
    }

    .ml-fullpage-final-red .ml-fullpage-backdrop::after {
      transform: scale(1.42);
    }

    .ml-fullpage-final-red .ml-warning-panel {
      opacity: 1;
      transform: translate(-50%, -50%) scale(1);
      pointer-events: auto;
    }

    @keyframes ml-buffer-segment-wave {
      0%, 100% {
        opacity: 0.15;
        filter: blur(0.5px) brightness(0.7);
        box-shadow: 0 0 0 transparent;
        transform:
          rotate(var(--segment-angle))
          translateY(calc(var(--segment-radius) * -1))
          scale(1, 1);
      }
      15% {
        opacity: 1;
        filter: blur(0) brightness(1.5);
        box-shadow:
          0 0 10px color-mix(in srgb, hsl(var(--segment-hue) 100% 65%) 80%, white),
          0 0 20px color-mix(in srgb, hsl(var(--segment-hue) 100% 65%) 50%, white);
        transform:
          rotate(var(--segment-angle))
          translateY(calc((var(--segment-radius) + 12px) * -1))
          scale(1.3, 1.3);
      }
      25% {
        opacity: 0.9;
        filter: blur(0) brightness(1.3);
        box-shadow:
          0 0 8px color-mix(in srgb, hsl(var(--segment-hue) 100% 65%) 60%, white);
        transform:
          rotate(var(--segment-angle))
          translateY(calc((var(--segment-radius) + 9px) * -1))
          scale(1.15, 1.15);
      }
      45% {
        opacity: 0.5;
        filter: blur(0.2px) brightness(1.1);
        box-shadow:
          0 0 4px color-mix(in srgb, hsl(var(--segment-hue) 100% 65%) 40%, white);
        transform:
          rotate(var(--segment-angle))
          translateY(calc((var(--segment-radius) + 3px) * -1))
          scale(1.05, 1.05);
      }
    }
  `;

  document.head.appendChild(style);
}
function startAnalyzingAnimation() {
  if (!isGmail()) return;

  const main = document.querySelector('[role="main"]');
  if (!main) return;

  const subject = main.querySelector('h2.hP, h2[role="heading"], [data-subject]');
  if (!subject) return;

  injectAnimatedBorderStyles();

  subject.classList.remove("ml-final-red");
  subject.classList.add("ml-rainbow-border");
}
function stopAnimationTurnRed() {
  if (!isGmail()) return;

  const main = document.querySelector('[role="main"]');
  if (!main) return;

  const subject = main.querySelector('h2.hP, h2[role="heading"], [data-subject]');
  if (!subject) return;

  subject.classList.remove("ml-rainbow-border");
  subject.classList.add("ml-final-red");
}


function highlightGmailSubject(color = "#ff0000") {
  if (!isGmail()) return;

  const main = document.querySelector('[role="main"]');
  if (!main) return;

  const subjectEl = main.querySelector('h2.hP, h2[role="heading"], [data-subject]');
  if (!subjectEl) return;

  subjectEl.style.backgroundColor = color;
  subjectEl.style.padding = "6px 10px";
  subjectEl.style.borderRadius = "8px";
  subjectEl.style.transition = "all 0.3s ease";
}

function highlightWhatsAppHeader(color = "#ff0000") {
  if (!isWhatsApp()) return;

  const applyColor = () => {
    const mainPanel = document.getElementById("main");
    if (!mainPanel) return false;

    const header = mainPanel.querySelector("header");
    if (!header) return false;

    header.style.setProperty("background-color", color, "important");
    header.style.setProperty("transition", "all 0.3s ease", "important");

    return true;
  };



  if (!applyColor()) {
    setTimeout(applyColor, 800);
  }
}

// ================= FULL PAGE RAINBOW BORDER =================

function isGenericWebsite() {
  return !isGmail() && !isWhatsApp() && !isTelegram();
}

function escapeHtml(value) {
  return String(value || "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function getRootDomain(hostname) {
  const parts = (hostname || "").split(".").filter(Boolean);
  if (parts.length <= 2) return hostname || "";
  return parts.slice(-2).join(".");
}

function getVisibleUrlLikeText(text) {
  const clean = (text || "").trim().replace(/\s+/g, "");
  if (!clean) return null;
  if (/^(https?:\/\/|www\.)/i.test(clean)) return clean;
  if (/^[a-z0-9-]+\.[a-z]{2,}(\/.*)?$/i.test(clean)) return clean;
  return null;
}

function analyzeLinkMismatches(maxLinks = 80) {
  const anchors = Array.from(document.querySelectorAll("a[href]")).slice(0, maxLinks);
  const mismatches = [];

  anchors.forEach((anchor) => {
    const href = anchor.getAttribute("href");
    if (!href || href.startsWith("#") || href.startsWith("javascript:") || href.startsWith("mailto:")) return;

    const visibleText = getVisibleUrlLikeText(anchor.innerText || anchor.textContent || "");
    if (!visibleText) return;

    try {
      const hrefUrl = new URL(href, window.location.href);
      const textUrl = new URL(/^https?:\/\//i.test(visibleText) ? visibleText : `https://${visibleText}`);
      const hrefHost = hrefUrl.hostname.replace(/^www\./, "");
      const textHost = textUrl.hostname.replace(/^www\./, "");

      if (hrefHost && textHost && hrefHost !== textHost) {
        mismatches.push({
          text: visibleText,
          href: hrefUrl.href,
          hrefHost,
          textHost
        });
      }
    } catch (error) {
      // Ignore malformed URLs in text.
    }
  });

  return mismatches;
}

function analyzeSuspiciousKeywords() {
  const haystack = `${window.location.hostname} ${window.location.pathname} ${document.title}`.toLowerCase();
  const keywords = [
    "login", "verify", "secure", "update", "wallet", "crypto",
    "password", "bank", "signin", "auth", "payment", "invoice"
  ];

  return keywords.filter((keyword) => haystack.includes(keyword));
}

function analyzeHostnameRisk(hostname) {
  const lowerHost = (hostname || "").toLowerCase();
  const rootDomain = getRootDomain(lowerHost);
  const signals = [];

  if ((lowerHost.match(/-/g) || []).length >= 3) {
    signals.push("Hostname uses several hyphens, which is common in spoofed domains.");
  }

  if (/\d/.test(lowerHost)) {
    signals.push("Hostname contains numbers, which can be used to imitate trusted brands.");
  }

  if (lowerHost.split(".").length >= 4) {
    signals.push("Hostname has many subdomains, which can hide the real registered domain.");
  }

  if (rootDomain && /(paypa|micros0ft|goog1e|amaz0n|faceb00k|appleid|whats-app)/i.test(rootDomain)) {
    signals.push("Hostname resembles a known brand but is slightly altered.");
  }

  return signals;
}

async function fetchDomainAgeInfo(hostname) {
  const rootDomain = getRootDomain(hostname);
  if (!rootDomain) {
    return { available: false, ageDays: null, reason: null };
  }

  if (domainAgeCache.has(rootDomain)) {
    return domainAgeCache.get(rootDomain);
  }

  const request = fetch(`https://rdap.org/domain/${rootDomain}`)
    .then((response) => {
      if (!response.ok) throw new Error(`RDAP lookup failed with ${response.status}`);
      return response.json();
    })
    .then((data) => {
      const events = Array.isArray(data?.events) ? data.events : [];
      const registrationEvent = events.find((event) => /registr/i.test(event.eventAction || ""));
      const fallbackDate = data?.ldhName ? null : null;
      const dateValue = registrationEvent?.eventDate || fallbackDate;
      if (!dateValue) {
        return { available: false, ageDays: null, reason: "Domain registration date was not published by RDAP." };
      }

      const createdAt = new Date(dateValue);
      if (Number.isNaN(createdAt.getTime())) {
        return { available: false, ageDays: null, reason: "Domain registration date could not be parsed." };
      }

      const ageDays = Math.max(0, Math.floor((Date.now() - createdAt.getTime()) / 86400000));
      return { available: true, ageDays, createdAt: createdAt.toISOString(), reason: null };
    })
    .catch((error) => {
      console.log("[ML] RDAP lookup unavailable:", error.message);
      return { available: false, ageDays: null, reason: "Domain age lookup is unavailable right now." };
    });

  domainAgeCache.set(rootDomain, request);
  return request;
}

function buildRiskSummary(score) {
  if (score >= 80) return "High Risk";
  if (score >= 55) return "Elevated Risk";
  if (score >= 30) return "Moderate Risk";
  return "Low Risk";
}

async function analyzeGenericWebsiteRisk() {
  const hostname = window.location.hostname;
  const mismatches = analyzeLinkMismatches();
  const suspiciousKeywords = analyzeSuspiciousKeywords();
  const hostnameSignals = analyzeHostnameRisk(hostname);
  const domainAge = await fetchDomainAgeInfo(hostname);

  const reasons = [];
  let score = 8;

  if (domainAge.available && typeof domainAge.ageDays === "number") {
    if (domainAge.ageDays <= 30) {
      score += 34;
      reasons.push(`Domain appears very new at about ${domainAge.ageDays} day${domainAge.ageDays === 1 ? "" : "s"} old.`);
    } else if (domainAge.ageDays <= 90) {
      score += 22;
      reasons.push(`Domain is recently registered at about ${domainAge.ageDays} days old.`);
    } else if (domainAge.ageDays <= 180) {
      score += 12;
      reasons.push(`Domain is still relatively new at about ${domainAge.ageDays} days old.`);
    }
  } else if (domainAge.reason) {
    reasons.push(domainAge.reason);
  }

  if (suspiciousKeywords.length) {
    score += Math.min(18, suspiciousKeywords.length * 5);
    reasons.push(`Suspicious keywords were found in the URL or title: ${suspiciousKeywords.slice(0, 4).join(", ")}.`);
  }

  if (hostnameSignals.length) {
    score += Math.min(20, hostnameSignals.length * 6);
    reasons.push(...hostnameSignals.slice(0, 2));
  }

  if (mismatches.length) {
    score += Math.min(30, 12 + mismatches.length * 4);
    const sample = mismatches[0];
    reasons.push(`Visible link text points to ${sample.textHost}, but the actual destination is ${sample.hrefHost}.`);
  }

  const analysis = {
    hostname,
    score: Math.max(0, Math.min(100, score)),
    label: buildRiskSummary(score),
    domainAge,
    suspiciousKeywords,
    mismatches,
    reasons: reasons.length ? reasons : ["This page triggered the warning workflow, but no detailed signals were available."],
    analyzedAt: new Date().toISOString()
  };

  console.log("[ML] Generic website risk analysis:", analysis);
  return analysis;
}

function renderRiskDetails(analysis) {
  const reasons = (analysis?.reasons || []).slice(0, 4).map((reason) => `<li>${escapeHtml(reason)}</li>`).join("");
  const ageText = analysis?.domainAge?.available && typeof analysis.domainAge.ageDays === "number"
    ? `Domain age: ${analysis.domainAge.ageDays} days`
    : "Domain age: unavailable";

  return `
    <div class="ml-risk-chip">Risk ${analysis?.score ?? 0}/100</div>
    <p class="ml-risk-meta">${escapeHtml(analysis?.label || "Unknown Risk")} • ${escapeHtml(ageText)}</p>
    <details class="ml-risk-details">
      <summary>Why this page was flagged</summary>
      <ul class="ml-risk-reasons">${reasons}</ul>
    </details>
  `;
}

function updateRiskDrivenUI(analysis) {
  currentRiskAnalysis = analysis;

  const warningPanel = document.querySelector(".ml-warning-panel");
  if (warningPanel) {
    const title = warningPanel.querySelector(".ml-warning-title");
    const text = warningPanel.querySelector(".ml-warning-text");
    const details = warningPanel.querySelector(".ml-warning-reasons");

    if (title) title.textContent = `Warning: ${analysis.label}`;
    if (text) text.textContent = `Risk score ${analysis.score}/100 for ${analysis.hostname}. Review the signals below before continuing.`;
    if (details) details.innerHTML = renderRiskDetails(analysis);
  }

  const tooltip = document.getElementById("ml-warning-tooltip");
  if (tooltip) {
    const topReason = analysis.reasons[0] || "This page shows multiple phishing-style indicators.";
    tooltip.innerHTML = `
      <div class="ml-warning-tooltip-title">Risk ${analysis.score}/100 • ${escapeHtml(analysis.label)}</div>
      <p class="ml-warning-tooltip-body">${escapeHtml(topReason)}</p>
    `;
  }

  const barText = document.querySelector(".ml-url-warning-bar-text");
  if (barText) {
    barText.textContent = `⚠️ ${analysis.hostname} is flagged as dangerous • Risk ${analysis.score}/100`;
  }
}

function buildBufferWheelSegments(segmentCount = 48) {
  const radius = 46;
  const delayStep = 0.03;
  const halfCount = segmentCount / 2;
  let segments = "";

  for (let i = 0; i < segmentCount; i++) {
    const angle = (360 / segmentCount) * i;
    const hue = Math.round((360 / segmentCount) * i);
    const halfIndex = i % halfCount;
    // We use a negative delay so the animation begins right away at its target frame
    const delay = -(halfIndex * delayStep);
    
    segments += `<div class="ml-buffer-segment" style="--segment-angle:${angle}deg;--segment-hue:${hue};--segment-radius:${radius}px;--segment-delay:${delay}s;"></div>`;
  }

  return segments;
}

function injectFullPageRainbowBorder() {
  if (!isGenericWebsite()) return false;
  if (!document.body) {
    console.log("[ML] Full-page border skipped: document.body is not ready");
    return false;
  }
  if (document.getElementById("ml-fullpage-border")) {
    console.log("[ML] Full-page border already present");
    return true;
  }

  injectAnimatedBorderStyles();

  const wrapper = document.createElement("div");
  wrapper.id = "ml-fullpage-border";
  wrapper.setAttribute("aria-hidden", "true");
  wrapper.className = "ml-fullpage-rainbow-border";
  wrapper.innerHTML = `
    <div class="ml-fullpage-backdrop"></div>
    <div class="ml-fullpage-edge ml-fullpage-edge-top"></div>
    <div class="ml-fullpage-edge ml-fullpage-edge-right"></div>
    <div class="ml-fullpage-edge ml-fullpage-edge-bottom"></div>
    <div class="ml-fullpage-edge ml-fullpage-edge-left"></div>
    <div class="ml-buffer-loader">${buildBufferWheelSegments()}</div>
    <div class="ml-warning-panel" role="dialog" aria-modal="true" aria-live="polite" aria-hidden="true">
      <h2 class="ml-warning-title">Evaluating site risk...</h2>
      <p class="ml-warning-text">We are checking this page for phishing signals such as domain age, risky keywords, and link mismatches.</p>
      <div class="ml-warning-reasons">${renderRiskDetails({ score: 0, label: "Pending Analysis", domainAge: {}, reasons: ["Analysis is still running."] })}</div>
      <button type="button" class="ml-warning-button" data-ml-warning-dismiss>Proceed Anyway</button>
    </div>
  `;
  document.body.appendChild(wrapper);
  const dismissButton = wrapper.querySelector("[data-ml-warning-dismiss]");
  if (dismissButton) {
    dismissButton.addEventListener("click", dismissGenericWarningUI);
  }

  console.log("[ML] Full-page rainbow border injected on", location.href);
  console.log("[ML] Scan UI enabled");

  currentRiskAnalysisPromise = analyzeGenericWebsiteRisk()
    .then((analysis) => {
      updateRiskDrivenUI(analysis);
      return analysis;
    });

  return true;
}

function dismissGenericWarningUI() {
  const wrapper = document.getElementById("ml-fullpage-border");
  if (!wrapper) {
    console.log("[ML] dismissGenericWarningUI called but no overlay exists");
    return;
  }

  showLingeringWarningUI();
  wrapper.remove();
  console.log("[ML] Warning UI dismissed");
}

function showUrlBarWarning() {
  if (document.getElementById("ml-url-warning-bar")) return;

  const bar = document.createElement("div");
  bar.id = "ml-url-warning-bar";
  bar.className = "ml-url-warning-bar";
  bar.innerHTML = `
    <span class="ml-url-warning-bar-text">⚠️ ${window.location.hostname} is flagged as dangerous</span>
    <button type="button" class="ml-url-warning-bar-close" aria-label="Close top warning">×</button>
  `;
  document.body.appendChild(bar);

  const closeButton = bar.querySelector(".ml-url-warning-bar-close");
  if (closeButton) {
    closeButton.addEventListener("click", (event) => {
      event.stopPropagation();
      bar.remove();
      console.log("[ML] URL warning bar closed");
    });
  }

  requestAnimationFrame(() => {
    bar.classList.add("ml-visible");
  });

  console.log("[ML] URL warning bar shown");
}

function attachHoverTooltip(element) {
  if (!element || element.querySelector("#ml-warning-tooltip")) return;

  const tooltip = document.createElement("div");
  tooltip.id = "ml-warning-tooltip";
  tooltip.className = "ml-warning-tooltip";
  tooltip.innerHTML = `
    <div class="ml-warning-tooltip-title">Risk analysis pending</div>
    <p class="ml-warning-tooltip-body">Checking domain age, phishing keywords, and mismatched links.</p>
  `;
  element.appendChild(tooltip);

  element.addEventListener("mouseenter", () => {
    tooltip.classList.add("ml-visible");
  });

  element.addEventListener("mouseleave", () => {
    tooltip.classList.remove("ml-visible");
  });
}

function showFloatingBanner() {
  if (document.getElementById("ml-floating-warning-banner")) return;

  const banner = document.createElement("div");
  banner.id = "ml-floating-warning-banner";
  banner.className = "ml-floating-warning-banner";
  banner.textContent = "⚠️ Dangerous Site";
  document.body.appendChild(banner);
  attachHoverTooltip(banner);

  console.log("[ML] Floating warning banner shown");
}

function showLingeringWarningUI() {
  if (!document.body) {
    console.log("[ML] showLingeringWarningUI skipped: document.body is not ready");
    return;
  }

  showUrlBarWarning();
  showFloatingBanner();
  if (currentRiskAnalysis) {
    updateRiskDrivenUI(currentRiskAnalysis);
  }
  console.log("[ML] Lingering warning UI activated");
}

function triggerDangerOverlay() {
  const wrapper = document.getElementById("ml-fullpage-border");
  if (!wrapper) {
    console.log("[ML] triggerDangerOverlay called but no overlay exists");
    return;
  }

  wrapper.classList.remove("ml-fullpage-rainbow-border");
  wrapper.classList.add("ml-fullpage-final-red");
  console.log("[ML] Danger overlay transition started");
}

function stopFullPageBorder() {
  const wrapper = document.getElementById("ml-fullpage-border");
  if (!wrapper) {
    console.log("[ML] stopFullPageBorder called but no border exists");
    return;
  }

  triggerDangerOverlay();
  const warningPanel = wrapper.querySelector(".ml-warning-panel");
  if (warningPanel) {
    warningPanel.setAttribute("aria-hidden", "false");
  }
  console.log("[ML] Full-page border switched to final red");
  console.log("[ML] Warning modal displayed");
}

function ensureGenericPageBorder() {
  if (!isGenericWebsite()) return;

  console.log("[ML] ensureGenericPageBorder() start, readyState =", document.readyState, "url =", location.href);

  const tryInject = () => {
    const injected = injectFullPageRainbowBorder();
    if (!injected && !document.getElementById("ml-fullpage-border")) {
      console.log("[ML] Border not injected yet, retrying in 300ms");
      window.setTimeout(tryInject, 300);
    }
  };

  if (document.readyState === "loading") {
    console.log("[ML] Waiting for DOMContentLoaded before injecting full-page border");
    document.addEventListener("DOMContentLoaded", tryInject, { once: true });
    return;
  }

  tryInject();
}





function trimAndCleanText(text) {
  if (!text) return '';
  return text
    .split('\n')
    .map(line => line.trim())
    .filter(line => line.length > 0)
    .join('\n')
    .replace(/\n\n+/g, '\n\n');}

function extractEmailData() {
  let emailData = {
    subject: '',
    from: '',
    fromEmail: '',
    to: '',
    body: '',
    links: []
  };

  try {
    
    // Gmail subject - prefer the subject inside the main conversation view to avoid picking UI/search text
    let subjectEl = null;
    try {
      const main = document.querySelector('[role="main"]');
      if (main) {
        subjectEl = main.querySelector('h2.hP, h2[role="heading"], [data-subject]');
      }
    } catch (e) {}
    if (!subjectEl) subjectEl = document.querySelector('[data-subject]') || document.querySelector('h2.hP, h2');
    if (subjectEl) {
      emailData.subject = (subjectEl.getAttribute('data-subject') || subjectEl.innerText || subjectEl.textContent || '').trim();
    }

    const senderNameEl = document.querySelector('.gD');
    if (senderNameEl) {
      emailData.from = senderNameEl.innerText.trim();
    }

    let senderEmail = '';
    
    const gsElements = document.querySelectorAll('.gs');
    if (gsElements.length > 0) {
      for (let gsEl of gsElements) {
        const text = gsEl.innerText || gsEl.textContent;
        const emailMatch = text.match(/[\w\.-]+@[\w\.-]+\.\w+/);
        if (emailMatch) {
          const email = emailMatch[0];
          if (!email.includes('engage@go.explore')) {
            senderEmail = email.trim();
            console.log('Found email in .gs:', senderEmail);
            break;
          }
        }
      }
    }
    
    if (!senderEmail && senderNameEl) {
      const parent = senderNameEl.parentElement;
      if (parent) {
        const emailSpan = parent.querySelector('span[email]');
        if (emailSpan) {
          const email = emailSpan.getAttribute('email');
          if (email && email.includes('@') && !email.includes('engage@go.explore')) {
            senderEmail = email.trim();
            console.log('Found email in span[email]:', senderEmail);
          }
        }
      }
    }
    
    if (!senderEmail) {
      const allEmailSpans = document.querySelectorAll('span[email]');
      if (allEmailSpans.length > 0) {
        for (let span of allEmailSpans) {
          const email = span.getAttribute('email');
          if (email && email.includes('@') && !email.includes('engage@go.explore')) {
            senderEmail = email.trim();
            console.log('Found email in filtered search:', senderEmail);
            break;
          }
        }
      }
    }
    
    if (!senderEmail && senderNameEl) {
      const ariaLabel = senderNameEl.getAttribute('aria-label');
      if (ariaLabel && ariaLabel.includes('@')) {
        const emailMatch = ariaLabel.match(/[\w\.-]+@[\w\.-]+\.\w+/);
        if (emailMatch && !emailMatch[0].includes('engage@go.explore')) {
          senderEmail = emailMatch[0].trim();
          console.log('Found email in aria-label:', senderEmail);
        }
      }
    }

    emailData.fromEmail = senderEmail;

    const toElements = document.querySelectorAll('[data-email]');
    if (toElements.length > 0) {
      emailData.to = (toElements[0].getAttribute('data-email') || toElements[0].innerText || 'You').trim();
    }

    let bodyText = '';
    const bodyElements = document.querySelectorAll('.a3s.aiL, .a3s.ajx, [role="main"] .mGp');
    
    for (const el of bodyElements) {
      const style = window.getComputedStyle(el);
      if (style.display !== 'none' && style.visibility !== 'hidden' && el.offsetHeight > 0) {
        bodyText = el.innerText || el.textContent || '';
        break;
      }
    }

    if (!bodyText) {
      const altBody = document.querySelector('.msg, .h7');
      if (altBody) {
        bodyText = altBody.innerText || altBody.textContent || '';
      }
    }

    emailData.body = trimAndCleanText(bodyText);

    emailData.platform = 'gmail';

    const linkSet = new Set();
    let bodyContainer = null;
    
    const selectors = [
      '.a3s.aiL',
      '.a3s.ajx',
      '[role="main"] .mGp',
      '.msg',
      '.h7',
      '[role="main"]'
    ];
    
    for (const selector of selectors) {
      bodyContainer = document.querySelector(selector);
      if (bodyContainer) break;
    }
    
    if (bodyContainer) {
      const linkElements = bodyContainer.querySelectorAll('a[href]');
      console.log('Found links:', linkElements.length);
      
      linkElements.forEach(link => {
        const href = link.getAttribute('href');
        const text = link.innerText || link.textContent || '';
        
        if (href && !href.startsWith('mailto:') && !href.startsWith('#') && href.trim()) {
          let decodedUrl = href;
          try {
            if (decodedUrl.includes('%')) {
              decodedUrl = decodeURIComponent(href);
            }
          } catch (e) {
          }
          
          if (!linkSet.has(decodedUrl)) {
            linkSet.add(decodedUrl);
            emailData.links.push({
              text: text ? text.trim().substring(0, 100) : decodedUrl.substring(0, 100),
              href: decodedUrl
            });
          }
        }
      });
    } else {
      console.log('No body container found for link extraction');
      const urlRegex = /(https?:\/\/[^\s<>"{}|\\^`\[\]]*)/g;
      const urlMatches = bodyText.match(urlRegex);
      if (urlMatches) {
        urlMatches.forEach(url => {
          if (!linkSet.has(url)) {
            linkSet.add(url);
            emailData.links.push({
              text: url.substring(0, 100),
              href: url
            });
          }
        });
      }
    }

    console.log('=== EMAIL EXTRACTION DEBUG ===');
    console.log('Extracted email data:', {
      subject: emailData.subject,
      from: emailData.from,
      fromEmail: emailData.fromEmail,
      to: emailData.to
    });
    
    const debugGsElements = document.querySelectorAll('.gs');
    console.log(`.gs elements found (${debugGsElements.length}):`);
    debugGsElements.forEach((el, index) => {
      console.log(`  [${index}] "${el.innerText}"`);
    });
    
    const debugEmailSpans = document.querySelectorAll('span[email]');
    console.log(`span[email] elements found (${debugEmailSpans.length}):`);
    debugEmailSpans.forEach((span, index) => {
      console.log(`  [${index}] email="${span.getAttribute('email')}"`);
    });
    
    if (senderNameEl) {
      console.log('Sender name element (.gD):', senderNameEl.innerText);
    }
    
    return emailData;
  } catch (error) {
    console.error('Error extracting email data:', error);
    return emailData;
  }
}

  function extractWhatsAppData() {
    const data = { subject: '', from: '', fromEmail: '', to: '', body: '', links: [] };

    try {
      // Chat title/header
      const titleSelectors = ['header div[title]', 'header span[title]', 'header ._21nHd', 'header ._2S1VP'];
      for (const sel of titleSelectors) {
        const el = document.querySelector(sel);
        if (el && el.innerText) { data.subject = el.getAttribute('title') || el.innerText.trim(); break; }
      }

      // Get last few visible messages
      const messageAreaSelectors = ['div[role="region"]', '#main .copyable-area', 'div[data-testid="conversation-panel-messages"]', '#main'];
      let container = null;
      for (const s of messageAreaSelectors) { container = document.querySelector(s); if (container) break; }

      let texts = [];
      if (container) {
        const msgTextEls = container.querySelectorAll('span.selectable-text, div.copyable-text, span._3Whw5');
        msgTextEls.forEach(el => {
          const txt = el.innerText || el.textContent || '';
          if (txt.trim()) texts.push(txt.trim());
        });
        // Try to infer sender from last message's data-pre-plain-text (group chats)
        if (msgTextEls.length > 0) {
          try {
            const lastEl = msgTextEls[msgTextEls.length - 1];
            let pre = null;
            const closestWith = lastEl.closest('[data-pre-plain-text]');
            if (closestWith) pre = closestWith.getAttribute('data-pre-plain-text');
            if (!pre && lastEl.getAttribute) pre = lastEl.getAttribute('data-pre-plain-text');
            if (pre) {
              const m = pre.match(/,\s*([^:]+?):/);
              if (m && m[1]) {
                data.from = m[1].trim();
              }
            }
          } catch (e) {
            // ignore
          }
        }
      } else {
        // fallback: grab any visible selectable-text
        const fallback = document.querySelectorAll('span.selectable-text, div.copyable-text');
        fallback.forEach(el => { if ((el.innerText||el.textContent||'').trim()) texts.push((el.innerText||el.textContent).trim()); });
      }

      // Use last N messages for body
      if (texts.length > 0) {
        const last = texts.slice(-6).join('\n\n');
        data.body = trimAndCleanText(last);
      }

      // links
      const linkSet = new Set();
      if (container) {
        const aels = container.querySelectorAll('a[href]');
        aels.forEach(a => {
          const href = a.getAttribute('href');
          if (href && !href.startsWith('#')) {
            try { const dec = decodeURIComponent(href); linkSet.add(dec); } catch(e){ linkSet.add(href); }
          }
        });
      }
      data.links = Array.from(linkSet).map(u => ({ text: u, href: u }));
      data.platform = 'whatsapp';

      // If no explicit sender found, fall back to chat title
      if (!data.from) {
        try {
          const titleEl = document.querySelector('header div[title], header span[title], header ._21nHd, header ._2S1VP');
          if (titleEl) data.from = titleEl.getAttribute('title') || titleEl.innerText || data.from;
        } catch (e) {}
      }

      return data;
    } catch (e) {
      console.error('WhatsApp extraction error', e);
      return data;
    }
  }

  function extractTelegramData() {
    const data = { subject: '', from: '', fromEmail: '', to: '', body: '', links: [] };
    try {
      // Title / chat name detection (web.telegram.org variations)
      const titleSelectors = [
        'header .peer_title',
        'header .tg_head_peer_title',
        'header h1',
        '.chat-info .title',
        '.chat__title',
        '.chat-title',
        '.tg_head_peer_title'
      ];
      for (const sel of titleSelectors) {
        const el = document.querySelector(sel);
        if (el && (el.innerText || el.textContent)) { data.subject = (el.innerText || el.textContent).trim(); break; }
      }

      // Find the messages container by choosing the element that contains the most message-like children.
      const messageSelectors = [
        '.im_history_messages',
        '.im_history_scrollable_wrap',
        '.messages',
        '.tgme_widget_message_list',
        '.ListView',
        '.message_list',
        '.chat-list',
        '.im_history_messages_wrap'
      ];

      // message element candidates
      const msgSelectors = [
        '.message',
        '.message_wrap',
        '.tgme_widget_message',
        '.tgme_widget_message_text',
        '.im_message',
        '.bubble',
        '.message_text',
        '.text'
      ];

      let bestContainer = null;
      let bestCount = 0;

      // check each message container candidate and pick the one with most message elements
      for (const s of messageSelectors) {
        const cand = document.querySelectorAll(s);
        if (!cand) continue;
        for (const el of cand) {
          let count = 0;
          for (const m of msgSelectors) {
            const found = el.querySelectorAll(m);
            if (found) count += found.length;
          }
          if (count > bestCount) { bestCount = count; bestContainer = el; }
        }
      }

      let container = bestContainer;

      // If we didn't find a strong candidate, fallback to global search for message elements
      let msgEls = [];
      if (container) {
        for (const sel of msgSelectors) {
          const found = container.querySelectorAll(sel);
          if (found && found.length > 0) { msgEls = Array.from(found); break; }
        }
      }

      if (msgEls.length === 0) {
        // global fallback: find the container with most matches across document
        let globalBest = null; let globalBestCount = 0;
        for (const sel of msgSelectors) {
          const found = document.querySelectorAll(sel);
          if (found && found.length > globalBestCount) { globalBestCount = found.length; globalBest = found; }
        }
        if (globalBest) msgEls = Array.from(globalBest);
      }

      const texts = [];
      const linkSet = new Set();
      let lastSender = '';

      // Helper selectors for sender and text inside a message element
      const senderSelectors = ['.from_name', '.tgme_widget_message_author', '.message__sender', '.im_message_peer', '.from'];
      const textSelectors = ['.text', '.message_text', '.tgme_widget_message_text', '.message__text', '.im_message_text'];

      for (const el of msgEls) {
        try {
          // extract sender
          let sender = '';
          for (const s of senderSelectors) {
            const se = el.querySelector(s);
            if (se && (se.innerText || se.textContent)) { sender = (se.innerText || se.textContent).trim(); break; }
          }

          // extract message text
          let messageText = '';
          for (const tsel of textSelectors) {
            const te = el.querySelector(tsel);
            if (te && (te.innerText || te.textContent)) { messageText = (te.innerText || te.textContent).trim(); break; }
          }
          if (!messageText) {
            // fallback to innerText of the element if it looks like text
            const candidate = (el.innerText || el.textContent || '').trim();
            if (candidate && candidate.length < 2000) messageText = candidate;
          }

          if (messageText) {
            // ignore UI rows that look like sidebar items (very short label list like 'Add AccountMy Profile...')
            const trimmed = messageText.trim();
            if (trimmed.length > 2 && !/Add Account|My Profile|Saved Messages|Contacts|Settings|More|New Channel|New Group|New Message|Mark all as read/i.test(trimmed)) {
              if (sender) lastSender = sender;
              const line = sender ? `${sender}: ${messageText}` : messageText;
              texts.push(line);
            }
          }

          // collect links inside this message
          const aels = el.querySelectorAll('a[href]');
          aels.forEach(a => {
            const href = a.getAttribute('href');
            if (href && !href.startsWith('javascript:') && !href.startsWith('#')) {
              try { linkSet.add(decodeURIComponent(href)); } catch (e) { linkSet.add(href); }
            }
          });
        } catch (e) {
          // ignore element errors
        }
      }

      // Use last few messages to build body
      if (texts.length > 0) data.body = trimAndCleanText(texts.slice(-8).join('\n\n'));

      data.links = Array.from(linkSet).map(u => ({ text: u, href: u }));

      // If we detected senders, set the last sender as `from`
      if (lastSender) data.from = lastSender;

      // If no explicit subject/chat name, attempt to read header username/peer
      if (!data.subject) {
        try {
          const hdr = document.querySelector('.im_dialog_peer, .peer_title, .tg_head_peer_title, .chat-info .title');
          if (hdr && (hdr.innerText || hdr.textContent)) data.subject = (hdr.innerText || hdr.textContent).trim();
        } catch (e) {}
      }

      data.platform = 'telegram';
      return data;
    } catch (e) {
      console.error('Telegram extraction error', e);
      return data;
    }
  }

function watchForEmailChanges() {
  const container = document.body;
  if (!container) return;

  let lastSentData = null;
  let debounceTimer = null;
  let lastExtractedEmail = '';

  const sendEmailData = () => {
    let emailData = {};

    if (isGmail()) emailData = extractEmailData();
    else if (isWhatsApp()) emailData = extractWhatsAppData();
    else if (isTelegram()) emailData = extractTelegramData();
    else emailData = {};

    if (emailData && (emailData.body || emailData.subject)) {
      if (emailData.platform === "gmail") {
  //highlightGmailSubject("#f70000");
  if (emailData.platform === "gmail") {
  startAnalyzingAnimation();

  // TEMP TEST: simulate backend response
  setTimeout(() => {
    stopAnimationTurnRed();
  }, 4000);
}

    }
   else if (emailData.platform === "whatsapp") {
  highlightWhatsAppHeader("#ff0000");
}
      const dataString = JSON.stringify(emailData);
      if (dataString !== lastSentData || (emailData.fromEmail || '') !== lastExtractedEmail) {
        lastSentData = dataString;
        lastExtractedEmail = emailData.fromEmail || '';
        console.log('📨 Sending data - From:', emailData.fromEmail || emailData.from, 'Subject:', emailData.subject);
        chrome.runtime.sendMessage({ action: 'updateEmail', data: emailData }, (response) => {
          if (chrome.runtime.lastError) console.log('⚠️ Background service worker not ready yet');
          else if (response?.success) console.log('✓ Data sent to background');
        });
      }
    } else {
      console.log('⚠️ No content found for this page');
    }
  };

  const observer = new MutationObserver(() => {
    clearTimeout(debounceTimer);
    debounceTimer = setTimeout(sendEmailData, 500);
  });

  observer.observe(container, {
    childList: true,
    subtree: true,
    attributes: true,
    attributeFilter: ['aria-label', 'data-subject']
  });

  document.addEventListener('click', () => {
    clearTimeout(debounceTimer);
    debounceTimer = setTimeout(sendEmailData, 300);
  }, true);

  // Initial extraction attempt with delay
  console.log('Starting email watcher...');
  sendEmailData();
  
  setTimeout(sendEmailData, 1000);
  setTimeout(sendEmailData, 2000);
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', watchForEmailChanges);
} else {
  watchForEmailChanges();
}

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  console.log('Content script received message:', request.action);
  
  if (request.action === 'sendCurrentEmail') {
    let emailData = {};
    if (isGmail()) emailData = extractEmailData();
    else if (isWhatsApp()) emailData = extractWhatsAppData();
    else if (isTelegram()) emailData = extractTelegramData();

    console.log('Extracted data for popup:', emailData);

    if (emailData.subject || emailData.body) {
      chrome.runtime.sendMessage({ action: 'updateEmail', data: emailData }, (response) => {
        console.log('Data sent to background:', response);
        sendResponse({ success: true });
      });
    } else {
      console.log('No data found');
      sendResponse({ success: false, error: 'No content found' });
    }
  }
});

// Also watch for visibility changes and user interactions that might switch emails
window.addEventListener('focus', () => {
  let emailData = {};
  if (isGmail()) emailData = extractEmailData();
  else if (isWhatsApp()) emailData = extractWhatsAppData();
  else if (isTelegram()) emailData = extractTelegramData();
  if (emailData.body || emailData.subject) {
    chrome.runtime.sendMessage({ action: 'updateEmail', data: emailData }).catch(() => console.log('Background not ready'));
  }
});

let lastUrl = window.location.href;
setInterval(() => {
  if (window.location.href !== lastUrl) {
    lastUrl = window.location.href;
    console.log('URL changed, extracting new email');
    if (isGenericWebsite()) {
      console.log("[ML] URL changed on generic site, re-checking full-page border");
      ensureGenericPageBorder();
    }
    setTimeout(() => {
      let emailData = {};
      if (isGmail()) emailData = extractEmailData();
      else if (isWhatsApp()) emailData = extractWhatsAppData();
      else if (isTelegram()) emailData = extractTelegramData();
      if (emailData.body || emailData.subject) {
        chrome.runtime.sendMessage({ action: 'updateEmail', data: emailData }).catch(() => console.log('Background not ready'));
      }
    }, 300);
  }
}, 500);

document.addEventListener('keydown', (e) => {
  if ((e.key === 'j' || e.key === 'k') && !e.ctrlKey && !e.metaKey) {
    setTimeout(() => {
      let emailData = {};
      if (isGmail()) emailData = extractEmailData();
      else if (isWhatsApp()) emailData = extractWhatsAppData();
      else if (isTelegram()) emailData = extractTelegramData();
      if (emailData.body || emailData.subject) {
        chrome.runtime.sendMessage({ action: 'updateEmail', data: emailData }).catch(() => console.log('Background not ready'));
      }
    }, 300);
  }
}, true);

// ================= WEBSITE SCAN TRIGGER =================

if (isGenericWebsite()) {
  console.log("[ML] Generic website detected, preparing full-page border");
  ensureGenericPageBorder();

  setTimeout(() => {
    stopFullPageBorder();
  }, 3000);
}

}
