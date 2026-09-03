/* eslint-disable @typescript-eslint/no-explicit-any */
import { env } from "@/env";

const AGORA_BASE = `https://api.agora.io/api/conversational-ai-agent/v2/projects/${env.AGORA_APP_ID}`;

function basicAuth() {
  return `Basic ${Buffer.from(`${env.AGORA_CUSTOMER_ID}:${env.AGORA_CUSTOMER_SECRET}`).toString("base64")}`;
}

/**
 * POST /api/agora/leave
 * Body: { channelName: string, agentId?: string }
 * Removes the Agora AI agent from the channel.
 * If agentId is provided, calls the precise agent-stop endpoint.
 */
export async function POST(req: Request) {
  try {
    const { channelName, agentId } = await req.json();

    if (!channelName) {
      return new Response(
        JSON.stringify({ error: "channelName is required" }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }

    // If no agentId is available, there's no remote agent to terminate
    if (!agentId) {
      return new Response(JSON.stringify({ success: true, message: "No agentId to terminate" }), {
        status: 200,
        headers: { "Content-Type": "application/json" },
      });
    }

    const endpoint = `${AGORA_BASE}/agents/${agentId}/leave`;

    const response = await fetch(endpoint, {
      method: "POST",
      headers: {
        Authorization: basicAuth(),
        "Content-Type": "application/json",
      },
      body: JSON.stringify({}),
    });

    if (!response.ok) {
      const errText = await response.text();
      // If the task was already ended (TaskNotFound), treat as clean success
      try {
        const parsed = JSON.parse(errText);
        if (parsed.reason === "TaskNotFound") {
          return new Response(JSON.stringify({ success: true, message: "Agent already terminated" }), {
            status: 200,
            headers: { "Content-Type": "application/json" },
          });
        }
      } catch (_) {}

      console.error("Agora leave error:", errText);
      return new Response(JSON.stringify({ success: false, error: errText }), {
        status: 200,
        headers: { "Content-Type": "application/json" },
      });
    }

    return new Response(JSON.stringify({ success: true }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (err: any) {
    console.error("Failed to leave Agora channel:", err);
    return new Response(
      JSON.stringify({ error: err.message || "Failed to leave channel" }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
}
