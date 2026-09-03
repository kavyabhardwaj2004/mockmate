/* eslint-disable @typescript-eslint/no-explicit-any, @typescript-eslint/no-unused-vars */
import { env } from "@/env";

// Resolves avatar_id from key name or direct UUID
function resolveAvatarId(avatarKey?: string): string {
  const map: Record<string, string> = {
    june: env.HEYGEN_AVATAR_JUNE_ID,
    bryan: env.HEYGEN_AVATAR_BRYAN_ID,
    graham: env.HEYGEN_AVATAR_GRAHAM_ID,
    alessandra: env.HEYGEN_AVATAR_ALESSANDRA_ID,
  };
  if (avatarKey && map[avatarKey.toLowerCase()]) return map[avatarKey.toLowerCase()];
  // If it looks like a UUID, use it directly
  if (avatarKey && avatarKey.length > 20) return avatarKey;
  // Default to June
  return env.HEYGEN_AVATAR_JUNE_ID;
}

export async function POST(req: Request) {
  try {
    const body = await req.json().catch(() => ({}));
    const avatarId = resolveAvatarId(body?.avatarKey || body?.avatar_id);

    const isPanel = !!body?.avatarKey;
    const apiKey = isPanel ? env.HEYGEN_API_KEY_PANEL : env.HEYGEN_API_KEY_HR;

    const response = await fetch("https://api.liveavatar.com/v1/sessions/token", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": apiKey,
      },
      body: JSON.stringify({
        mode: "FULL",
        avatar_id: avatarId,
        avatar_persona: {
          language: "en",
        },
      }),
    });

    if (!response.ok) {
      const errText = await response.text();
      console.error("LiveAvatar Token Endpoint error response:", errText);
      return new Response(
        JSON.stringify({ error: `LiveAvatar API returned status ${response.status}: ${errText}` }),
        { status: response.status, headers: { "Content-Type": "application/json" } }
      );
    }

    const { data } = await response.json();

    if (!data || !data.session_token) {
      console.error("LiveAvatar Token response missing token:", data);
      return new Response(
        JSON.stringify({ error: "No session_token found in LiveAvatar response" }),
        { status: 500, headers: { "Content-Type": "application/json" } }
      );
    }

    return new Response(
      JSON.stringify({ token: data.session_token, avatarId }),
      { status: 200, headers: { "Content-Type": "application/json" } }
    );
  } catch (err: any) {
    console.error("Failed to generate LiveAvatar token:", err);
    return new Response(
      JSON.stringify({ error: err.message || "Failed to generate token" }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
}
