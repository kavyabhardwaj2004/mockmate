/* eslint-disable @typescript-eslint/no-explicit-any */
import { callLLM } from '@/lib/llm';

const ALL_AVATARS = ["june", "bryan", "graham", "alessandra"] as const;

export async function POST(req: Request) {
  try {
    const { studentName, userMessage, transcript, questionCount, spokenAvatars = [] } = await req.json();

    // Determine which avatars haven't spoken yet — force them in
    const unspoken = ALL_AVATARS.filter(a => !spokenAvatars.includes(a));

    // If there are unspoken avatars AND we're past question 2, force one of them
    const forceAvatar = (questionCount >= 2 && unspoken.length > 0) ? unspoken[0] : null;

    const systemInstruction = `You are the master orchestrator for the "Game of Fours" panel interview with 4 interviewers:
1. June (HR Manager): HR, communication, teamwork, soft skills, background, career journey.
2. Bryan (Tech Lead): Technical architecture, coding, stack, APIs, algorithms, system design.
3. Graham (Product Manager): Product design, user experience, prioritization, features, product thinking.
4. Alessandra (Hiring Manager): Business impact, metrics, ownership, ROI, leadership, company fitment.

Rules:
- Analyze the student's latest response.
- ${forceAvatar ? `IMPORTANT: You MUST assign this question to "${forceAvatar}" — they have not spoken yet and MUST get a turn.` : "Select the most suitable interviewer based on the response topic."}
- Generate a sharp, natural 1-2 sentence question (max 30 words).
- Make the question feel like a REAL interview — specific, probing, not generic.
- Output MUST be valid JSON ONLY:
{"speaker": "June" | "Bryan" | "Graham" | "Alessandra", "question": "Your question here"}`;

    let formattedHistory = "";
    if (transcript && Array.isArray(transcript)) {
      formattedHistory = transcript
        .slice(-6)
        .map((t: any) => `${t.speaker}: ${t.text}`)
        .join("\n");
    }

    const prompt = `Student Name: ${studentName || "Candidate"}
Recent Conversation:
${formattedHistory}

Student's Latest Answer: "${userMessage}"
Question Number: ${questionCount + 1} of 8.
Avatars who have spoken so far: ${spokenAvatars.join(", ") || "none"}
${forceAvatar ? `\nFORCED SPEAKER: ${forceAvatar} (must speak this turn)` : ""}

Output JSON only.`;

    const rawResponse = await callLLM(prompt, {
      systemInstruction,
      temperature: 0.7,
      maxTokens: 150,
    });

    const jsonStr = rawResponse.replace(/```json/g, "").replace(/```/g, "").trim();
    let parsed: any;
    try {
      parsed = JSON.parse(jsonStr);
      // Validate speaker
      const validSpeakers = ["June", "Bryan", "Graham", "Alessandra"];
      if (!validSpeakers.includes(parsed.speaker)) {
        parsed.speaker = forceAvatar
          ? (forceAvatar.charAt(0).toUpperCase() + forceAvatar.slice(1))
          : "June";
      }
    } catch {
      const fallbackSpeaker = forceAvatar
        ? (forceAvatar.charAt(0).toUpperCase() + forceAvatar.slice(1))
        : "June";
      parsed = {
        speaker: fallbackSpeaker,
        question: `${studentName || "Candidate"}, could you elaborate more on the key challenges you faced in that experience?`
      };
    }

    return new Response(JSON.stringify(parsed), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (err: any) {
    console.error("Panel Next Question Error:", err);
    return new Response(
      JSON.stringify({ speaker: "June", question: "Could you tell me more about your recent project work?" }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
}
