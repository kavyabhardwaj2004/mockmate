/* eslint-disable @typescript-eslint/no-explicit-any */
import { env } from "@/env";

/**
 * POST /api/heygen/speak
 * Body: { session_id: string, text: string }
 * Makes an active HeyGen streaming avatar speak the given text.
 */
export async function POST(req: Request) {
  try {
    const { session_id, text } = await req.json();

    if (!session_id || !text) {
      return new Response(
        JSON.stringify({ error: "session_id and text are required" }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }

    const response = await fetch("https://api.heygen.com/v1/streaming.task", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": env.HEYGEN_API_KEY_PANEL || env.HEYGEN_API_KEY_HR,
      },
      body: JSON.stringify({
        session_id,
        text,
        task_type: "talk",
      }),
    });

    if (!response.ok) {
      const errText = await response.text();
      console.error("HeyGen speak error:", errText);
      return new Response(
        JSON.stringify({ error: `HeyGen API error ${response.status}: ${errText}` }),
        { status: response.status, headers: { "Content-Type": "application/json" } }
      );
    }

    const data = await response.json();
    return new Response(JSON.stringify({ success: true, data }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (err: any) {
    console.error("Failed to make avatar speak:", err);
    return new Response(
      JSON.stringify({ error: err.message || "Failed to make avatar speak" }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
}
