-- schema.sql
CREATE TABLE IF NOT EXISTS public.sessions (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    email TEXT NOT NULL,
    domain TEXT NOT NULL,
    level TEXT NOT NULL,
    date TIMESTAMPTZ DEFAULT NOW(),
    avg_tech NUMERIC(3, 2),
    avg_comm NUMERIC(3, 2),
    final_score INTEGER,
    ats_score INTEGER,
    infractions INTEGER DEFAULT 0
);
-- Create an index to quickly look up history by email and domain
CREATE INDEX IF NOT EXISTS idx_sessions_email_domain ON public.sessions(email, domain);

-- ─── Game of Fours: Panel Session Report ──────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.panel_sessions (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    email TEXT,
    student_name TEXT NOT NULL,
    overall_score INTEGER,
    verdict TEXT,
    strengths TEXT[],
    weaknesses TEXT[],
    june_feedback TEXT,
    bryan_feedback TEXT,
    graham_feedback TEXT,
    alessandra_feedback TEXT,
    transcript JSONB,
    created_at TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_panel_sessions_email ON public.panel_sessions(email);

-- ─── Per-utterance transcript (optional granular log) ──────────────────────────
CREATE TABLE IF NOT EXISTS public.interview_transcripts (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    session_id UUID REFERENCES public.panel_sessions(id) ON DELETE CASCADE,
    speaker TEXT NOT NULL,  -- 'June' | 'Bryan' | 'Graham' | 'Alessandra' | 'Student'
    text TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_transcripts_session ON public.interview_transcripts(session_id);

