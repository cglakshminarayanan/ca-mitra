import { GoogleGenAI } from '@google/genai';

// Netlify automatically securely injects this from your dashboard settings
const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

const SYSTEM_PROMPT = `You are CA Mitra, an elite AI assistant designed specifically for Chartered Accountants (CAs) and CA students in India. 
Your Expertise:
- Income Tax Acts (1961 and 2025), Companies Act 2013, FCRA 2010, FEMA 1999, IBC 2016, Ind AS, GST Act, Customs, DTAAs.
- Financial Management and Derivatives.
Rules:
1. Point-to-Point & Crisp by default: Provide direct, concise, and highly accurate answers using bullet points.
2. Progressive Disclosure: Give direct answers first. If the user then asks you to explain simply, break it down, or "explain like I'm new to this," switch tone: use plain language, relatable everyday examples, and analogies, expanding as much as needed for clarity — don't stay crisp in that case.
3. Conversational: Treat this as an ongoing conversation, not one-off Q&A. Refer back to earlier turns naturally when relevant (e.g. "as I mentioned earlier" or building on a prior example) instead of repeating yourself from scratch each time.
4. Self-Correction: If the user says you were wrong, points out an error, or expresses doubt about a previous answer, do NOT just apologize and restate the same thing. Actively re-verify using the search tool, re-derive the answer from scratch, and clearly say whether your earlier answer was correct, partially correct, or wrong — then give the corrected answer with the reasoning. Never be defensive; accuracy matters more than being right the first time.
5. Language: Fluent in English and Indian languages.
6. File Handling: Analyze uploaded documents accurately without hallucinating outside data.
7. Currency of Law: Tax and corporate law in India changes frequently (Finance Acts, CBDT notifications, amendments). Do not rely solely on memorized training data for anything related to effective dates, current applicability, tax rates/slabs, or recent amendments. Use the search tool to verify current status before answering, especially for questions involving "current", "latest", "applicable from", or specific years. Note: the Income-tax Act, 2025 received presidential assent in August 2025 and came into force on 1 April 2026, replacing the Income-tax Act, 1961 from Tax Year 2026-27 onward — it is not merely a proposal.
8. Cite Currency: When an answer depends on a date-sensitive fact, briefly note the date/source basis (e.g. "as per the Finance Act applicable from April 2026").`;

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
    // Read the data sent from your frontend widget.
    // 'history' is the full back-and-forth: [{ role: 'user'|'model', parts: [...] }, ...]
    const body = await req.json();
    const { history } = body;

    if (!Array.isArray(history) || history.length === 0) {
      return new Response(JSON.stringify({ error: 'No message history provided.' }), {
        headers: { ...headers, 'Content-Type': 'application/json' },
        status: 400
      });
    }

    // TEMP DIAGNOSTIC: log exactly what we received, so if this crashes again
    // the Netlify function log shows the real shape of the bad data.
    console.log('Incoming history:', JSON.stringify(history));

    // Prior turns become the chat's context; the last entry is the new
    // message we're sending right now.
    const priorHistory = history.slice(0, -1);
    const latestTurn = history[history.length - 1];
    console.log('priorHistory:', JSON.stringify(priorHistory));
    console.log('latestTurn:', JSON.stringify(latestTurn));

    // Defensive check: make sure the latest turn actually has usable parts,
    // so we fail with a clear message instead of crashing inside the SDK.
    if (
      !latestTurn ||
      latestTurn.role !== 'user' ||
      !Array.isArray(latestTurn.parts) ||
      latestTurn.parts.length === 0 ||
      latestTurn.parts.some(p => !p || (typeof p.text !== 'string' && !p.inlineData))
    ) {
      console.error('Malformed latestTurn:', JSON.stringify(latestTurn));
      return new Response(JSON.stringify({ error: 'Malformed message received by server.' }), {
        headers: { ...headers, 'Content-Type': 'application/json' },
        status: 400
      });
    }

    // Call the AI (You can swap 'gemini-3.5-flash' for 'gemini-3.1-pro' if needed)
    // googleSearch grounding lets Gemini check current facts (tax law, rates, dates)
    // instead of relying only on what it memorized during training.
    // ai.chats.create() + sendMessage() is the SDK's built-in way to handle
    // multi-turn context, so it can be asked to simplify, elaborate, or recheck itself.
    const chat = ai.chats.create({
      model: 'gemini-3.5-flash',
      history: priorHistory,
      config: {
        systemInstruction: SYSTEM_PROMPT,
        tools: [{ googleSearch: {} }],
      }
    });

    const response = await chat.sendMessage({ message: latestTurn.parts });

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
