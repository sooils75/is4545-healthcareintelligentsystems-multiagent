import express from 'express';
import { createServer as createViteServer } from 'vite';
import { GoogleGenAI } from '@google/genai';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';

dotenv.config();

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const app = express();
const PORT = parseInt(process.env.PORT || '3000', 10);

app.use(express.json({ limit: '15mb' }));

/**
 * Clean and parse JSON from LLM output safely
 */
function cleanAndParseJSON(rawText: string): any {
  let cleaned = rawText.trim();
  // Remove markdown code blocks if present
  if (cleaned.startsWith('```')) {
    cleaned = cleaned.replace(/^```(?:json)?\s*/i, '').replace(/\s*```$/, '');
  }
  cleaned = cleaned.trim();

  try {
    return JSON.parse(cleaned);
  } catch (err) {
    const firstBrace = cleaned.indexOf('{');
    const lastBrace = cleaned.lastIndexOf('}');
    if (firstBrace !== -1 && lastBrace !== -1 && lastBrace > firstBrace) {
      const sub = cleaned.substring(firstBrace, lastBrace + 1);
      return JSON.parse(sub);
    }
    const firstBracket = cleaned.indexOf('[');
    const lastBracket = cleaned.lastIndexOf(']');
    if (firstBracket !== -1 && lastBracket !== -1 && lastBracket > firstBracket) {
      const sub = cleaned.substring(firstBracket, lastBracket + 1);
      return JSON.parse(sub);
    }
    throw new Error(`Failed to parse LLM JSON response: ${(err as Error).message}\nRaw response: ${rawText.slice(0, 300)}`);
  }
}

/**
 * Unified server-side LLM function as requested:
 * callLLM(prompt, data)
 * Uses Gemini as default with fast model 'gemini-3.8-flash' and resilient retry.
 */
export async function callLLM(prompt: string, data: any): Promise<any> {
  const currentKey = process.env.GEMINI_API_KEY;
  if (!currentKey) {
    throw new Error('GEMINI_API_KEY is missing on the server. Please ensure an API key is configured in Settings > Secrets.');
  }

  const payloadString = typeof data === 'string' ? data : JSON.stringify(data, null, 2);
  const contents = `DATA INPUT:\n${payloadString}\n\nPROCESS THIS DATA STRICTLY ACCORDING TO YOUR ROLE INSTRUCTIONS AND RETURN VALID JSON ONLY.`;

  // Prioritize fast model 'gemini-3.1-flash-lite' as required by prompt ("fast model") to avoid 504 deadline exceeded errors
  const modelsToTry = [
    { name: 'gemini-3.1-flash-lite', config: {} },
    { name: 'gemini-3.8-flash', config: { thinkingConfig: { thinkingLevel: 'LOW' as any } } },
    { name: 'gemini-flash-latest', config: {} },
  ];
  let lastError: any = null;

  for (const item of modelsToTry) {
    try {
      const ai = new GoogleGenAI({
        apiKey: currentKey,
        httpOptions: {
          headers: {
            'User-Agent': 'aistudio-build',
          },
          timeout: 35000,
        },
      });

      const response = await ai.models.generateContent({
        model: item.name,
        contents: contents,
        config: {
          systemInstruction: prompt,
          responseMimeType: 'application/json',
          ...item.config,
        },
      });

      const text = response.text;
      if (text) {
        return cleanAndParseJSON(text);
      }
    } catch (err: any) {
      console.warn(`[Agent Server] Model ${item.name} error: ${err?.message || err}. Trying fallback...`);
      lastError = err;
    }
  }

  throw new Error(`Gemini API Error across candidate models: ${lastError?.message || 'Service unavailable'}`);
}

async function startServer() {
  const isProd = process.env.NODE_ENV === 'production';

  // API endpoint for individual agent execution
  app.post('/api/agents/call', async (req, res) => {
    try {
      const { agentId, agentName, prompt, data } = req.body;
      if (!prompt) {
        return res.status(400).json({ success: false, error: 'Agent system prompt is required' });
      }

      console.log(`[Agent Server] Invoking ${agentName || agentId || 'Unknown Agent'}...`);
      const startTime = Date.now();
      const result = await callLLM(prompt, data);
      const durationMs = Date.now() - startTime;
      console.log(`[Agent Server] Completed ${agentName || agentId} in ${durationMs}ms`);

      return res.json({
        success: true,
        agentId,
        durationMs,
        result,
      });
    } catch (err: any) {
      console.error(`[Agent Server Error]:`, err);
      return res.status(500).json({
        success: false,
        error: err?.message || 'Internal server error while executing agent LLM call',
      });
    }
  });

  // Health and config status check
  app.get('/api/health', (_req, res) => {
    res.json({
      status: 'healthy',
      model: 'gemini-3.1-flash-lite',
      hasApiKey: !!process.env.GEMINI_API_KEY,
      timestamp: new Date().toISOString(),
    });
  });

  // Serve app via Vite middleware in dev or static files in production
  if (!isProd) {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.resolve(__dirname, 'dist')));
    app.get('*', (_req, res) => {
      res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`🚀 Hospital Patient Experience Intelligence Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
