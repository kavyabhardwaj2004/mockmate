/* eslint-disable @typescript-eslint/no-explicit-any */
import { env } from "@/env";
import { RtcTokenBuilder, RtcRole } from "agora-token";

/**
 * POST /api/agora/token
 * Body: { channelName: string, uid?: number }
 * Returns a short-lived RTC token for the student to join the Agora channel.
 */
export async function POST(req: Request) {
  try {
    const { channelName, uid = 0 } = await req.json();

    if (!channelName) {
      return new Response(
        JSON.stringify({ error: "channelName is required" }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }

    const appId = env.AGORA_APP_ID;
    const appCertificate = env.AGORA_APP_CERTIFICATE;
    const expirationTimeInSeconds = 3600; // 1 hour
    const currentTimestamp = Math.floor(Date.now() / 1000);
    const privilegeExpiredTs = currentTimestamp + expirationTimeInSeconds;

    const token = RtcTokenBuilder.buildTokenWithUid(
      appId,
      appCertificate,
      channelName,
      uid,
      RtcRole.PUBLISHER,
      privilegeExpiredTs,
      privilegeExpiredTs
    );

    return new Response(
      JSON.stringify({ token, appId, channelName, uid }),
      { status: 200, headers: { "Content-Type": "application/json" } }
    );
  } catch (err: any) {
    console.error("Failed to generate Agora RTC token:", err);
    return new Response(
      JSON.stringify({ error: err.message || "Failed to generate Agora token" }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
}
