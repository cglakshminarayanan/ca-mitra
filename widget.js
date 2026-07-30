(function() {
  // 1. Inject CSS for the popup
  const style = document.createElement('style');
  style.innerHTML = `
    #ca-mitra-widget { position: fixed; bottom: 20px; right: 20px; width: 350px; max-height: 500px; background: white; border-radius: 10px; box-shadow: 0 5px 15px rgba(0,0,0,0.2); display: none; flex-direction: column; z-index: 9999; font-family: sans-serif; }
    #ca-mitra-header { background: #003366; color: white; padding: 15px; border-radius: 10px 10px 0 0; font-weight: bold; cursor: pointer; display: flex; justify-content: space-between;}
    #ca-mitra-messages { padding: 15px; height: 300px; overflow-y: auto; flex-grow: 1; font-size: 14px; line-height: 1.4;}
    #ca-mitra-input-area { border-top: 1px solid #ddd; padding: 10px; display: flex; gap: 5px; background: #f9f9f9; border-radius: 0 0 10px 10px;}
    #ca-mitra-input-area input[type="text"] { flex-grow: 1; padding: 8px; border: 1px solid #ccc; border-radius: 4px; }
    #ca-mitra-input-area button { background: #003366; color: white; border: none; padding: 8px 12px; border-radius: 4px; cursor: pointer; }
    #ca-mitra-toggle { position: fixed; bottom: 20px; right: 20px; background: #003366; color: white; border: none; border-radius: 50px; padding: 15px 25px; cursor: pointer; box-shadow: 0 4px 10px rgba(0,0,0,0.2); z-index: 9998; font-weight: bold;}
    .msg-user { color: #003366; font-weight: bold; margin-bottom: 5px; text-align: right;}
    .msg-ai { color: #333; margin-bottom: 15px; background: #f1f1f1; padding: 10px; border-radius: 8px;}
  `;
  document.head.appendChild(style);

  // 2. Inject HTML structure
  const widgetContainer = document.createElement('div');
  widgetContainer.innerHTML = `
    <button id="ca-mitra-toggle">Chat with CA Mitra</button>
    <div id="ca-mitra-widget">
      <div id="ca-mitra-header">
        <span>CA Mitra - Tax & Audit AI</span>
        <span id="ca-mitra-close">✖</span>
      </div>
      <div id="ca-mitra-messages">
        <div class="msg-ai">Hello! I am CA Mitra. Upload a tax notice, balance sheet, or ask me a compliance question.</div>
      </div>
      <div id="ca-mitra-input-area">
        <input type="file" id="ca-file" accept=".pdf,image/*" style="width: 80px; font-size: 11px;">
        <input type="text" id="ca-prompt" placeholder="Ask a question...">
        <button id="ca-send">Send</button>
      </div>
    </div>
  `;
  document.body.appendChild(widgetContainer);

  // 3. Logic & Interactions
  const toggleBtn = document.getElementById('ca-mitra-toggle');
  const widget = document.getElementById('ca-mitra-widget');
  const closeBtn = document.getElementById('ca-mitra-close');
  const sendBtn = document.getElementById('ca-send');
  const promptInput = document.getElementById('ca-prompt');
  const fileInput = document.getElementById('ca-file');
  const messagesDiv = document.getElementById('ca-mitra-messages');

  // URL pointing to your Netlify function (update this after deployment)
  const API_URL = '/.netlify/functions/chat'; 

  toggleBtn.onclick = () => { widget.style.display = 'flex'; toggleBtn.style.display = 'none'; };
  closeBtn.onclick = () => { widget.style.display = 'none'; toggleBtn.style.display = 'block'; };

  sendBtn.onclick = async () => {
    const text = promptInput.value;
    const file = fileInput.files[0];
    if (!text && !file) return;

    // Show user message
    messagesDiv.innerHTML += `<div class="msg-user">You: ${text || "Sent a file"}</div>`;
    promptInput.value = '';
    
    // Show loading state
    const loadingId = "load-" + Date.now();
    messagesDiv.innerHTML += `<div class="msg-ai" id="${loadingId}">Analyzing...</div>`;
    messagesDiv.scrollTop = messagesDiv.scrollHeight;

    let base64File = null;
    let mimeType = null;

    if (file) {
      mimeType = file.type;
      base64File = await new Promise((resolve) => {
        const reader = new FileReader();
        reader.onload = (e) => resolve(e.target.result);
        reader.readAsDataURL(file);
      });
    }

    try {
      const response = await fetch(API_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: text, fileBase64: base64File, mimeType: mimeType })
      });
      
      const data = await response.json();
      document.getElementById(loadingId).remove();
      
      // Convert standard markdown bullets to HTML simple layout
      const formattedReply = data.reply.replace(/\n/g, '<br>').replace(/\*\*(.*?)\*\*/g, '<b>$1</b>');
      messagesDiv.innerHTML += `<div class="msg-ai">${formattedReply}</div>`;
      fileInput.value = ''; // clear file
    } catch (err) {
      document.getElementById(loadingId).innerText = "Error connecting to server.";
    }
    messagesDiv.scrollTop = messagesDiv.scrollHeight;
  };
})();