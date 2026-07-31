(function () {
  const API_URL = 'https://ca-mitra-ai.netlify.app/.netlify/functions/chat';

  // 1. Define SVG Icons
  const icons = {
    min: `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><line x1="5" y1="12" x2="19" y2="12"></line></svg>`,
    max: `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect></svg>`,
    close: `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>`,
    chat: `<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path></svg>`,
    send: `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="22" y1="2" x2="11" y2="13"></line><polygon points="22 2 15 22 11 13 2 9 22 2"></polygon></svg>`,
    file: `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21.44 11.05l-9.19 9.19a6 6 0 0 1-8.49-8.49l9.19-9.19a4 4 0 0 1 5.66 5.66l-9.2 9.19a2 2 0 0 1-2.83-2.83l8.49-8.48"></path></svg>`,
    caMitraSymbol: `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#6366f1" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M12 2L2 7l10 5 10-5-10-5z"></path><path d="M2 17l10 5 10-5"></path><path d="M2 12l10 5 10-5"></path></svg>`,
    copy: `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path></svg>`
  };

  // 2. Inject CSS Styles
  const style = document.createElement('style');
  style.innerHTML = `
    #ca-mitra-widget {
      position: fixed;
      bottom: 20px;
      right: 20px;
      width: 360px;
      height: 520px;
      max-height: calc(100vh - 40px);
      background: #ffffff;
      border-radius: 16px;
      box-shadow: 0 15px 40px rgba(0, 0, 0, 0.2);
      display: none;
      flex-direction: column;
      z-index: 99999;
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
      overflow: hidden;
      opacity: 0;
      transform: translateY(10px);
      transition: opacity 0.3s ease, transform 0.3s ease;
    }
    #ca-mitra-widget.active {
      display: flex;
      opacity: 1;
      transform: translateY(0);
    }
    #ca-mitra-widget.maximized {
      top: 20px;
      left: 20px;
      bottom: 20px;
      right: 20px;
      width: calc(100vw - 40px) !important;
      height: calc(100vh - 40px) !important;
      max-height: none !important;
    }
    #ca-mitra-header {
      background: #0f172a;
      color: #ffffff;
      padding: 12px 16px;
      display: flex;
      align-items: center;
      justify-content: space-between;
    }
    .ca-mitra-title {
      display: flex;
      align-items: center;
      gap: 8px;
      font-weight: 600;
      font-size: 15px;
    }
    .ca-mitra-controls {
      display: flex;
      gap: 6px;
    }
    .ca-mitra-btn-icon {
      background: rgba(255, 255, 255, 0.1);
      border: none;
      color: #94a3b8;
      width: 26px;
      height: 26px;
      border-radius: 6px;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      transition: all 0.2s;
    }
    .ca-mitra-btn-icon:hover {
      background: rgba(255, 255, 255, 0.2);
      color: #ffffff;
    }
    #ca-mitra-body {
      flex: 1;
      padding: 12px;
      overflow-y: auto;
      background: #f8fafc;
      display: flex;
      flex-direction: column;
      gap: 10px;
    }
    .ca-msg {
      max-width: 85%;
      padding: 10px 14px;
      border-radius: 12px;
      font-size: 13.5px;
      line-height: 1.45;
      word-break: break-word;
      position: relative;
    }
    .ca-msg-user {
      align-self: flex-end;
      background: #6366f1;
      color: #ffffff;
      border-bottom-right-radius: 2px;
    }
    .ca-msg-ai {
      align-self: flex-start;
      background: #ffffff;
      color: #1e293b;
      border: 1px solid #e2e8f0;
      border-bottom-left-radius: 2px;
      box-shadow: 0 2px 4px rgba(0,0,0,0.02);
    }
    .ca-copy-bar {
      margin-top: 6px;
      display: flex;
      justify-content: flex-end;
    }
    .ca-copy-btn {
      background: transparent;
      border: none;
      color: #94a3b8;
      cursor: pointer;
      display: flex;
      align-items: center;
      gap: 4px;
      font-size: 11px;
      padding: 2px 4px;
      border-radius: 4px;
    }
    .ca-copy-btn:hover {
      color: #6366f1;
      background: #f1f5f9;
    }
    #ca-mitra-input-bar {
      padding: 10px;
      background: #ffffff;
      border-top: 1px solid #e2e8f0;
      display: flex;
      align-items: center;
      gap: 8px;
    }
    #ca-mitra-input {
      flex: 1;
      border: 1px solid #cbd5e1;
      border-radius: 20px;
      padding: 8px 14px;
      font-size: 13px;
      outline: none;
    }
    #ca-mitra-input:focus {
      border-color: #6366f1;
    }
    .ca-action-btn {
      background: transparent;
      border: none;
      color: #64748b;
      width: 34px;
      height: 34px;
      border-radius: 50%;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
    }
    .ca-action-btn:hover {
      background: #f1f5f9;
      color: #6366f1;
    }
    #ca-mitra-send {
      background: #6366f1;
      color: #ffffff;
    }
    #ca-mitra-send:hover {
      background: #4f46e5;
      color: #ffffff;
    }
    #ca-mitra-footer {
      background: #f8fafc;
      border-top: 1px solid #f1f5f9;
      padding: 6px 10px;
      font-size: 10.5px;
      color: #94a3b8;
      text-align: center;
      line-height: 1.3;
    }
    #ca-mitra-footer a {
      color: #6366f1;
      text-decoration: none;
    }
    #ca-mitra-toggle-btn {
      position: fixed;
      bottom: 20px;
      right: 20px;
      width: 52px;
      height: 52px;
      border-radius: 50%;
      background: #0f172a;
      color: #ffffff;
      border: none;
      box-shadow: 0 8px 24px rgba(0, 0, 0, 0.25);
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      z-index: 99998;
      transition: transform 0.2s ease;
    }
    #ca-mitra-toggle-btn:hover {
      transform: scale(1.05);
    }
    @media (max-width: 480px) {
      #ca-mitra-widget {
        bottom: 0 !important;
        right: 0 !important;
        width: 100vw !important;
        height: 100dvh !important;
        max-height: none !important;
        border-radius: 0 !important;
      }
      .ca-max-btn { display: none; }
    }
  `;
  document.head.appendChild(style);

  // 3. Inject HTML Container
  const widgetContainer = document.createElement('div');
  widgetContainer.id = 'ca-mitra-widget';
  widgetContainer.innerHTML = `
    <div id="ca-mitra-header">
      <div class="ca-mitra-title">${icons.caMitraSymbol} CA-Mitra</div>
      <div class="ca-mitra-controls">
        <button class="ca-mitra-btn-icon ca-max-btn" id="ca-mitra-max">${icons.max}</button>
        <button class="ca-mitra-btn-icon" id="ca-mitra-min">${icons.min}</button>
        <button class="ca-mitra-btn-icon" id="ca-mitra-close">${icons.close}</button>
      </div>
    </div>
    <div id="ca-mitra-body">
      <div class="ca-msg ca-msg-ai">Hello! I am CA-Mitra. How can I assist you with Income Tax, GST, Companies Act, or Auditing today?</div>
    </div>
    <div id="ca-mitra-file-preview" style="display:none; padding:4px 12px; font-size:11px; color:#6366f1; background:#eeefef;"></div>
    <div id="ca-mitra-input-bar">
      <input type="file" id="ca-mitra-file" style="display:none;" />
      <button class="ca-action-btn" id="ca-mitra-file-btn" title="Upload File">${icons.file}</button>
      <input type="text" id="ca-mitra-input" placeholder="Type your query..." />
      <button class="ca-action-btn" id="ca-mitra-send" title="Send">${icons.send}</button>
    </div>
    <div id="ca-mitra-footer">
      AI can make mistakes. Verify critical info.<br/>
      Developed by <a href="https://www.linkedin.com/in/lakshminarayanan-c-g" target="_blank">Lakshminarayanan C G</a> | <a href="https://ca-mitra-ai.netlify.app" target="_blank">ca-mitra-ai.netlify.app</a>
    </div>
  `;
  document.body.appendChild(widgetContainer);

  // Floating Launch Button
  const toggleBtn = document.createElement('button');
  toggleBtn.id = 'ca-mitra-toggle-btn';
  toggleBtn.innerHTML = icons.chat;
  document.body.appendChild(toggleBtn);

  // 4. Logic & Interactivity
  let attachedFile = null;

  const body = document.getElementById('ca-mitra-body');
  const input = document.getElementById('ca-mitra-input');
  const fileInput = document.getElementById('ca-mitra-file');
  const filePreview = document.getElementById('ca-mitra-file-preview');

  toggleBtn.onclick = () => {
    widgetContainer.classList.toggle('active');
  };

  document.getElementById('ca-mitra-min').onclick = () => widgetContainer.classList.remove('active');
  document.getElementById('ca-mitra-close').onclick = () => widgetContainer.classList.remove('active');
  
  document.getElementById('ca-mitra-max').onclick = () => {
    widgetContainer.classList.toggle('maximized');
  };

  document.getElementById('ca-mitra-file-btn').onclick = () => fileInput.click();

  fileInput.onchange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (evt) => {
      attachedFile = {
        name: file.name,
        mimeType: file.type,
        base64: evt.target.result
      };
      filePreview.innerText = `Attached: ${file.name}`;
      filePreview.style.display = 'block';
    };
    reader.readAsDataURL(file);
  };

  const handleSend = async () => {
    const text = input.value.trim();
    if (!text && !attachedFile) return;

    // Append User Message
    const userMsg = document.createElement('div');
    userMsg.className = 'ca-msg ca-msg-user';
    userMsg.innerText = text + (attachedFile ? `\n[Attached File: ${attachedFile.name}]` : '');
    body.appendChild(userMsg);

    input.value = '';
    const currentFile = attachedFile;
    attachedFile = null;
    filePreview.style.display = 'none';

    // Append AI "Analyzing..." Placeholder
    const aiMsg = document.createElement('div');
    aiMsg.className = 'ca-msg ca-msg-ai';
    aiMsg.innerText = 'Analyzing...';
    body.appendChild(aiMsg);
    body.scrollTop = body.scrollHeight;

    try {
      const res = await fetch(API_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt: text, file: currentFile })
      });

      const data = await res.json();
      if (res.ok && data.reply) {
        aiMsg.innerText = data.reply;
        
        // Add Copy button to AI bubble
        const copyBar = document.createElement('div');
        copyBar.className = 'ca-copy-bar';
        copyBar.innerHTML = `<button class="ca-copy-btn">${icons.copy} Copy</button>`;
        copyBar.querySelector('.ca-copy-btn').onclick = () => {
          navigator.clipboard.writeText(data.reply);
          alert('Copied to clipboard!');
        };
        aiMsg.appendChild(copyBar);
      } else {
        aiMsg.innerText = `Error: ${data.error || 'Unable to fetch response.'}`;
      }
    } catch (err) {
      aiMsg.innerText = `Error connecting to backend: ${err.message}`;
    }
    body.scrollTop = body.scrollHeight;
  };

  document.getElementById('ca-mitra-send').onclick = handleSend;
  input.onkeypress = (e) => {
    if (e.key === 'Enter') handleSend();
  };
})();
