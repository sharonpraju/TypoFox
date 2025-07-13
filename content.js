let originalText = "";
let currentInput = null;

function makeDraggable(el) {
  let isDragging = false, startX = 0, startY = 0, origX = 0, origY = 0;

  el.addEventListener("mousedown", (e) => {
    if (e.target.tagName.toLowerCase() === "button" || e.target.tagName.toLowerCase() === "img") return;
    isDragging = true;
    startX = e.clientX;
    startY = e.clientY;
    const rect = el.getBoundingClientRect();
    origX = rect.left;
    origY = rect.top;
    el.style.cursor = "grabbing";
    e.preventDefault();
  });

  document.addEventListener("mousemove", (e) => {
    if (!isDragging) return;
    const dx = e.clientX - startX;
    const dy = e.clientY - startY;
    el.style.left = `${dx + origX}px`;
    el.style.top = `${dy + origY}px`;
    el.style.right = "unset"; // prevent CSS override
    el.style.bottom = "unset";
  });

  document.addEventListener("mouseup", () => {
    isDragging = false;
    el.style.cursor = "grab";
  });
}

function createFloatingPanel(showFixButtons = false) {
  removeFloatingPanel();

  const panel = document.createElement("div");
  panel.id = "typofox-panel";
  panel.style.position = "fixed";
  panel.style.bottom = "80px";
  panel.style.right = "0px";
  panel.style.zIndex = "999999";
  panel.style.background = "#222123ff";
  panel.style.borderRadius = "8px";
  panel.style.padding = "10px 8px";
  panel.style.display = "flex";
  panel.style.flexDirection = "column";
  panel.style.alignItems = "center";
  panel.style.gap = "10px";
  panel.style.fontFamily = "sans-serif";
  panel.style.fontSize = "12px";
  panel.style.boxShadow = "0 2px 8px rgba(0,0,0,0.2)";
  panel.style.cursor = "grab";
  panel.style.left = "unset";
  panel.style.top = "unset";

  panel.addEventListener("mousedown", (e) => e.stopPropagation());

  const logo = document.createElement("img");
  logo.src = chrome.runtime.getURL("assets/icon48.png");
  logo.style.width = "20px";
  logo.style.height = "20px";
  logo.title = "TypoFox";
  panel.appendChild(logo);

  if (showFixButtons) {
    const fixBtn = document.createElement("img");
    fixBtn.src = chrome.runtime.getURL("assets/icon-fix.png");
    fixBtn.style.width = "20px";
    fixBtn.style.height = "20px";
    fixBtn.title = "Fix text";
    fixBtn.style.cursor = "pointer";

    fixBtn.onclick = async () => {
      if (!currentInput) return;
      originalText = currentInput.innerText || currentInput.value;

      const apiKey = await getApiKey();
      if (!apiKey) return showToast("No API key found. Set it in TypoFox settings.");

      fixBtn.src = chrome.runtime.getURL("assets/spinner.gif");
      fixBtn.style.pointerEvents = "none";

      const fixed = await getFixedText(originalText, apiKey);

      fixBtn.src = chrome.runtime.getURL("assets/icon-fix.png");
      fixBtn.style.pointerEvents = "auto";

      if (!fixed) return;

      if (isSensitiveEditor(currentInput)) {
        try {
          await navigator.clipboard.writeText(fixed);
          showToast("✅ Fixed! Copied to clipboard. Paste it manually.");
        } catch {
          showToast("Fixed! But clipboard access failed.");
        }
        return;
      }

      if ("value" in currentInput) {
        currentInput.value = fixed;
        currentInput.focus();
        currentInput.dispatchEvent(new Event("input", { bubbles: true }));
      } else if (currentInput.isContentEditable) {
        currentInput.innerText = fixed;
        currentInput.focus();
        currentInput.dispatchEvent(new Event("input", { bubbles: true }));
      }

      showToast("✅ Text fixed!");
    };

    const undoIcon = document.createElement("img");
    undoIcon.src = chrome.runtime.getURL("assets/icon-undo.png");
    undoIcon.style.width = "20px";
    undoIcon.style.height = "20px";
    undoIcon.style.cursor = "pointer";
    undoIcon.title = "Undo changes";

    undoIcon.onclick = () => {
      if (!originalText || !currentInput) return;

      if ("value" in currentInput) {
        currentInput.value = originalText;
        currentInput.focus();
      } else if (currentInput.isContentEditable) {
        currentInput.innerText = originalText;
        currentInput.focus();
      }

      showToast("🔁 Text restored!");
    };

    panel.appendChild(fixBtn);
    panel.appendChild(undoIcon);
  }

  const rescanIcon = document.createElement("img");
  rescanIcon.src = chrome.runtime.getURL("assets/icon-rescan.png");
  rescanIcon.style.width = "20px";
  rescanIcon.style.height = "20px";
  rescanIcon.style.cursor = "pointer";
  rescanIcon.title = "Rescan this page";
  rescanIcon.onclick = () => {
    document.querySelectorAll('textarea, input[type="text"], [contenteditable="true"]').forEach(attachListeners);
    findAndAttachToTinyMCE();
    showToast("🔍 Rescanned the page.");
  };

  panel.appendChild(rescanIcon);
  document.body.appendChild(panel);
  makeDraggable(panel);
}

