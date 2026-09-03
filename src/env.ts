import { z } from "zod";

const isServer = typeof window === "undefined";

const clientEnvSchema = z.object({
  NEXT_PUBLIC_SUPABASE_URL: z.string().url("Must be a valid Supabase URL"),
  NEXT_PUBLIC_SUPABASE_ANON_KEY: z.string().min(1, "Supabase Anon Key is required"),
  NEXT_PUBLIC_AGORA_APP_ID: z.string().min(1, "Agora App ID (public) is required"),
});

const serverEnvSchema = z.object({
  GEMINI_API_KEY: z.string().min(1, "Gemini API Key is required"),
  GROQ_API_KEY: z.string().optional(),
  HEYGEN_API_KEY_HR: z.string().min(1, "HeyGen HR API Key is required"),
  HEYGEN_API_KEY_PANEL: z.string().min(1, "HeyGen Panel API Key is required"),
  OPENAI_API_KEY: z.string().optional(),
  // HeyGen Avatar IDs
  HEYGEN_AVATAR_JUNE_ID: z.string().min(1, "HeyGen June Avatar ID is required"),
  HEYGEN_AVATAR_BRYAN_ID: z.string().min(1, "HeyGen Bryan Avatar ID is required"),
  HEYGEN_AVATAR_GRAHAM_ID: z.string().min(1, "HeyGen Graham Avatar ID is required"),
  HEYGEN_AVATAR_ALESSANDRA_ID: z.string().min(1, "HeyGen Alessandra Avatar ID is required"),
  // Agora Credentials
  AGORA_APP_ID: z.string().min(1, "Agora App ID is required"),
  AGORA_APP_CERTIFICATE: z.string().min(1, "Agora App Certificate is required"),
  AGORA_CUSTOMER_ID: z.string().min(1, "Agora Customer ID is required"),
  AGORA_CUSTOMER_SECRET: z.string().min(1, "Agora Customer Secret is required"),
  AGORA_AGENT_ID: z.string().min(1, "Agora Agent ID (Interview pipeline) is required"),
  AGORA_REVIEW_PIPELINE_ID: z.string().min(1, "Agora Review Pipeline ID is required"),
});

const clientEnv = {
  NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL,
  NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
  NEXT_PUBLIC_AGORA_APP_ID: process.env.NEXT_PUBLIC_AGORA_APP_ID,
};

const _clientEnv = clientEnvSchema.safeParse(clientEnv);

if (!_clientEnv.success) {
  console.error("❌ Invalid Client environment variables:");
  _clientEnv.error.issues.forEach((issue) => {
    console.error(`  - ${issue.path.join(".")}: ${issue.message}`);
  });
  throw new Error("Invalid Client environment variables");
}

let serverEnv = {};
if (isServer) {
  const _serverEnv = serverEnvSchema.safeParse({
    GEMINI_API_KEY: process.env.GEMINI_API_KEY,
    GROQ_API_KEY: process.env.GROQ_API_KEY,
    HEYGEN_API_KEY_HR: process.env.HEYGEN_API_KEY_HR,
    HEYGEN_API_KEY_PANEL: process.env.HEYGEN_API_KEY_PANEL,
    OPENAI_API_KEY: process.env.OPENAI_API_KEY,
    HEYGEN_AVATAR_JUNE_ID: process.env.HEYGEN_AVATAR_JUNE_ID,
    HEYGEN_AVATAR_BRYAN_ID: process.env.HEYGEN_AVATAR_BRYAN_ID,
    HEYGEN_AVATAR_GRAHAM_ID: process.env.HEYGEN_AVATAR_GRAHAM_ID,
    HEYGEN_AVATAR_ALESSANDRA_ID: process.env.HEYGEN_AVATAR_ALESSANDRA_ID,
    AGORA_APP_ID: process.env.AGORA_APP_ID,
    AGORA_APP_CERTIFICATE: process.env.AGORA_APP_CERTIFICATE,
    AGORA_CUSTOMER_ID: process.env.AGORA_CUSTOMER_ID,
    AGORA_CUSTOMER_SECRET: process.env.AGORA_CUSTOMER_SECRET,
    AGORA_AGENT_ID: process.env.AGORA_AGENT_ID,
    AGORA_REVIEW_PIPELINE_ID: process.env.AGORA_REVIEW_PIPELINE_ID,
  });
  if (!_serverEnv.success) {
    console.error("❌ Invalid Server environment variables:");
    _serverEnv.error.issues.forEach((issue) => {
      console.error(`  - ${issue.path.join(".")}: ${issue.message}`);
    });
    throw new Error("Invalid Server environment variables");
  }
  serverEnv = _serverEnv.data;
}

export const env = {
  ..._clientEnv.data,
  ...serverEnv,
} as Record<
  | "NEXT_PUBLIC_SUPABASE_URL"
  | "NEXT_PUBLIC_SUPABASE_ANON_KEY"
  | "NEXT_PUBLIC_AGORA_APP_ID"
  | "GEMINI_API_KEY"
  | "GROQ_API_KEY"
  | "HEYGEN_API_KEY_HR"
  | "HEYGEN_API_KEY_PANEL"
  | "OPENAI_API_KEY"
  | "HEYGEN_AVATAR_JUNE_ID"
  | "HEYGEN_AVATAR_BRYAN_ID"
  | "HEYGEN_AVATAR_GRAHAM_ID"
  | "HEYGEN_AVATAR_ALESSANDRA_ID"
  | "AGORA_APP_ID"
  | "AGORA_APP_CERTIFICATE"
  | "AGORA_CUSTOMER_ID"
  | "AGORA_CUSTOMER_SECRET"
  | "AGORA_AGENT_ID"
  | "AGORA_REVIEW_PIPELINE_ID",
  string
>;
