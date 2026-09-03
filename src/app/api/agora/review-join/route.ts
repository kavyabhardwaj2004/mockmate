import { env } from "@/env";
import { RtcTokenBuilder, RtcRole } from "agora-token";

const AGORA_BASE = `https://api.agora.io/api/conversational-ai-agent/v2/projects/${env.AGORA_APP_ID}`;

function basicAuth() {
  return `Basic ${Buffer.from(`${env.AGORA_CUSTOMER_ID}:${env.AGORA_CUSTOMER_SECRET}`).toString("base64")}`;
}

/**
 * POST /api/agora/review-join
 * Body: { channelName, avatarName, studentName, transcript, feedback }
 * Starts the Agora Conversational AI review/mentor agent for 1-on-1 review.
 * The agent acts as the chosen avatar in mentor mode (NOT interviewer mode).
 */
export async function POST(req: Request) {
  try {
    const { channelName, avatarName, studentName, transcript, feedback } = await req.json();

    if (!channelName || !avatarName || !studentName) {
      return new Response(
        JSON.stringify({ error: "channelName, avatarName, studentName are required" }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }

    const systemPrompt = `You are ${avatarName} - you are now a MENTOR, not an interviewer.

CONTEXT YOU MUST USE:
Student Name: ${studentName}
Their Interview Transcript: ${transcript || "No transcript available"}
Your Previous Feedback for them: ${feedback || "No specific feedback"}

YOUR JOB:
- Student clicked "Talk to ${avatarName}" because they want clarity on your feedback.
- Refer to their SPECIFIC answers from transcript. Example: "When you said you used MongoDB for..."
- Explain what was good/bad and how to improve.
- Be warm, personal, mentor-like. Don't ask new interview questions.
- Keep answers short (2-3 sentences).
- If student asks out-of-scope, bring back to their report.

Start with: "Hey ${studentName}, I was there in your panel as ${avatarName}. Let's break down your feedback..."`;

    // Generate RTC token for the agent (UID 999) so it can authenticate into the channel
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
        pipeline_id: env.AGORA_REVIEW_PIPELINE_ID,
        properties: {
          channel: channelName,
          token: agentToken,
          agent_rtc_uid: String(agentRtcUid),
          remote_rtc_uids: ["*"],
          llm: {
            greeting_message: `Hey ${studentName}, I was there in your panel as ${avatarName}. Let's break down your feedback!`,
            greeting: `Hey ${studentName}, I was there in your panel as ${avatarName}. Let's break down your feedback!`,
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
      console.error("Agora review-join error:", errText);
      return new Response(
        JSON.stringify({ error: `Agora review error ${response.status}: ${errText}` }),
        { status: response.status, headers: { "Content-Type": "application/json" } }
      );
    }

    const data = await response.json();
    return new Response(JSON.stringify({ success: true, data }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (err: any) {
    console.error("Failed to start Agora review session:", err);
    return new Response(
      JSON.stringify({ error: err.message || "Failed to start review session" }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
}
