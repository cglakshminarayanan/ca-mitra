import { GoogleGenAI } from '@google/genai';

// Netlify automatically securely injects this from your dashboard settings
const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

const SYSTEM_PROMPT = `You are CA Mitra, an elite AI assistant designed specifically for Chartered Accountants (CAs) and CA students in India. 
Your Expertise:
- Income Tax Acts (1961 and 2025), Companies Act 2013, FCRA 2010, FEMA 1999, IBC 2016, Ind AS, GST Act, Customs, DTAAs.
- Financial Management and Derivatives.
Rules:
1. Point-to-Point & Crisp: Provide direct, concise, and highly accurate answers using bullet points.
2. Progressive Disclosure: Give direct answers first. Only provide simpler explanations if asked.
3. Language: Fluent in English and Indian languages.
4. File Handling: Analyze uploaded documents accurately without hallucinating outside data.`;

export default async (req, context) => {
  // Enable CORS so your popup can work on ANY external URL you embed it in
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'POST, OPTIONS'
  };

  // Handle preflight requests from browsers
  if (req.method === 'OPTIONS') {
    return new Response('', { headers, status: 200 });
  }

  try {
    // Read the data sent from your frontend widget
    const body = await req.json();
    const { message, fileBase64, mimeType } = body;

    const contents = [];
    
    // If a user uploaded a file, package it for Gemini
    if (fileBase64 && mimeType) {
      // Strip the 'data:image/png;base64,' prefix HTML adds
      const base64Data = fileBase64.split(',')[1] || fileBase64;
      contents.push({
        inlineData: { data: base64Data, mimeType: mimeType }
      });
    }
    
    // Add the user's text prompt
    contents.push(message);

    // Call the AI (You can swap 'gemini-3.5-flash' for 'gemini-3.1-pro' if needed)
    const response = await ai.models.generateContent({
      model: 'gemini-3.5-flash',
      contents: contents,
      config: {
        systemInstruction: SYSTEM_PROMPT,
      }
    });

    // Send the crisp answer back to the frontend
    return new Response(JSON.stringify({ reply: response.text }), {
      headers: { ...headers, 'Content-Type': 'application/json' },
      status: 200
    });

  } catch (error) {
    console.error("AI Error:", error);
    return new Response(JSON.stringify({ error: 'Failed to process request.' }), { 
      headers, 
      status: 500 
    });
  }
};