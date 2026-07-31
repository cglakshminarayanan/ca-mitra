import { GoogleGenAI } from '@google/genai';

export async function handler(event) {
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: JSON.stringify({ error: 'Method Not Allowed' }) };
  }

  try {
    const { message, fileBase64, mimeType } = JSON.parse(event.body || '{}');
    const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

    // Models to try in order of preference
    const modelsToTry = [
      'gemini-2.5-pro',
      'gemini-2.5-flash',
      'gemini-2.0-flash',
      'gemini-1.5-flash'
    ];

    const contents = [];
    if (fileBase64 && mimeType) {
      const cleanData = fileBase64.replace(/^data:(.*);base64,/, '');
      contents.push({
        inlineData: { mimeType: mimeType, data: cleanData }
      });
    }
    if (message) {
      contents.push(message);
    }

    let reply = null;
    let lastError = null;

    for (const modelName of modelsToTry) {
      try {
        const response = await ai.models.generateContent({
          model: modelName,
          contents: contents
        });

        if (response && response.text) {
          reply = response.text;
          break; // Exit loop on first successful response
        }
      } catch (err) {
        lastError = err;
        console.warn(`Model ${modelName} failed/unavailable, trying fallback...`);
      }
    }

    if (!reply) {
      return {
        statusCode: 200,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ error: lastError?.message || "All AI models are currently busy. Please try again." })
      };
    }

    return {
      statusCode: 200,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ reply })
    };

  } catch (error) {
    return {
      statusCode: 200,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ error: error.message || "An unexpected error occurred." })
    };
  }
}
