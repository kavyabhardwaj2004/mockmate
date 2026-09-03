/* eslint-disable @typescript-eslint/no-explicit-any, @typescript-eslint/no-unused-vars */
import { callLLM } from '@/lib/llm';

export async function POST(req: Request) {
  try {
    const { message, history } = await req.json();

    const systemInstruction = `You are June HR, a professional HR interviewer conducting a structured HR round interview. Ask one question at a time. Wait for the candidate's response before proceeding. Start with an introduction, then cover: tell me about yourself, strengths and weaknesses, teamwork, leadership, conflict resolution, career goals, why should we hire you, handling pressure, and behavioral questions. Keep responses concise and conversational. Do not break character.`;

    // Construct history presentation for the LLM
    let formattedHistory = '';
    if (history && Array.isArray(history) && history.length > 0) {
      formattedHistory = history
        .map((h: any) => `${h.speaker}: ${h.text}`)
        .join('\n') + '\n';
    }

    const prompt = `Here is the conversation history so far:
${formattedHistory}
User's latest response: "${message}"

Generate the next response from June HR. Remember to:
- Ask exactly one follow-up or next interview question.
- Keep the response short, conversational, and direct (max 40-50 words).
- Keep it natural, professional, and within character.`;

    const responseText = await callLLM(prompt, {
      systemInstruction,
      temperature: 0.7,
      maxTokens: 150,
    });

    return new Response(JSON.stringify({ response: responseText.trim() }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (err: any) {
    console.error("HR Chat API Error:", err);
    return new Response(JSON.stringify({ error: err.message || "Failed to process chat" }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}
