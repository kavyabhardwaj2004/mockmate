import { env } from "@/env";

/**
 * POST /api/heygen/stop
 * Body: { sessionToken: string }
 * Stops a HeyGen LiveAvatar session server-side using the session token.
 * This is safer than calling stop() from the SDK (which causes unhandled rejections).
 */
export async function POST(req: Request) {
  try {
    const { sessionToken } = await req.json().catch(() => ({}));
    if (!sessionToken) {
      return new Response(JSON.stringify({ ok: true, skipped: true }), {
        status: 200,
        headers: { "Content-Type": "application/json" },
      });
    }

    // Use the session token directly — it's a bearer token for the session's own API
    const response = await fetch("https://api.liveavatar.com/v1/sessions/stop", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${sessionToken}`,
        "Content-Type": "application/json",
      },
    });

    // We don't care if it fails (session may already be dead) — always return ok
    const text = await response.text().catch(() => "");
    console.log("[HeyGen stop] status:", response.status, text.slice(0, 100));

    return new Response(JSON.stringify({ ok: true, status: response.status }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (err: any) {
    // Non-fatal — always return ok so the client doesn't block
    console.warn("[HeyGen stop] error (non-fatal):", err?.message);
    return new Response(JSON.stringify({ ok: true, error: err?.message }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  }
}