function removeFloatingPanel() {
  const existing = document.getElementById("typofox-panel");
  if (existing) existing.remove();
}

function showToast(message) {
  const toast = document.createElement("div");
  toast.textContent = message;
  toast.style.position = "fixed";
  toast.style.bottom = "30px";
  toast.style.right = "30px";
  toast.style.padding = "12px 16px";
  toast.style.background = "#222";
  toast.style.color = "#fff";
  toast.style.borderRadius = "6px";
  toast.style.boxShadow = "0 2px 8px rgba(0,0,0,0.3)";
  toast.style.zIndex = "999999";
  toast.style.fontSize = "14px";
  toast.style.opacity = "0";
  toast.style.transition = "opacity 0.3s ease-in-out";
  document.body.appendChild(toast);
  requestAnimationFrame(() => toast.style.opacity = "1");
  setTimeout(() => {
    toast.style.opacity = "0";
    setTimeout(() => toast.remove(), 500);
  }, 3000);
}

async function getFixedText(text, apiKey) {
  //if text is empty, return null
  if (!text || text.trim() === "") {
    showToast("Could not fix empty text.");
    return null;
  } else {
    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        model: "gpt-3.5-turbo",
        messages: [
          { role: "system", content: "You are a natural-sounding writing assistant. Rewrite the input to sound like it was written by a real person. Fix grammar, and rephrase only if it improves natural flow. If no input text is provided, return nothing. Return only the improved text — no tags, no explanation, no placeholders." },
          { role: "user", content: `Proofread and correct this text:\n\n${text}` }
        ]
      })
    });
    const data = await response.json();
    return data.choices?.[0]?.message?.content?.trim() || null;
  }
}

async function getApiKey() {
  return new Promise((resolve) => {
    chrome.storage.sync.get("openaiKey", (data) => {
      resolve(data.openaiKey || null);
    });
  });
}

function isSensitiveEditor(el) {
  return el?.dataset?.slateEditor === "true"
    || el?.getAttribute("data-slate-editor") === "true"
    || el?.closest("[data-slate-editor]")
    || el?.getAttribute("contenteditable") === "true" && el.className?.includes("ProseMirror");
}

function attachListeners(el, doc = document) {
  if (el.dataset.typofoxAttached === "1") return;
  el.dataset.typofoxAttached = "1";

  ["focus", "click"].forEach(evt => {
    el.addEventListener(evt, () => {
      currentInput = el;
      createFloatingPanel(true);
    });
  });
}

function observeInputs() {
  const observer = new MutationObserver(() => {
    document.querySelectorAll('textarea, input[type="text"], [contenteditable="true"]').forEach(attachListeners);
  });

  observer.observe(document.body, {
    childList: true,
    subtree: true,
  });
}

function findAndAttachToTinyMCE() {
  document.querySelectorAll("iframe").forEach((iframe, i) => {
    try {
      const doc = iframe.contentDocument || iframe.contentWindow.document;
      const body = doc?.querySelector("body#tinymce[contenteditable='true']");
      if (body) {
        attachListeners(body, doc);
      }
    } catch (err) {
      console.log(`❌ Cannot access iframe[${i}]`, err);
    }
  });
}

window.addEventListener("load", () => {
  createFloatingPanel(false); // show logo + rescan button by default
  observeInputs();
  findAndAttachToTinyMCE();
});
