import express, { Request, Response } from 'express';
import { createServer as createViteServer } from 'vite';
import dotenv from 'dotenv';
import { GoogleGenAI, Type } from '@google/genai';

dotenv.config();

const app = express();
const port = process.env.PORT ? parseInt(process.env.PORT, 10) : 3000;

app.use(express.json());

// Initialize Gemini client if API key is provided
let aiClient: GoogleGenAI | null = null;
if (process.env.GEMINI_API_KEY) {
  try {
    aiClient = new GoogleGenAI({
      apiKey: process.env.GEMINI_API_KEY,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        },
      },
    });
  } catch (err) {
    console.warn('Failed to initialize GoogleGenAI client:', err);
  }
}

// Health check endpoint
app.get('/api/health', (_req: Request, res: Response) => {
  res.json({
    status: 'ok',
    hasGeminiKey: Boolean(process.env.GEMINI_API_KEY),
  });
});

// Structured NLP route for Dropline bot
app.post('/api/gemini/parse', async (req: Request, res: Response) => {
  const { message, context } = req.body;

  if (!message || typeof message !== 'string') {
    return res.status(400).json({ error: 'Message is required' });
  }

  // If no Gemini client is configured or no API key, let client fallback to local parser
  if (!aiClient) {
    return res.json({
      fallback: true,
      reason: 'No GEMINI_API_KEY found, using local intelligent engine',
    });
  }

  try {
    const systemPrompt = `You are the core intelligence parser for Dropline, a chat-first automated purchasing bot for limited-edition collectibles (sneakers, figures, art toys, TCG boxes).
Your job is to parse the user's message and determine the intent and extract structured parameters.

Current Active Stores:
- VinylForge (shopify)
- TCG Vault (custom_api)
- SneakerLoom (shopify)

Known Profiles:
- "Home (Primary)" (Visa ending 4242)
- "Studio Express" (Amex ending 8192)

Available Intent Types:
1. "create_task": User wants to create or monitor a drop (e.g. "Buy 2 of the Neon Dragon card box when it drops tomorrow at 9am, max $180 each, use my home profile").
   Extract:
   - product (string, e.g. "Neon Dragon Booster Box")
   - store (string or null, e.g. "TCG Vault")
   - variant (string or null, e.g. "Size M", "Booster Box", "One Size")
   - quantity (number, default 1)
   - maxPrice (number or null)
   - profile (string or null, e.g. "Home (Primary)")
   - dropTime (string or null, e.g. "Tomorrow at 9:00 AM", "Friday at 10:00 AM")
   - retries (number, default 3)
   - missingInfo (array of strings if crucial info is missing, e.g. ["variant"] if it's clothing/sneakers without size, else empty array)

2. "manage_tasks": User wants to stop, start, pause, resume, or delete tasks (e.g. "Stop all tasks", "Pause the sneaker task", "Resume Midnight Bear").
   Extract:
   - action: "pause" | "resume" | "stop" | "delete" | "run_now"
   - target: "all" | product name or taskId

3. "list_drops": User wants to view upcoming drops or asks what is dropping (e.g. "What's dropping this week?", "Show drops").
   Extract:
   - filterCategory: string or "all"

4. "task_status": User asks about the status of an existing task (e.g. "How's my Kaws task doing?", "Status of Midnight Bear").
   Extract:
   - target: product name or "all"

5. "manage_profiles": User asks about shipping/payment profiles or wants to add one (e.g. "Add a new shipping profile", "Show profiles").
   Extract:
   - action: "list" | "create"
   - profileName: string or null

6. "connect_store": User wants to connect an online store (e.g. "Add my store at example-collectibles.com").
   Extract:
   - storeUrl: string
   - storeName: string

7. "show_analytics": User wants to see past results, statistics, or metrics (e.g. "Show me my results this month", "Success rate").

8. "show_logs": User asks to see logs (e.g. "Show logs for the last drop").
   Extract:
   - dropName: string or null

9. "general_chat": Clarifying question or greeting. Short, crisp response as an expert drop operator.

Return ONLY a valid JSON object matching the schema.`;

    const response = await aiClient.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: [
        {
          role: 'user',
          parts: [
            {
              text: `User query: "${message}"\nContext info: ${JSON.stringify(
                context || {}
              )}`,
            },
          ],
        },
      ],
      config: {
        systemInstruction: systemPrompt,
        responseMimeType: 'application/json',
        temperature: 0.1,
      },
    });

    const parsedText = response.text || '{}';
    const parsedData = JSON.parse(parsedText);
    return res.json({
      fallback: false,
      data: parsedData,
    });
  } catch (error: any) {
    console.error('Gemini parse error:', error);
    // Graceful fallback to client engine
    return res.json({
      fallback: true,
      error: error.message || 'Gemini parse failed, falling back to local engine',
    });
  }
});

async function start() {
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static('dist'));
    app.get('*', (_req: Request, res: Response) => {
      res.sendFile('dist/index.html', { root: '.' });
    });
  }

  app.listen(port, '0.0.0.0', () => {
    console.log(`Dropline running at http://0.0.0.0:${port}`);
  });
}

start().catch((err) => {
  console.error('Server failed to start:', err);
});
