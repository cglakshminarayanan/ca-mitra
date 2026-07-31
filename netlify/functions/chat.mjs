import { GoogleGenAI } from '@google/genai';

export async function handler(event, context) {
  // 1. Setup CORS Headers to allow external URLs to send requests
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Content-Type': 'application/json'
  };

  // 2. Handle Browser Preflight (OPTIONS) Request
  if (event.httpMethod === 'OPTIONS') {
    return {
      statusCode: 200,
      headers,
      body: ''
    };
  }

  // 3. Reject any request that isn't POST
  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      headers,
      body: JSON.stringify({ error: 'Method Not Allowed' })
    };
  }

  try {
    const { prompt, file } = JSON.parse(event.body || '{}');
    const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

    // Fallback model list
    const modelsToTry = [
      'gemini-2.5-pro',
      'gemini-2.0-flash',
      'gemini-1.5-pro',
      'gemini-1.5-flash'
    ];

    const systemInstruction = `You are CA-Mitra, an expert AI assistant specialized in Indian Taxation (Income Tax Act 1961 & 2025, GST, Customs), Corporate Laws (Companies Act 2013), FEMA 1999, FCRA 2010, IBC 2016, Ind AS, Financial Management, International Taxation, and DTAA. 
Provide short, crisp, point-to-point accurate answers tailored for Indian Chartered Accountants and CA students. If a user asks for further explanation, explain in simple terms. Default language is English, but respond in Indian languages if the prompt is written in them.`;

    let responseText = null;
    let lastError = null;

    // Loop through fallback models
    for (const modelName of modelsToTry) {
      try {
        const contents = [];
        
        if (file && file.base64 && file.mimeType) {
          contents.push({
            inlineData: {
              mimeType: file.mimeType,
              data: file.base64.split(',')[1] || file.base64
            }
          });
        }

        contents.push({ text: prompt || 'Please analyze this.' });

        const response = await ai.models.generateContent({
          model: modelName,
          contents: contents,
          config: {
            systemInstruction: systemInstruction
          }
        });

        if (response && response.text) {
          responseText = response.text;
          break; // Success! Exit fallback loop
        }
      } catch (err) {
        lastError = err;
        console.warn(`Model ${modelName} failed:`, err.message);
      }
    }

    if (!responseText) {
      throw lastError || new Error('All AI models failed to respond.');
    }

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({ reply: responseText })
    };

  } catch (error) {
    console.error('Backend Error:', error);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ error: error.message || 'Internal Server Error' })
    };
  }
}
