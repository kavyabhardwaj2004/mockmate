/* eslint-disable @typescript-eslint/no-explicit-any */
import { callLLM } from '@/lib/llm';
import { supabase } from "@/lib/supabase";

/**
 * POST /api/panel/report
 * Body: { studentName, email, transcript: Array<{speaker, text}> }
 * Calls LLM to generate a structured 4-avatar feedback report.
 * Saves to Supabase panel_sessions table.
 */
export async function POST(req: Request) {
  try {
    const { studentName, email, transcript } = await req.json();

    if (!transcript || !studentName) {
      return new Response(
        JSON.stringify({ error: "studentName and transcript are required" }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }

    const transcriptText = (transcript as Array<{ speaker: string; text: string }>)
      .map((t) => `[${t.speaker}]: ${t.text}`)
      .join("\n");

    const systemInstruction = `You are an expert interview evaluator for the "Game of Fours" panel interview system. 
Analyze panel interview transcripts and provide honest, specific, actionable feedback.
Always output valid JSON only — no markdown, no extra text.`;

    const prompt = `Analyze the following panel interview transcript and generate a comprehensive evaluation report.

Student Name: ${studentName}

Interview Transcript:
${transcriptText}

Generate a JSON report with EXACTLY this structure:
{
  "overall_score": <number 0-100>,
  "verdict": "<one line — e.g. 'Strong Candidate' or 'Needs Improvement' or 'Top Performer'>",
  "strengths": ["<strength 1>", "<strength 2>", "<strength 3>"],
  "weaknesses": ["<weakness 1>", "<weakness 2>", "<weakness 3>"],
  "june_feedback": "<June HR's specific feedback on communication, presentation, professionalism — 2-3 sentences>",
  "bryan_feedback": "<Bryan Tech's specific feedback on technical depth, stack knowledge, coding — 2-3 sentences>",
  "graham_feedback": "<Graham Product's specific feedback on product thinking, user empathy, business sense — 2-3 sentences>",
  "alessandra_feedback": "<Alessandra Hiring Manager's specific feedback on overall fitment, leadership signals, culture — 2-3 sentences>"
}

Output JSON only.`;

    const rawResponse = await callLLM(prompt, {
      systemInstruction,
      temperature: 0.4,
      maxTokens: 800,
    });

    const jsonStr = rawResponse.replace(/```json/g, "").replace(/```/g, "").trim();
    const report = JSON.parse(jsonStr);

    // Save to Supabase (non-fatal)
    let savedId: string | null = null;
    try {
      const { data, error } = await supabase
        .from("panel_sessions")
        .insert({
          email: email || null,
          student_name: studentName,
          overall_score: report.overall_score || 0,
          verdict: report.verdict || "",
          strengths: report.strengths || [],
          weaknesses: report.weaknesses || [],
          june_feedback: report.june_feedback || "",
          bryan_feedback: report.bryan_feedback || "",
          graham_feedback: report.graham_feedback || "",
          alessandra_feedback: report.alessandra_feedback || "",
          transcript: transcript,
        })
        .select("id")
        .single();

      if (error) {
        console.error("Supabase insert error:", error);
      } else if (data) {
        savedId = data.id;
      }
    } catch (dbErr) {
      console.error("DB save failed (non-fatal):", dbErr);
    }

    return new Response(
      JSON.stringify({ report, sessionId: savedId }),
      { status: 200, headers: { "Content-Type": "application/json" } }
    );
  } catch (err: any) {
    console.error("Failed to generate panel report:", err);
    return new Response(
      JSON.stringify({ error: err.message || "Failed to generate report" }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
}
