document.addEventListener("DOMContentLoaded", () => {
  const apiKeyInput = document.getElementById("apiKey");
  const saveBtn = document.getElementById("saveBtn");
  const status = document.getElementById("status");

  chrome.storage.sync.get("openaiKey", (data) => {
    if (data.openaiKey) apiKeyInput.value = data.openaiKey;
  });

  saveBtn.addEventListener("click", () => {
    const key = apiKeyInput.value.trim();
    if (!key.startsWith("sk-")) {
      status.textContent = "Invalid key format.";
      status.style.color = "red";
      return;
    }

    chrome.storage.sync.set({ openaiKey: key }, () => {
      status.textContent = "API key saved!";
      status.style.color = "green";
    });
  });
});