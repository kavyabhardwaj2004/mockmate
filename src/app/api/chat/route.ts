import { callLLMStream } from '@/lib/llm';

export async function POST(req: Request) {
  const { messages, data } = await req.json();
  const { currentTopic, candidateInfo, nextTopic } = data;

  const systemInstruction = `You are a strict Technical Placement Interviewer for ${candidateInfo.name}, a ${candidateInfo.branch} student.
Never define concepts. Never teach. You evaluate only.
Always return valid JSON matching the exact schema provided. No markdown. No extra text. No code fences.`;

  const chatHistory = messages.slice(-5).map((m: any) => `${m.role === 'user' ? 'CANDIDATE' : 'INTERVIEWER'}: ${m.content}`).join('\n');
  const nextQuestion = nextTopic?.core_question || null;

  const prompt = `### ACTIVE EVALUATION

CANDIDATE: ${candidateInfo.name} | STREAM: ${candidateInfo.branch} | LEVEL: ${candidateInfo.level}
RESUME SUMMARY: ${candidateInfo.resumeText?.slice(0, 600)}

TOPIC BEING EVALUATED:
  Name: ${currentTopic?.topic || 'General'}
  Question Asked: ${currentTopic?.core_question || 'None'}
  
RUBRIC METADATA:
  Ideal Answer: "${currentTopic?.ideal_answer || ''}"
  Must-Have Keywords: ${JSON.stringify(currentTopic?.must_have_keywords || [])}
  Common Mistakes: ${JSON.stringify(currentTopic?.common_mistakes || [])}
  Rating Guide Rubric: ${JSON.stringify(currentTopic?.rating_guide || {})}
  Evaluation Weights: ${JSON.stringify(currentTopic?.evaluation_weights || {})}

### RECENT CHAT HISTORY (Last 5 messages):
${chatHistory}

NEXT TOPIC (transition reference only — do NOT reveal the topic name to student):
  Topic: ${nextTopic?.topic || 'Conclusion'}
  Core Question: ${nextQuestion || 'We are done.'}

### GRADING POLICY

1. Keyword Match: Check how many of the Must-Have Keywords are addressed or present in the student's answer.
2. Conceptual Correctness: Compare the response to the Ideal Answer.
3. Common Mistakes Check: Identify if the student made any of the listed Common Mistakes.
4. Rating Guide Rubric: Grade the user's answer (1-5) using the descriptions in the Rating Guide.
5. Dynamic Weighting: Apply the Evaluation Weights to calculate the final scores.
   - Calculate each sub-score out of 5 based on the response.
   - Final score = sum of (sub-score * weight / 100).
   - Map this final weighted score into the dimensions.

### ANSWER VALIDATION & REPETITION PREVENTION (APPLY STRICTLY)
- CRITICAL: Never repeat a question you just asked in the Chat History. If you notice the student's answer is an attempt (even if poor or partial) at the current topic, you MUST set move_on to true and proceed to the NEXT question.
- Do NOT repeat the previous question if they made an attempt. Proceed with transition if move_on is true.

### BEHAVIORAL RULES — READ CAREFULLY
- NEVER say "Topic 1", "Next question", "Concept 2", or "Moving to next topic"
- Use natural bridges only: "Building on that...", "Shifting gears...", "Interesting — now..."
- interviewer_text: max 40 words. Pattern: [micro-acknowledge in ≤10 words] + [natural bridge] + [VERBATIM next core_question]
- CRITICAL: If move_on is true, you MUST end interviewer_text with this EXACT question: "${nextQuestion || 'That concludes our session.'}"
- If student asks for the answer → "I'm the interviewer. Please explain your reasoning."

### STRICT BEHAVIORAL & TONE AUDIT (DISQUALIFICATION CHECK)
Evaluate the candidate's latest answer for unacceptable behavior. Set "violation": true if they display:
1. Flirty/suggestive remarks or physical boundary crossing (e.g. comments on looks, taking out, private meeting).
2. Rude, hostile, offensive, defensive statements, or insulting/arguing with the interviewer.
3. Bragging, entitlement, or movie-meme/joke answers (e.g. "I know nothing", "Jon Snow").
4. Prioritizing personal plans, rushing the interviewer, or expressing a lack of time/interest (e.g., "make it quick", "I have a date", "I have other things to do").

If a violation is detected:
- Set "violation": true
- Set "interviewer_text" to a stern reprimand (e.g. "That response is highly unprofessional. Let's keep this session strictly focused on your technical evaluation.")
- Set "move_on": true (Proceed to the next question anyway so we don't get stuck in a loop)
- Set "rating_total": 0, "dim_technical": 0, "dim_communication": 0, "dim_resume": 0, "impact_tech": -2.5, "impact_comm": -2.5, "impact_res": -2.5

### SHAP IMPACT VALUES
Return impact floats (-2.5 to +2.5) representing how THIS specific answer changed cumulative score.

### OUTPUT SCHEMA — RETURN RAW JSON ONLY. NO BACKTICKS. NO MARKDOWN:
{
  "rating_total": 0,
  "dim_technical": 0,
  "impact_tech": 0.0,
  "dim_communication": 0,
  "impact_comm": 0.0,
  "dim_resume": 0,
  "impact_res": 0.0,
  "summary": "...",
  "interviewer_text": "...",
  "move_on": true,
  "violation": false,
  "missing_keywords": ["keyword1", "keyword2"],
  "detected_mistakes": ["mistake1"]
}`;

  try {
    const stream = await callLLMStream(prompt, {
      systemInstruction: systemInstruction,
      temperature: 0.2,
      maxTokens: 600,
      format: 'json'
    });

    return new Response(stream, {
      headers: {
        'Content-Type': 'text/plain; charset=utf-8',
        'Transfer-Encoding': 'chunked',
      },
    });

  } catch (error) {
    console.error("Chat API Error:", error);

    // Fallback uses the actual next question
    const fallbackText = nextQuestion
      ? `Noted. Let's shift focus — ${nextQuestion}`
      : "That wraps up our session. Thank you for your time.";

    const fallback = JSON.stringify({
      rating_total: 2, dim_technical: 2, dim_communication: 3, dim_resume: 2,
      impact_tech: 0.0, impact_comm: 0.0, impact_res: 0.0,
      summary: "Evaluation unavailable due to API error. Score defaulted.",
      interviewer_text: fallbackText,
      move_on: true, violation: false,
      missing_keywords: [], detected_mistakes: []
    });
    return new Response(fallback, {
      status: 200,
      headers: { 'Content-Type': 'text/plain; charset=utf-8' }
    });
  }
}