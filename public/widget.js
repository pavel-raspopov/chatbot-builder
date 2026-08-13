/**
 * DocuChat embed launcher.
 * Injects a floating button and an iframe to /w/{public_id}/embed.
 * Launcher colors copied from context/ui-tokens.md — host pages have no Tailwind.
 * Does not call chat APIs (wired in feature 11).
 */
(function () {
  "use strict";

  function findScript() {
    if (document.currentScript) {
      return document.currentScript;
    }
    var scripts = document.querySelectorAll("script[data-bot]");
    for (var i = scripts.length - 1; i >= 0; i -= 1) {
      var src = scripts[i].getAttribute("src") || "";
      if (src.indexOf("widget.js") !== -1) {
        return scripts[i];
      }
    }
    return null;
  }

  var script = findScript();
  if (!script) {
    return;
  }

  var publicId = (script.getAttribute("data-bot") || "").trim();
  if (!publicId) {
    return;
  }

  var origin = new URL(script.src || "/widget.js", window.location.href).origin;
  var embedSrc = origin + "/w/" + encodeURIComponent(publicId) + "/embed";
  var hostId = "docuchat-widget-host";
  if (document.getElementById(hostId)) {
    return;
  }

  var reduceMotion =
    window.matchMedia &&
    window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  var host = document.createElement("div");
  host.id = hostId;
  host.setAttribute("data-docuchat-widget", "true");
  host.style.cssText = [
    "position:fixed",
    "right:20px",
    "bottom:20px",
    "z-index:2147483646",
    "font-family:ui-sans-serif,system-ui,sans-serif",
  ].join(";");

  var frameWrap = document.createElement("div");
  frameWrap.id = "docuchat-widget-frame";
  frameWrap.hidden = true;
  frameWrap.style.cssText = [
    "position:absolute",
    "right:0",
    "bottom:68px",
    "width:min(380px,calc(100vw - 32px))",
    "height:min(560px,calc(100vh - 120px))",
    "overflow:hidden",
    "border:1px solid #c5d0c9",
    "border-radius:1rem",
    "background:#f7faf8",
    "box-shadow:0 1px 2px rgb(20 36 31 / 0.06), 0 8px 24px rgb(20 36 31 / 0.06)",
  ].join(";");

  var iframe = document.createElement("iframe");
  iframe.src = embedSrc;
  iframe.title = "Chat";
  iframe.setAttribute("aria-label", "Chat");
  iframe.style.cssText = "width:100%;height:100%;border:0;display:block;";

  var button = document.createElement("button");
  button.type = "button";
  button.setAttribute("aria-label", "Open chat");
  button.setAttribute("aria-expanded", "false");
  button.setAttribute("aria-controls", "docuchat-widget-frame");
  button.style.cssText = [
    "display:flex",
    "align-items:center",
    "justify-content:center",
    "width:56px",
    "height:56px",
    "margin-left:auto",
    "border:0",
    "border-radius:999px",
    "background:#1f6b4f",
    "color:#f7faf8",
    "cursor:pointer",
    "box-shadow:0 1px 2px rgb(20 36 31 / 0.06), 0 8px 24px rgb(20 36 31 / 0.06)",
    reduceMotion ? "" : "transition:background-color 0.15s ease",
  ]
    .filter(Boolean)
    .join(";");
  button.innerHTML =
    '<svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M5 6.5A2.5 2.5 0 0 1 7.5 4h9A2.5 2.5 0 0 1 19 6.5v7A2.5 2.5 0 0 1 16.5 16H11l-4 3.5V16H7.5A2.5 2.5 0 0 1 5 13.5v-7Z" stroke="currentColor" stroke-width="1.75" stroke-linejoin="round"/></svg>';

  button.addEventListener("mouseenter", function () {
    button.style.background = "#15523c";
  });
  button.addEventListener("mouseleave", function () {
    button.style.background = "#1f6b4f";
  });

  function setOpen(open) {
    frameWrap.hidden = !open;
    button.setAttribute("aria-expanded", open ? "true" : "false");
    button.setAttribute("aria-label", open ? "Close chat" : "Open chat");
  }

  button.addEventListener("click", function () {
    setOpen(frameWrap.hidden);
  });

  frameWrap.appendChild(iframe);
  host.appendChild(frameWrap);
  host.appendChild(button);
  document.body.appendChild(host);
})();
