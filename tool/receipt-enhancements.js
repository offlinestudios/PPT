(function () {
  "use strict";

  var STUDIO = {
    businessName: "Passport Photo Toronto",
    studioName: "Offline Studios",
    address: "63 McCaul St, Toronto, ON M5T 2W7",
    phone: "(416) 986-2677",
    website: "www.passportphototoronto.com",
    logoSrc: "/images/logo.png"
  };

  var styles = [
    "[data-ppt-receipt-host]{position:static}",
    "[data-ppt-receipt-host] .ppt-receipt-card{position:static;margin-top:12px;z-index:auto}",
    ".ppt-receipt-card{border:1px solid var(--border,#e5e7eb);background:var(--card,#fff);border-radius:8px;box-shadow:0 6px 18px rgba(15,23,42,.08);overflow:hidden}",
    ".ppt-receipt-card summary{display:flex;align-items:center;justify-content:space-between;gap:10px;padding:10px 12px;cursor:pointer;list-style:none}",
    ".ppt-receipt-card summary::-webkit-details-marker{display:none}",
    ".ppt-receipt-card summary:after{content:'Open';font-size:11px;font-weight:700;color:var(--muted-foreground,#6b7280);text-transform:uppercase;letter-spacing:.04em}",
    ".ppt-receipt-card[open] summary{border-bottom:1px solid var(--border,#e5e7eb)}",
    ".ppt-receipt-card[open] summary:after{content:'Close'}",
    ".ppt-receipt-card h3{font-size:15px;line-height:1.35;margin:0;color:var(--foreground,#1a1a1a)}",
    ".ppt-receipt-card p{font-size:12px;line-height:1.45;margin:0;color:var(--muted-foreground,#6b7280)}",
    ".ppt-receipt-body{padding:12px}",
    ".ppt-receipt-form{display:grid;grid-template-columns:1fr;gap:10px}",
    ".ppt-receipt-grid{display:grid;grid-template-columns:1fr;gap:10px}",
    ".ppt-receipt-field{display:grid;gap:4px}",
    ".ppt-receipt-field label{font-size:12px;font-weight:600;color:var(--foreground,#1a1a1a)}",
    ".ppt-receipt-field input,.ppt-receipt-field select{height:36px;width:100%;border:1px solid var(--input,#e5e7eb);border-radius:6px;background:transparent;padding:0 10px;font-size:14px;color:var(--foreground,#1a1a1a)}",
    ".ppt-receipt-help{padding:10px;border-radius:6px;background:rgba(245,158,11,.1);border:1px solid rgba(245,158,11,.28)}",
    ".ppt-receipt-actions{display:flex;gap:8px;flex-wrap:wrap}",
    ".ppt-receipt-button{height:36px;border-radius:6px;padding:0 12px;border:1px solid var(--border,#e5e7eb);font-size:13px;font-weight:700;background:var(--primary,#1e3a5f);color:var(--primary-foreground,#f9fafb);cursor:pointer}",
    ".ppt-receipt-button.secondary{background:transparent;color:var(--foreground,#1a1a1a)}",
    ".ppt-receipt-status{font-size:12px;min-height:18px;color:var(--muted-foreground,#6b7280)}",
    "@media (min-width:900px){.ppt-receipt-grid{grid-template-columns:1fr 1fr}.ppt-receipt-field.full{grid-column:1/-1}}"
  ].join("");

  function injectStyles() {
    if (document.getElementById("ppt-receipt-enhancement-styles")) return;
    var style = document.createElement("style");
    style.id = "ppt-receipt-enhancement-styles";
    style.textContent = styles;
    document.head.appendChild(style);
  }

  function formatDate(value) {
    if (!value) return "";
    var parts = value.split("-");
    if (parts.length !== 3) return value;
    return parts[1] + "/" + parts[2] + "/" + parts[0];
  }

  function todayForFilename() {
    return new Date().toISOString().slice(0, 10);
  }

  function todayForReceipt() {
    return new Date().toLocaleDateString("en-CA", {
      year: "numeric",
      month: "long",
      day: "numeric"
    });
  }

  function escapeHtml(value) {
    return String(value || "")
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#039;");
  }

  function receiptHtml(details) {
    var isPr = details.type === "pr";
    var title = isPr ? "Permanent Resident Card Photo Receipt" : "Canadian Citizenship Photo Receipt";
    var requirementLine = isPr
      ? "Customer name and date of birth recorded for PR card photo studio information requirements."
      : "Customer name recorded for Canadian citizenship photo studio information requirements.";
    var dobRow = isPr
      ? '<div class="row"><span>Date of birth</span><strong>' + escapeHtml(formatDate(details.dob)) + "</strong></div>"
      : "";

    return "<!doctype html>\n" +
      '<html lang="en">\n<head>\n<meta charset="UTF-8">\n' +
      '<meta name="viewport" content="width=device-width, initial-scale=1.0">\n' +
      "<title>" + escapeHtml(title) + "</title>\n" +
      "<style>\n" +
      "body{font-family:Arial,Helvetica,sans-serif;margin:0;background:#f3f4f6;color:#111827}.page{max-width:760px;margin:32px auto;padding:24px}.receipt{background:#fff;border:1px solid #d1d5db;border-radius:8px;padding:28px;box-shadow:0 10px 24px rgba(15,23,42,.08)}.top{display:flex;justify-content:space-between;gap:24px;border-bottom:2px solid #111827;padding-bottom:18px;margin-bottom:22px}.brand{display:flex;align-items:flex-start;gap:14px}.logo{width:72px;height:auto;object-fit:contain;flex:0 0 auto}.brand h1{font-size:24px;margin:0 0 4px}.brand p,.meta p{font-size:13px;line-height:1.45;margin:0;color:#4b5563}.meta{text-align:right}.section{margin-top:20px}.section h2{font-size:15px;text-transform:uppercase;letter-spacing:.08em;margin:0 0 10px;color:#374151}.row{display:flex;justify-content:space-between;gap:20px;border-bottom:1px solid #e5e7eb;padding:10px 0;font-size:15px}.row span{color:#4b5563}.row strong{text-align:right}.note{background:#fffbeb;border:1px solid #fcd34d;border-radius:6px;padding:12px;margin-top:18px;font-size:13px;line-height:1.5}.signature{display:grid;grid-template-columns:1fr 1fr;gap:24px;margin-top:34px}.line{border-top:1px solid #111827;min-height:1px}@media print{body{background:#fff}.page{margin:0;max-width:none}.receipt{box-shadow:none;border:0}}@media(max-width:640px){.top,.signature{display:block}.meta{text-align:left;margin-top:14px}.line{margin-top:28px}}\n" +
      "</style>\n</head>\n<body>\n" +
      '<main class="page"><article class="receipt">\n' +
      '<div class="top"><div class="brand"><img class="logo" src="' + escapeHtml(STUDIO.logoSrc) + '" alt="' + escapeHtml(STUDIO.businessName) + ' logo"><div><h1>' + escapeHtml(STUDIO.businessName) + "</h1>" +
      "<p>" + escapeHtml(STUDIO.studioName) + "</p>" +
      "<p>" + escapeHtml(STUDIO.address) + "</p>" +
      "<p>" + escapeHtml(STUDIO.phone) + " | " + escapeHtml(STUDIO.website) + "</p></div></div>" +
      '<div class="meta"><p><strong>' + escapeHtml(title) + "</strong></p>" +
      "<p>Issued: " + escapeHtml(todayForReceipt()) + "</p>" +
      "<p>Receipt ID: PPT-" + escapeHtml(Date.now()) + "</p></div></div>\n" +
      '<section class="section"><h2>Customer Information</h2>' +
      '<div class="row"><span>Customer name</span><strong>' + escapeHtml(details.name) + "</strong></div>" +
      dobRow + "</section>\n" +
      '<section class="section"><h2>Photo Service</h2>' +
      '<div class="row"><span>Document type</span><strong>' + escapeHtml(isPr ? "Canadian PR Card Photo" : "Canadian Citizenship Photo") + "</strong></div>" +
      '<div class="row"><span>Studio</span><strong>' + escapeHtml(STUDIO.studioName) + "</strong></div>" +
      '<div class="row"><span>Studio address</span><strong>' + escapeHtml(STUDIO.address) + "</strong></div>" +
      '<div class="row"><span>Photo date</span><strong>' + escapeHtml(todayForReceipt()) + "</strong></div>" +
      "</section>\n" +
      '<div class="note">' + escapeHtml(requirementLine) + " This receipt confirms that the photo was produced by the studio listed above.</div>" +
      '<div class="signature"><div class="line"></div><div class="line"></div></div>' +
      "\n</article></main>\n</body>\n</html>\n";
  }

  function drawWrappedText(ctx, text, x, y, maxWidth, lineHeight) {
    var words = String(text || "").split(/\s+/);
    var line = "";
    for (var i = 0; i < words.length; i += 1) {
      var test = line ? line + " " + words[i] : words[i];
      if (ctx.measureText(test).width > maxWidth && line) {
        ctx.fillText(line, x, y);
        line = words[i];
        y += lineHeight;
      } else {
        line = test;
      }
    }
    if (line) ctx.fillText(line, x, y);
    return y + lineHeight;
  }

  function drawRow(ctx, label, value, y) {
    ctx.strokeStyle = "#e5e7eb";
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(96, y + 58);
    ctx.lineTo(1504, y + 58);
    ctx.stroke();
    ctx.fillStyle = "#4b5563";
    ctx.font = "32px Arial, Helvetica, sans-serif";
    ctx.fillText(label, 96, y + 38);
    ctx.fillStyle = "#111827";
    ctx.font = "bold 32px Arial, Helvetica, sans-serif";
    ctx.textAlign = "right";
    ctx.fillText(value, 1504, y + 38);
    ctx.textAlign = "left";
    return y + 76;
  }

  function loadLogoImage() {
    return new Promise(function (resolve) {
      var image = new Image();
      image.onload = function () {
        resolve(image);
      };
      image.onerror = function () {
        resolve(null);
      };
      image.src = STUDIO.logoSrc;
    });
  }

  async function receiptCanvas(details) {
    var isPr = details.type === "pr";
    var logo = await loadLogoImage();
    var canvas = document.createElement("canvas");
    canvas.width = 1600;
    canvas.height = 2200;
    var ctx = canvas.getContext("2d");
    if (!ctx) throw new Error("Failed to create receipt image");

    ctx.fillStyle = "#f3f4f6";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = "#ffffff";
    ctx.fillRect(64, 64, 1472, 2072);
    ctx.strokeStyle = "#d1d5db";
    ctx.lineWidth = 2;
    ctx.strokeRect(64, 64, 1472, 2072);

    if (logo) {
      ctx.drawImage(logo, 96, 112, 108, 72);
    }
    ctx.fillStyle = "#111827";
    ctx.font = "bold 52px Arial, Helvetica, sans-serif";
    ctx.fillText(STUDIO.businessName, logo ? 232 : 96, 156);
    ctx.fillStyle = "#4b5563";
    ctx.font = "28px Arial, Helvetica, sans-serif";
    ctx.fillText(STUDIO.studioName, logo ? 232 : 96, 204);
    ctx.fillText(STUDIO.address, logo ? 232 : 96, 244);
    ctx.fillText(STUDIO.phone + " | " + STUDIO.website, logo ? 232 : 96, 284);

    ctx.textAlign = "right";
    ctx.fillStyle = "#111827";
    ctx.font = "bold 32px Arial, Helvetica, sans-serif";
    ctx.fillText(isPr ? "Permanent Resident Card Photo Receipt" : "Canadian Citizenship Photo Receipt", 1504, 156);
    ctx.fillStyle = "#4b5563";
    ctx.font = "26px Arial, Helvetica, sans-serif";
    ctx.fillText("Issued: " + todayForReceipt(), 1504, 204);
    ctx.fillText("Receipt ID: PPT-" + Date.now(), 1504, 244);
    ctx.textAlign = "left";

    ctx.strokeStyle = "#111827";
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.moveTo(96, 334);
    ctx.lineTo(1504, 334);
    ctx.stroke();

    var y = 420;
    ctx.fillStyle = "#374151";
    ctx.font = "bold 26px Arial, Helvetica, sans-serif";
    ctx.fillText("CUSTOMER INFORMATION", 96, y);
    y += 34;
    y = drawRow(ctx, "Customer name", details.name, y);
    if (isPr) y = drawRow(ctx, "Date of birth", formatDate(details.dob), y);

    y += 44;
    ctx.fillStyle = "#374151";
    ctx.font = "bold 26px Arial, Helvetica, sans-serif";
    ctx.fillText("PHOTO SERVICE", 96, y);
    y += 34;
    y = drawRow(ctx, "Document type", isPr ? "Canadian PR Card Photo" : "Canadian Citizenship Photo", y);
    y = drawRow(ctx, "Studio", STUDIO.studioName, y);
    y = drawRow(ctx, "Studio address", STUDIO.address, y);
    y = drawRow(ctx, "Photo date", todayForReceipt(), y);

    var note = isPr
      ? "Customer name and date of birth recorded for PR card photo studio information requirements. This receipt confirms that the photo was produced by the studio listed above."
      : "Customer name recorded for Canadian citizenship photo studio information requirements. This receipt confirms that the photo was produced by the studio listed above.";
    y += 52;
    ctx.fillStyle = "#fffbeb";
    ctx.fillRect(96, y, 1408, 180);
    ctx.strokeStyle = "#fcd34d";
    ctx.lineWidth = 2;
    ctx.strokeRect(96, y, 1408, 180);
    ctx.fillStyle = "#111827";
    ctx.font = "28px Arial, Helvetica, sans-serif";
    drawWrappedText(ctx, note, 124, y + 48, 1352, 42);

    ctx.strokeStyle = "#111827";
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(96, 1950);
    ctx.lineTo(712, 1950);
    ctx.moveTo(888, 1950);
    ctx.lineTo(1504, 1950);
    ctx.stroke();

    return canvas;
  }

  async function downloadJpg(filename, details) {
    var canvas = await receiptCanvas(details);
    var url = canvas.toDataURL("image/jpeg", 0.96);
    var link = document.createElement("a");
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }

  function updateConditionalFields(card) {
    var type = card.querySelector("[data-ppt-receipt-type]").value;
    var dobWrap = card.querySelector("[data-ppt-dob-wrap]");
    var help = card.querySelector("[data-ppt-receipt-help]");
    dobWrap.hidden = type !== "pr";
    help.textContent = type === "pr"
      ? "PR card receipts include customer name, date of birth, and the studio information."
      : "Citizenship photo receipts include customer name and the studio information.";
  }

  function buildReceiptCard() {
    var card = document.createElement("details");
    card.className = "ppt-receipt-card";
    card.setAttribute("data-ppt-receipt-card", "true");
    card.innerHTML =
      '<summary><span><h3>Receipt</h3><p>PR card / citizenship receipt export</p></span></summary>' +
      '<div class="ppt-receipt-body">' +
      '<p>Create a JPG receipt beside the photo export tools.</p>' +
      '<div class="ppt-receipt-form">' +
      '<div class="ppt-receipt-grid">' +
      '<div class="ppt-receipt-field"><label for="ppt-receipt-type">Receipt type</label><select id="ppt-receipt-type" data-ppt-receipt-type><option value="pr">Canadian PR Card Photo</option><option value="citizenship">Canadian Citizenship Photo</option></select></div>' +
      '<div class="ppt-receipt-field"><label for="ppt-receipt-name">Customer name</label><input id="ppt-receipt-name" data-ppt-receipt-name type="text" autocomplete="name" placeholder="Full legal name"></div>' +
      '<div class="ppt-receipt-field" data-ppt-dob-wrap><label for="ppt-receipt-dob">Date of birth</label><input id="ppt-receipt-dob" data-ppt-receipt-dob type="date"></div>' +
      '</div>' +
      '<div class="ppt-receipt-help" data-ppt-receipt-help></div>' +
      '<div class="ppt-receipt-actions"><button class="ppt-receipt-button" type="button" data-ppt-download-receipt>Download JPG Receipt</button><button class="ppt-receipt-button secondary" type="button" data-ppt-preview-receipt>Open / Save PDF</button></div>' +
      '<p class="ppt-receipt-status" data-ppt-receipt-status></p>' +
      "</div></div>";

    card.querySelector("[data-ppt-receipt-type]").addEventListener("change", function () {
      updateConditionalFields(card);
    });

    function collectDetails() {
      var type = card.querySelector("[data-ppt-receipt-type]").value;
      var name = card.querySelector("[data-ppt-receipt-name]").value.trim();
      var dob = card.querySelector("[data-ppt-receipt-dob]").value;
      var status = card.querySelector("[data-ppt-receipt-status]");
      if (!name) {
        status.textContent = "Enter the customer's name first.";
        return null;
      }
      if (type === "pr" && !dob) {
        status.textContent = "Enter the customer's date of birth for a PR card receipt.";
        return null;
      }
      status.textContent = "";
      return { type: type, name: name, dob: dob };
    }

    card.querySelector("[data-ppt-download-receipt]").addEventListener("click", async function () {
      var details = collectDetails();
      if (!details) return;
      var button = card.querySelector("[data-ppt-download-receipt]");
      var status = card.querySelector("[data-ppt-receipt-status]");
      var slug = details.name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "") || "customer";
      var kind = details.type === "pr" ? "pr-card" : "citizenship";
      button.disabled = true;
      status.textContent = "Preparing receipt JPG...";
      try {
        await downloadJpg("ppt-" + kind + "-receipt-" + slug + "-" + todayForFilename() + ".jpg", details);
        status.textContent = "Receipt JPG downloaded.";
      } catch (error) {
        status.textContent = "Receipt JPG could not be created. Try Open / Save PDF.";
      } finally {
        button.disabled = false;
      }
    });

    card.querySelector("[data-ppt-preview-receipt]").addEventListener("click", function () {
      var details = collectDetails();
      if (!details) return;
      var win = window.open("", "_blank", "noopener,noreferrer");
      if (!win) {
        card.querySelector("[data-ppt-receipt-status]").textContent = "Allow pop-ups to preview the receipt.";
        return;
      }
      win.document.open();
      win.document.write(receiptHtml(details));
      win.document.close();
    });

    updateConditionalFields(card);
    return card;
  }

  function replaceCanadianPassportLabels(root) {
    var walker = document.createTreeWalker(root || document.body, NodeFilter.SHOW_TEXT);
    var node;
    while ((node = walker.nextNode())) {
      if (node.nodeValue === "Canada Passport") node.nodeValue = "Canadian Passport/PR/Citizenship";
      if (node.nodeValue === " Canada Passport") node.nodeValue = " Canadian Passport/PR/Citizenship";
    }
  }

  function findExportControls() {
    var buttons = Array.from(document.querySelectorAll("button"));
    var digitalButton = buttons.find(function (button) {
      return button.textContent.trim() === "Digital" || button.textContent.trim() === "Exporting...";
    });
    var printButton = buttons.find(function (button) {
      return button.textContent.trim() === "Export for Print";
    });
    if (!digitalButton || !printButton) return null;
    if (digitalButton.parentElement && digitalButton.parentElement === printButton.parentElement) {
      return digitalButton.parentElement;
    }
    return null;
  }

  function mountReceiptCard() {
    var existing = document.querySelector("[data-ppt-receipt-card]");
    var exportControls = findExportControls();
    if (!exportControls) {
      if (existing) existing.remove();
      return;
    }
    var card = existing || buildReceiptCard();
    var host = exportControls.parentElement;
    host.setAttribute("data-ppt-receipt-host", "true");
    if (card.parentElement !== host || card.nextElementSibling !== null) {
      host.appendChild(card);
    }
  }

  function enhance() {
    injectStyles();
    replaceCanadianPassportLabels(document.body);
    mountReceiptCard();
  }

  var observer = new MutationObserver(function () {
    enhance();
  });

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", function () {
      enhance();
      observer.observe(document.body, { childList: true, subtree: true });
    });
  } else {
    enhance();
    observer.observe(document.body, { childList: true, subtree: true });
  }
})();
