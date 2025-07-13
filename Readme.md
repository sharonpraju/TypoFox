# 🦊 TypoFox

TypoFox is a lightweight, open-source Chrome Extension that automatically adds a floating button to input fields and editors on web pages — letting you instantly **fix typos, grammar errors, and polish your writing** using ChatGPT (via OpenAI API). 

Works out of the box with native `<textarea>`, `<input>`, TinyMCE, ProseMirror, and Slate.js editors (like LinkedIn, Notion, Intercom, etc).

---

![TypoFox Demo](https://user-images.githubusercontent.com/your-screenshot.gif)

## ✨ Features

- 🪄 Fix grammar and typos instantly using ChatGPT
- 🔁 Undo and restore original text
- 📋 Clipboard fallback for sensitive editors (e.g. ProseMirror, Slate)
- 🖱️ Floating UI that's draggable and smart
- 🔄 Rescan button to detect new inputs/editors dynamically
- 🧠 Lightweight and token-efficient prompts
- 🧰 Works with rich text editors (TinyMCE, Slate.js, ProseMirror)
- 🔓 100% open source and privacy-friendly

---

## 🛠️ How to Use

### 1. Install the Extension (Dev Mode)

1. Clone the repo:
   ```bash
   git clone https://github.com/sharonpraju/TypoFox.git
   cd typofox
2. Go to chrome://extensions/

3. Enable Developer Mode

4. Click "Load unpacked" and select the typofox/ folder

### 2. Add Your OpenAI API Key
Click the TypoFox icon → Options → Paste your OpenAI key

🧠 Your key is stored securely using Chrome's storage.sync.

## ⚙️ Customization
By default, TypoFox uses the gpt-3.5-turbo model and sends minimal prompts to save tokens.

You can modify:

The prompt style

Model version

UI size and positioning

Sensitive editor detection

## 🧪 Compatibility
TypoFox supports:

✅ Native <input> and <textarea>

✅ contenteditable="true" regions

✅ TinyMCE

✅ Slate.js (e.g. LinkedIn, Intercom)

✅ ProseMirror (e.g. Notion, Ghost CMS)

## 🤝 Contribute
Pull requests are welcome!

If you're using a different rich text editor or platform and want support, just open an issue with:

A short description

A link to the editor (or screenshot of DOM)

## 📄 License
MIT License