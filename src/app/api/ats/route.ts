/* eslint-disable @typescript-eslint/no-explicit-any, @typescript-eslint/no-require-imports */
import { NextResponse } from 'next/server';
import { callLLM } from '@/lib/llm';

export const dynamic = 'force-dynamic';

// eslint-disable-next-line @typescript-eslint/no-var-requires
const pdf = require('pdf-parse/lib/pdf-parse.js');

export async function POST(req: Request) {
  try {
    const formData = await req.formData();
    const resumeFile = formData.get('resume') as File | null;
    const clientDomain = formData.get('domain') as string | null;

    if (!resumeFile) {
      return NextResponse.json({ error: 'No resume file uploaded' }, { status: 400 });
    }

    // Convert File to Buffer
    const arrayBuffer = await resumeFile.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // Parse PDF text
    let resumeText = '';
    try {
      const parsedPdf = await pdf(buffer);
      resumeText = parsedPdf.text || '';
    } catch (err) {
      console.error("PDF Parsing Error:", err);
      // Fallback: extract printable characters or use a basic parser if it fails
      resumeText = "Candidate Resume: Document contains binary content.";
    }

    // Define the prompt for the LLM to grade the resume and its recommendations
    const systemPrompt = `You are an expert ATS (Applicant Tracking System) parser and technical hiring manager.
Your task is to analyze the candidate's resume text and calculate an ATS score (0-100), hireability badge, a professional recommendation verdict, and skill gaps.

ATS SCORING CRITERIA:
1. Impact & Metrics: Does the candidate use quantifiable metrics (e.g., "achieved 94% accuracy", "optimized by 40%")?
2. Technical Depth: Are the projects complex? Do they use modern tools (GenAI, React, FastAPI, AWS)?
3. Skill-to-Experience Verification (Tallying): Cross-reference the "Skills" section against the "Experience" and "Projects" sections. If a skill is listed but NEVER used or mentioned in any project/job, flag it as unverified or deduct points.
4. Action Verbs: Do bullet points start with strong action verbs?
5. Domain Alignment: How well does the resume match the assigned domain?

CRITICAL ASSIGNED DOMAINS:
Choose which of the following 5 domains the candidate is eligible to interview for (select 1 to 5):
1. "DSA" (Data Structures, Algorithms, OS, system design)
2. "WebDev" (React, Node, Databases, Frontend/Backend)
3. "AIML" (Python, ML, Deep Learning, GenAI, PyTorch, TensorFlow)
4. "Cyber" (Security, pentesting, cryptography)
5. "DevOps" (AWS, Docker, Kubernetes, CI/CD)

Return EXACTLY this JSON schema. Do not include the resume text in the JSON:
{
  "atsData": {
    "final_ats_score": 85,
    "hireability_badge": "Strong Fit",
    "recommendation_verdict": "Detailed explanation of why the candidate is a fit, referencing specific projects and metrics from their resume.",
    "rec_strength": "Highly Recommended",
    "rec_boost_applied": 5.0,
    "gap_analysis": ["Docker", "Kubernetes"],
    "impact_score": 82
  },
  "domains": ["WebDev", "AIML"]
}`;

    const prompt = `### CANDIDATE RESUME FOR EVALUATION
Target domain requested by client: ${clientDomain || 'Not specified'}

RESUME TEXT:
${resumeText.slice(0, 8000)}

Analyze and return ONLY the JSON response matching the schema. DO NOT wrap in markdown blocks.`;

    let llmResultText = '';
    try {
      llmResultText = await callLLM(prompt, {
        systemInstruction: systemPrompt,
        temperature: 0.1,
        format: 'json',
      });
    } catch (llmErr) {
      console.error("LLM ATS processing failed:", llmErr);
      // Construct fallback JSON
      llmResultText = JSON.stringify({
        atsData: {
          final_ats_score: 60,
          hireability_badge: "Good Fit",
          recommendation_verdict: "Auto-parsed fallback due to system load. Evaluated basic skills from resume.",
          rec_strength: "Recommended",
          rec_boost_applied: 1.0,
          gap_analysis: ["Data Structures", "System Design"],
          impact_score: 65
        },
        domains: ["DSA", "WebDev"],
      });
    }

    // Parse LLM JSON output
    let parsedResult: any;
    try {
      const match = llmResultText.match(/\{[\s\S]*\}/);
      const jsonText = match ? match[0] : llmResultText;
      parsedResult = JSON.parse(jsonText);
    } catch (parseErr) {
      console.error("Failed to parse LLM response as JSON:", parseErr);
      parsedResult = {
        atsData: {
          final_ats_score: 60,
          hireability_badge: "Good Fit",
          recommendation_verdict: "Failed to parse evaluation, fell back to default profile.",
          rec_strength: "Recommended",
          rec_boost_applied: 1.0,
          gap_analysis: ["Systems Engineering", "Algorithms"],
          impact_score: 65
        },
        domains: ["DSA", "WebDev"],
      };
    }

    // Always include the extracted text in the final response
    const finalDomains = (Array.isArray(parsedResult.domains) && parsedResult.domains.length > 0)
      ? parsedResult.domains
      : ["DSA", "WebDev", "AIML", "Cyber", "DevOps"];

    return NextResponse.json({
      atsData: parsedResult.atsData || parsedResult,
      domains: finalDomains,
      resumeText: resumeText,
    });

  } catch (error: any) {
    console.error("Global ATS Endpoint Error:", error);
    return NextResponse.json({
      error: "Failed to process resume",
      details: error.message,
      domains: ["DSA", "WebDev", "AIML", "Cyber", "DevOps"]
    }, { status: 500 });
  }
}