(function() {
  // 1. Defind the SVG icons to be reused (Min, Max, Close, Chat, Send, File, and a CA Mitra symbol)
  const icons = {
    min: '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"><line x1="5" y1="12" x2="19" y2="12"></line></svg>',
    max: '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M15 3h6v6"></path><path d="M9 21H3v-6"></path><path d="M21 3l-7 7"></path><path d="M3 21l7-7"></path></svg>',
    close: '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>',
    chat: '<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path></svg>',
    send: '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><line x1="22" y1="2" x2="11" y2="13"></line><polygon points="22 2 15 22 11 13 2 9 22 2"></polygon></svg>',
    file: '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline></svg>',
    caMitraSymbol: '<svg width="28" height="28" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M4 19H20" stroke="white" stroke-width="1.5" stroke-linecap="round"/><path d="M4 15H20" stroke="white" stroke-width="1.5" stroke-linecap="round"/><path d="M12 3V11M8 7H16M6 3H18M7.5 11H16.5M5.5 3L11 21L18.5 3M11 21H13" stroke="white" stroke-width="1.5" stroke-linecap="round"/></svg>'
  };

  // 2. Inject CSS styles with modern professional theme and smooth animations
  const style = document.createElement('style');
  style.innerHTML = `
#ca-mitra-widget {
  position: fixed;
  bottom: 20px;
  right: 20px;
  width: 360px;
  height: 520px;
  max-height: calc(100vh - 40px); /* Prevents top header from going off-screen */
  background: #ffffff;
  border-radius: 16px;
  box-shadow: 0 15px 40px rgba(0, 0, 0, 0.3);
  display: none;
  flex-direction: column;
  z-index: 99999;
  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", sans-serif;
  overflow: hidden;
  opacity: 0;
  transform: translateY(10px);
  transition: opacity 0.3s ease, transform 0.3s ease, all 0.25s cubic-bezier(0.4, 0, 0.2, 1);
}
    #ca-mitra-widget.active { opacity: 1; transform: translateY(0); display: flex; }

    /* Maximized Mode Class (Desktop) */
    #ca-mitra-widget.maximized {
      top: 25px;
      left: 25px;
      bottom: 25px;
      right: 25px;
      width: calc(100vw - 50px) !important;
      height: calc(100vh - 50px) !important;
      border-radius: 12px;
    }

    /* Standard Mobile Responsiveness */
    @media screen and (max-width: 480px) {
      #ca-mitra-widget {
        width: 100vw !important;
        height: 100dvh !important;
        bottom: 0 !important;
        right: 0 !important;
        border-radius: 0 !important;
      }
      #ca-mitra-max { display: none; }
      #ca-send { padding: 14px; }
      #ca-file-label { padding: 10px; }
    }

    /* Header with rich color and polished controls */
    #ca-mitra-header {
      background: linear-gradient(135deg, #0f172a 0%, #1e3a8a 100%);
      color: white;
      padding: 16px 20px;
      font-weight: 700;
      font-size: 16px;
      display: flex;
      justify-content: space-between;
      align-items: center;
      user-select: none;
      border-bottom: 1px solid rgba(255, 255, 255, 0.08);
    }
    .header-title-area { display: flex; align-items: center; gap: 12px; }
    .header-controls { display: flex; gap: 10px; align-items: center; }
    .header-btn {
      background: transparent;
      border: none;
      color: rgba(255, 255, 255, 0.6);
      width: 30px;
      height: 30px;
      border-radius: 8px;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      transition: all 0.2s ease;
      padding: 0;
    }
    .header-btn:hover { background: rgba(255, 255, 255, 0.1); color: white; }
    .header-btn-close:hover { background: #e11d48; color: white; } /* Roses-red close on hover */

    /* Messages Area with refined bubbles and clean background */
    #ca-mitra-messages {
      padding: 20px;
      overflow-y: auto;
      flex-grow: 1;
      font-size: 14.5px;
      line-height: 1.6;
      background: #f1f5f9; /* Soft cool-gray background */
    }
    .msg-user {
      color: #0f172a;
      background: #bfdbfe; /* Light blue user bubble */
      border: 1px solid #93c5fd;
      padding: 12px 16px;
      border-radius: 16px 16px 4px 16px;
      margin-bottom: 14px;
      margin-left: 20%;
      text-align: left;
      box-shadow: 0 2px 5px rgba(0,0,0,0.05);
    }
    .msg-ai {
      color: #1e293b;
      background: #ffffff; /* Clean white AI bubble */
      border: 1px solid #e2e8f0;
      padding: 14px 16px;
      border-radius: 16px 16px 16px 4px;
      margin-bottom: 14px;
      box-shadow: 0 3px 6px rgba(0,0,0,0.04);
    }

    /* Input Area with rounded input and stylized file button */
    #ca-mitra-input-area {
      border-top: 1px solid #e2e8f0;
      padding: 14px 16px;
      display: flex;
      gap: 10px;
      background: #ffffff;
      align-items: center;
    }
    #ca-prompt {
      flex-grow: 1;
      padding: 12px 14px;
      border: 1px solid #cbd5e1;
      border-radius: 24px; /* Fully rounded input */
      outline: none;
      font-size: 14px;
      background: #f8fafc;
      transition: border-color 0.2s, background 0.2s;
    }
    #ca-prompt:focus { border-color: #3b82f6; background: white; }
    
    #ca-send {
      background: #1e40af; /* Deep blue send button */
      color: white;
      border: none;
      width: 44px;
      height: 44px;
      border-radius: 50%; /* Circle send button */
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      transition: background 0.2s;
      padding: 0;
    }
    #ca-send:hover { background: #1d4ed8; }

    #ca-file-label {
      color: #64748b;
      background: #f1f5f9;
      border: 1px solid #cbd5e1;
      width: 44px;
      height: 44px;
      border-radius: 50%; /* Circle file button */
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      transition: background 0.2s, color 0.2s;
    }
    #ca-file-label:hover { background: #e2e8f0; color: #1e40af; }

    /* The main toggle button on the host page */
    #ca-mitra-toggle {
      position: fixed;
      bottom: 25px;
      right: 25px;
      background: linear-gradient(135deg, #0f172a 0%, #1e40af 100%);
      color: white;
      border: none;
      border-radius: 50px;
      padding: 16px 28px;
      cursor: pointer;
      box-shadow: 0 6px 25px rgba(15, 23, 42, 0.5);
      z-index: 99998;
      font-weight: 700;
      font-size: 16px;
      display: flex;
      align-items: center;
      gap: 12px;
      transition: transform 0.2s, box-shadow 0.2s;
    }
    #ca-mitra-toggle:hover { transform: translateY(-3px); box-shadow: 0 9px 30px rgba(15, 23, 42, 0.6); }
  `;
  document.head.appendChild(style);

  // 3. Inject HTML UI elements, reusing the SVG icons
  const widgetContainer = document.createElement('div');
  widgetContainer.innerHTML = `
    <button id="ca-mitra-toggle">${icons.caMitraSymbol} CA Mitra</button>
    <div id="ca-mitra-widget">
      <div id="ca-mitra-header">
        <div class="header-title-area">
          ${icons.caMitraSymbol}
          <span>CA Mitra - Tax & Audit AI</span>
        </div>
        <div class="header-controls">
          <button class="header-btn" id="ca-mitra-max" title="Maximize/Restore">${icons.max}</button>
          <button class="header-btn" id="ca-mitra-min" title="Minimize">${icons.min}</button>
          <button class="header-btn header-btn-close" id="ca-mitra-close" title="Close">${icons.close}</button>
        </div>
      </div>
      <div id="ca-mitra-messages">
        <div class="msg-ai"><b>Namaste! I am CA Mitra.</b><br>Welcome to your intelligent Indian finance compliance assistant. I can help with Income Tax, GST, Companies Act, DTAA, and Financial Management queries. Upload your document for analysis!</div>
      </div>
      <div id="ca-mitra-input-area">
        <label id="ca-file-label" title="Upload Document">
          ${icons.file}
          <input type="file" id="ca-file" accept=".pdf,image/*" style="display: none;">
        </label>
        <input type="text" id="ca-prompt" placeholder="Ask compliance question...">
        <button id="ca-send" title="Send Question">${icons.send}</button>
      </div>
    </div>
  `;
  document.body.appendChild(widgetContainer);

  // 4. UI Functionality & Backend Logic
  const toggleBtn = document.getElementById('ca-mitra-toggle');
  const widget = document.getElementById('ca-mitra-widget');
  const closeBtn = document.getElementById('ca-mitra-close');
  const minBtn = document.getElementById('ca-mitra-min');
  const maxBtn = document.getElementById('ca-mitra-max');
  const sendBtn = document.getElementById('ca-send');
  const promptInput = document.getElementById('ca-prompt');
  const fileInput = document.getElementById('ca-file');
  const fileLabel = document.getElementById('ca-file-label');
  const messagesDiv = document.getElementById('ca-mitra-messages');

  const API_URL = 'https://ca-mitra-ai.netlify.app/.netlify/functions/chat'; 

  // Toggle Popup open/close
  toggleBtn.onclick = () => { widget.classList.add('active'); toggleBtn.style.display = 'none'; };
  closeBtn.onclick = minBtn.onclick = () => { widget.classList.remove('active'); toggleBtn.style.display = 'flex'; };

  // Maximize / Restore Toggle (Desktop)
  maxBtn.onclick = () => {
    widget.classList.toggle('maximized');
    // We could swap the icon but let's keep it simple and clean
  };

  // Visually indicate file selection state
  fileInput.onchange = () => {
    const file = fileInput.files[0];
    if (file) {
      fileLabel.style.background = '#d1fae5'; /* Soft green */
      fileLabel.style.borderColor = '#6ee7b7';
      fileLabel.style.color = '#065f46';
    } else {
      fileLabel.style.cssText = ''; /* Revert to default in CSS */
    }
  };

  // Main interaction: collect input and send to backend
  const handleSend = async () => {
    const text = promptInput.value.trim();
    const file = fileInput.files[0];
    if (!text && !file) return; // Ignore empty clicks

    // Show user message (text, or file indicator)
    messagesDiv.innerHTML += `<div class="msg-user"><b>You:</b> ${text || '<span style="opacity:0.6;">📂 <i>File uploaded for analysis</i></span>'}</div>`;
    promptInput.value = '';
    fileLabel.style.cssText = ''; // revert file label style
    
    // Show AI loading state
    const loadingId = "load-" + Date.now();
    messagesDiv.innerHTML += `<div class="msg-ai" id="${loadingId}"><i style="opacity:0.7;">CA Mitra is analyzing...</i></div>`;
    messagesDiv.scrollTop = messagesDiv.scrollHeight;

    let base64File = null;
    let mimeType = null;

    // Convert file to base64 if needed
    if (file) {
      mimeType = file.type;
      base64File = await new Promise((resolve) => {
        const reader = new FileReader();
        reader.onload = (e) => resolve(e.target.result);
        reader.readAsDataURL(file);
      });
      fileInput.value = ''; // clear file selection
    }

    try {
      // POST data to our secure Netlify Function
      const response = await fetch(API_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: text, fileBase64: base64File, mimeType: mimeType })
      });
      
      const data = await response.json();
      document.getElementById(loadingId).remove();
      
      // Clean up backend reply (convert markdown bold/bullets to basic HTML)
      const formattedReply = data.reply.replace(/\n/g, '<br>').replace(/\*\*(.*?)\*\*/g, '<b>$1</b>');
      messagesDiv.innerHTML += `<div class="msg-ai">${formattedReply}</div>`;
    } catch (err) {
      document.getElementById(loadingId).innerText = "Error: CA Mitra could not connect to backend.";
      console.error(err);
    }
    // Auto-scroll to the newest message
    messagesDiv.scrollTop = messagesDiv.scrollHeight;
  };

  // Bind the send action to button click and 'Enter' keypress
  sendBtn.onclick = handleSend;
  promptInput.onkeypress = (e) => { if (e.key === 'Enter') handleSend(); };
})();
