/* eslint-disable @typescript-eslint/no-explicit-any, @typescript-eslint/no-unused-vars */
import { GoogleGenerativeAI } from '@google/generative-ai';
import { env } from '@/env';

// Initialize Gemini client
let genAI: GoogleGenerativeAI | null = null;
try {
  if (env.GEMINI_API_KEY) {
    genAI = new GoogleGenerativeAI(env.GEMINI_API_KEY);
  }
} catch (err) {
  console.warn("Failed to initialize GoogleGenerativeAI:", err);
}

interface LLMOptions {
  model?: string;
  systemInstruction?: string;
  temperature?: number;
  maxTokens?: number;
  format?: 'json';
}

/**
 * callGroq — Calls Groq API directly (no SDK needed, pure fetch).
 * Uses llama-3.3-70b-versatile by default — fast, free, excellent quality.
 */
async function callGroq(prompt: string, options: LLMOptions = {}): Promise<string> {
  const apiKey = env.GROQ_API_KEY;
  if (!apiKey) throw new Error("No GROQ_API_KEY");

  const messages: any[] = [];
  if (options.systemInstruction) {
    messages.push({ role: "system", content: options.systemInstruction });
  }
  messages.push({ role: "user", content: prompt });

  const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: options.model || "llama-3.1-8b-instant",
      messages,
      temperature: options.temperature ?? 0.4,
      max_tokens: options.maxTokens ?? 1000,
      response_format: options.format === 'json' ? { type: "json_object" } : undefined,
    }),
  });

  if (!response.ok) {
    const errText = await response.text();
    throw new Error(`Groq API error ${response.status}: ${errText}`);
  }

  const data = await response.json();
  const text = data.choices?.[0]?.message?.content;
  if (!text) throw new Error("Groq returned empty response");
  return text;
}

/**
 * Standard non-streaming LLM call.
 * Priority: Groq (fastest) → Gemini → Ollama (local fallback)
 */
