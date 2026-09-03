import { env } from "@/env";
import { RtcTokenBuilder, RtcRole } from "agora-token";

const AGORA_BASE = `https://api.agora.io/api/conversational-ai-agent/v2/projects/${env.AGORA_APP_ID}`;

function basicAuth() {
  return `Basic ${Buffer.from(`${env.AGORA_CUSTOMER_ID}:${env.AGORA_CUSTOMER_SECRET}`).toString("base64")}`;
}

/**
 * POST /api/agora/join
 * Body: { channelName: string, studentName: string, resumeJson: string }
 * Starts the Agora Conversational AI interview agent on the given channel.
 * Injects student name + resume into the LLM system prompt.
 */
export async function POST(req: Request) {
  try {
    const { channelName, studentName, resumeJson } = await req.json();

    if (!channelName || !studentName) {
      return new Response(
        JSON.stringify({ error: "channelName and studentName are required" }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }

    const systemPrompt = `You are MockMate Interview Panel Controller. You control 4 interviewers: June (HR), Bryan (Tech), Graham (Product), Alessandra (Hiring Manager).

Context:
Student Name = ${studentName}
Student Resume = ${resumeJson || "No resume provided"}

RULES:
1. You must conduct EXACTLY 8 questions.
2. IMPORTANT: The interview HAS ALREADY STARTED. You (June) have ALREADY asked Q1: "Welcome ${studentName}, let's begin. Walk me through your resume."
   The student's next input is their answer to Q1. DO NOT greet them again. Evaluate their answer and choose the NEXT_SPEAKER for Q2.
3. Decide NEXT_SPEAKER based on the student's answer:
   - If answer has tech/API/code/stack/implementation -> NEXT: Bryan
   - If answer has metrics/business/ownership/led/impact/ROI -> NEXT: Alessandra
   - If answer has product/user/flow/design/built/feature -> NEXT: Graham
   - Else -> NEXT: June for probing
4. OUTPUT FORMAT IS MANDATORY: Start every response with [June]: or [Bryan]: or [Graham]: or [Alessandra]: then the question in 1-2 lines.
5. No repetition. Keep questions short and crisp. Max 2 lines per question.
6. On Q8 completion, output: [June]: Thank you for your time, ${studentName}! Your detailed report is on the way!
7. You are an interviewer, not a chatbot. Stay professional and sharp.`;

    const agentRtcUid = 999;
    const expirationTimeInSeconds = 3600;
    const currentTimestamp = Math.floor(Date.now() / 1000);
    const privilegeExpiredTs = currentTimestamp + expirationTimeInSeconds;

    const agentToken = RtcTokenBuilder.buildTokenWithUid(
      env.AGORA_APP_ID,
      env.AGORA_APP_CERTIFICATE,
      channelName,
      agentRtcUid,
      RtcRole.PUBLISHER,
      privilegeExpiredTs,
      privilegeExpiredTs
    );

    const response = await fetch(`${AGORA_BASE}/join`, {
      method: "POST",
      headers: {
        Authorization: basicAuth(),
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        name: channelName,
        pipeline_id: env.AGORA_AGENT_ID,
        properties: {
          channel: channelName,
          token: agentToken,
          agent_rtc_uid: String(agentRtcUid),
          remote_rtc_uids: ["*"],
          llm: {
            system_messages: [
              {
                role: "system",
                content: systemPrompt,
              },
            ],
          },
        },
      }),
    });

    if (!response.ok) {
      const errText = await response.text();
      console.error("Agora join error:", errText);
      return new Response(
        JSON.stringify({ error: `Agora API error ${response.status}: ${errText}` }),
        { status: response.status, headers: { "Content-Type": "application/json" } }
      );
    }

    const data = await response.json();
    return new Response(JSON.stringify({ success: true, data }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (err: any) {
    console.error("Failed to join Agora channel:", err);
    return new Response(
      JSON.stringify({ error: err.message || "Failed to join Agora channel" }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
}
