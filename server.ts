import express from 'express';
import { createServer as createViteServer } from 'vite';
import { GoogleGenAI } from '@google/genai';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function startServer() {
  const app = express();
  app.use(express.json({ limit: '10mb' }));

  // Gemini AI chat endpoint with correct model fallback
  app.post('/api/gemini-chat', async (req, res) => {
    try {
      const { message, history } = req.body;
      const apiKey = process.env.GEMINI_API_KEY;
      if (!apiKey) {
        return res.status(500).json({ error: 'GEMINI_API_KEY is not configured.' });
      }

      const ai = new GoogleGenAI({ apiKey });
      const modelsToTry = ['gemini-2.5-flash', 'gemini-flash-lite-latest', 'gemini-1.5-flash'];

      const systemInstruction = `You are Felco AI Support, the official virtual assistant for TEAM FELCO STORE. 
You help customers understand our premium digital tools: 
1. COLOUR TRADING TOOL (Compatible games: HGNICE, DKWIN, BDWIN)
2. AVIATOR TOOL (Compatible games: HGNICE, DKWIN, BDWIN, 1X BET, CK444)
Provide helpful, professional, polite, and concise black-and-white store assistance regarding purchases, game selections, payment methods (bKash, Nagad, Rocket), and order status.`;

      const contents = [
        ...(history || []).map((h: any) => ({
          role: h.role,
          parts: [{ text: h.text }]
        })),
        { role: 'user', parts: [{ text: message }] }
      ];

      let responseText = '';
      let lastError = null;

      for (const m of modelsToTry) {
        try {
          const response = await ai.models.generateContent({
            model: m,
            contents,
            config: {
              systemInstruction,
              temperature: 0.7,
            }
          });
          if (response.text) {
            responseText = response.text;
            break;
          }
        } catch (err: any) {
          lastError = err;
        }
      }

      if (!responseText && lastError) {
        throw lastError;
      }

      res.json({ reply: responseText || 'Hello! Welcome to Team Felco Store. How can we assist you with our tools today?' });
    } catch (err: any) {
      console.error('Gemini API Error:', err);
      res.status(500).json({ error: err.message || 'Failed to generate AI response' });
    }
  });

  if (process.env.NODE_ENV === 'production') {
    app.use(express.static(path.join(__dirname, 'dist')));
    app.get('*', (req, res) => {
      res.sendFile(path.join(__dirname, 'dist', 'index.html'));
    });
  } else {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa'
    });
    app.use(vite.middlewares);

    // Fallback all non-API paths to serve index.html via Vite transform
    app.get('*', async (req, res, next) => {
      if (req.path.startsWith('/api')) {
        return next();
      }
      try {
        const fs = await import('fs');
        let html = fs.readFileSync(path.resolve(__dirname, 'index.html'), 'utf-8');
        html = await vite.transformIndexHtml(req.url, html);
        res.status(200).set({ 'Content-Type': 'text/html' }).end(html);
      } catch (e) {
        next(e);
      }
    });
  }

  const PORT = Number(process.env.PORT) || 3000;
  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on port ${PORT}`);
  });
}

startServer();