export async function callLLM(prompt: string, options: LLMOptions = {}): Promise<string> {
  // 1. Try Groq first (fastest, best quality for JSON routing tasks)
  if (env.GROQ_API_KEY) {
    try {
      const text = await callGroq(prompt, options);
      if (text) return text;
    } catch (e) {
      console.warn("Groq call failed. Trying Gemini...", e);
    }
  }

  // 2. Try Gemini
  if (genAI && env.GEMINI_API_KEY) {
    try {
      const geminiModel = genAI.getGenerativeModel({
        model: options.model || 'gemini-1.5-flash',
        systemInstruction: options.systemInstruction,
      });

      const result = await geminiModel.generateContent({
        contents: [{ role: 'user', parts: [{ text: prompt }] }],
        generationConfig: {
          temperature: options.temperature ?? 0.4,
          maxOutputTokens: options.maxTokens ?? 1000,
          responseMimeType: options.format === 'json' ? 'application/json' : undefined,
        },
      });

      const responseText = result.response.text();
      if (responseText) return responseText;
    } catch (e) {
      console.warn("Gemini call failed. Trying Ollama...", e);
    }
  }

  // 3. Ollama (Local fallback)
  try {
    const payload: any = {
      model: 'gemma3:4b',
      prompt: prompt,
      stream: false,
      options: {
        temperature: options.temperature ?? 0.4,
        num_predict: options.maxTokens ?? 1000,
      }
    };

    if (options.systemInstruction) payload.system = options.systemInstruction;
    if (options.format === 'json') payload.format = 'json';

    const response = await fetch('http://localhost:11434/api/generate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });

    if (!response.ok) throw new Error(`Ollama returned ${response.status}`);
    const data = await response.json();
    if (data.response) return data.response;
  } catch (e) {
    console.error("Ollama fallback failed:", e);
  }

  throw new Error("All LLM providers failed (Groq, Gemini, Ollama).");
}

/**
 * Streaming LLM call. Priority: Groq stream → Gemini stream → Ollama stream.
 */
export async function callLLMStream(prompt: string, options: LLMOptions = {}): Promise<ReadableStream> {
  const encoder = new TextEncoder();

  // 1. Try Groq streaming
  if (env.GROQ_API_KEY) {
    try {
      const messages: any[] = [];
      if (options.systemInstruction) {
        messages.push({ role: "system", content: options.systemInstruction });
      }
      messages.push({ role: "user", content: prompt });

      const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${env.GROQ_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: options.model || "llama-3.1-8b-instant",
          messages,
          temperature: options.temperature ?? 0.4,
          max_tokens: options.maxTokens ?? 1000,
          stream: true,
        }),
      });

      if (!response.ok || !response.body) throw new Error("Groq stream failed");

      const reader = response.body.getReader();
      const decoder = new TextDecoder();

      return new ReadableStream({
        async start(controller) {
          let buffer = '';
          try {
            while (true) {
              const { done, value } = await reader.read();
              if (done) break;
              buffer += decoder.decode(value, { stream: true });
              const lines = buffer.split('\n');
              buffer = lines.pop() || '';
              for (const line of lines) {
                const trimmed = line.trim();
                if (!trimmed || trimmed === 'data: [DONE]') continue;
                if (trimmed.startsWith('data: ')) {
                  try {
                    const parsed = JSON.parse(trimmed.slice(6));
                    const content = parsed.choices?.[0]?.delta?.content;
                    if (content) controller.enqueue(encoder.encode(content));
                  } catch (_) {}
                }
              }
            }
          } catch (err) {
            controller.error(err);
          } finally {
            controller.close();
          }
        }
      });
    } catch (e) {
      console.warn("Groq stream failed. Trying Gemini stream...", e);
    }
  }

  // 2. Try Gemini Stream
  if (genAI && env.GEMINI_API_KEY) {
    try {
      const geminiModel = genAI.getGenerativeModel({
        model: options.model || 'gemini-1.5-flash',
        systemInstruction: options.systemInstruction,
      });

      const result = await geminiModel.generateContentStream({
        contents: [{ role: 'user', parts: [{ text: prompt }] }],
        generationConfig: {
          temperature: options.temperature ?? 0.4,
          maxOutputTokens: options.maxTokens ?? 1000,
          responseMimeType: options.format === 'json' ? 'application/json' : undefined,
        },
      });

      const iterator = result.stream[Symbol.asyncIterator]();
      const firstResult = await iterator.next();

      return new ReadableStream({
        async start(controller) {
          try {
            if (!firstResult.done && firstResult.value) {
              const text = firstResult.value.text();
              if (text) controller.enqueue(encoder.encode(text));
            }
            if (!firstResult.done) {
              while (true) {
                const { done, value } = await iterator.next();
                if (done) break;
                const text = value.text();
                if (text) controller.enqueue(encoder.encode(text));
              }
            }
          } catch (err) {
            controller.error(err);
          } finally {
            controller.close();
          }
        }
      });
    } catch (e) {
      console.warn("Gemini stream failed. Trying Ollama...", e);
    }
  }

  // 3. Ollama Stream (Local fallback)
  try {
    const payload: any = {
      model: 'gemma3:4b',
      prompt: prompt,
      stream: true,
      options: { temperature: options.temperature ?? 0.4, num_predict: options.maxTokens ?? 1000 },
    };
    if (options.systemInstruction) payload.system = options.systemInstruction;
    if (options.format === 'json') payload.format = 'json';

    const response = await fetch('http://localhost:11434/api/generate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });

    if (!response.ok || !response.body) throw new Error(`Ollama stream error ${response.status}`);

    const reader = response.body.getReader();
    const decoder = new TextDecoder();

    return new ReadableStream({
      async start(controller) {
        let buffer = '';
        try {
          while (true) {
            const { done, value } = await reader.read();
            if (done) break;
            buffer += decoder.decode(value, { stream: true });
            const lines = buffer.split('\n');
            buffer = lines.pop() || '';
            for (const line of lines) {
              if (!line.trim()) continue;
              try {
                const parsed = JSON.parse(line);
                if (parsed.response) controller.enqueue(encoder.encode(parsed.response));
              } catch (_) {}
            }
          }
        } catch (err) {
          controller.error(err);
        } finally {
          controller.close();
        }
      }
    });
  } catch (e) {
    console.error("All stream providers failed:", e);
    throw e;
  }
}
