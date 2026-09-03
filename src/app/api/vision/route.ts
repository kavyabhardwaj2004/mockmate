import { NextRequest, NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { env } from "@/env";

const genAI = new GoogleGenerativeAI(env.GEMINI_API_KEY);
const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

export async function POST(req: NextRequest) {
  try {
    const { imageBase64 } = await req.json();

    if (!imageBase64) {
      return NextResponse.json({ error: "Image data is required" }, { status: 400 });
    }

    // ✅ Comprehensive prompt for face detection and proctoring
    const prompt = `You are an AI exam proctor. Analyze this webcam frame RIGHT NOW.

VIOLATION CONDITIONS — flag ANY of these as true:
1. PHONE DETECTED: Any phone/tablet/device visible — screen on or off, edge visible, hand holding rectangle, reflection of screen, glowing object in hand or on desk
2. MULTIPLE FACES: More than one human face visible anywhere
3. NO FACE: No human face visible at all (empty chair, ceiling, wall, blurry)
4. LOOKING AWAY: Eyes and head pointed away from screen for more than a moment

YOUR ONLY TASK: Check if a human face is clearly visible in the image AND ensure none of the above violation conditions are met.

YOU MUST RESPOND WITH ONLY THIS JSON. NO OTHER TEXT. NO BACKTICKS. NO MARKDOWN:
{"violation": false, "reason": "Face detected"} 
OR
{"violation": true, "reason": "Face not seen or violation detected"}`;

    const result = await model.generateContent({
      contents: [{
        role: "user",
        parts: [
          { inlineData: { mimeType: "image/jpeg", data: imageBase64 } },
          { text: prompt },
        ]
      }],
      generationConfig: { temperature: 0.0, maxOutputTokens: 80 }
    });

    const text = result.response.text().trim();

    // ✅ Strip any accidental markdown code fences before parsing
    const cleaned = text.replace(/```json|```/gi, '').trim();
    const match = cleaned.match(/\{[\s\S]*\}/);

    let parsed: { violation: boolean; reason: string } = {
      violation: false,
      reason: "Unable to parse AI response"
    };

    if (match) {
      try {
        parsed = JSON.parse(match[0]);
      } catch {
        // If JSON is malformed but text mentions phone/violation, flag it
        const lower = text.toLowerCase();
        if (lower.includes('phone') || lower.includes('violation') || lower.includes('device')) {
          parsed = { violation: true, reason: "Potential violation detected" };
        }
      }
    }

    return NextResponse.json(parsed);

  } catch (error) {
    console.error("Vision API Error:", error);
    // ✅ On error, don't silently pass — return non-blocking neutral response
    return NextResponse.json({ violation: false, reason: "Check skipped due to error" });
  }
}