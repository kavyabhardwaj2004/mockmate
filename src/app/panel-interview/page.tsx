/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import React, { useEffect, useRef, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { LiveAvatarSession, SessionEvent, AgentEventsEnum } from "@heygen/liveavatar-web-sdk";
import { motion, AnimatePresence } from "framer-motion";
import { Loader2, Mic, Settings2 } from "lucide-react";

type AvatarKey = "june" | "bryan" | "graham" | "alessandra";

interface AvatarConfig {
  key: AvatarKey;
  name: string;
  role: string;
  emoji: string;
  color: string;
  id: string;
  image: string;
}

const AVATARS: AvatarConfig[] = [
  { key: "june", name: "June", role: "HR Manager", emoji: "💼", color: "#a78bfa", id: "", image: "/june_hr.png" },
  { key: "bryan", name: "Bryan", role: "Tech Lead", emoji: "⚡", color: "#60a5fa", id: "", image: "/bryan_tech_expert.png" },
  { key: "graham", name: "Graham", role: "Product Manager", emoji: "🎯", color: "#34d399", id: "", image: "/graham_product_manager.png" },
  { key: "alessandra", name: "Alessandra", role: "Hiring Manager", emoji: "👑", color: "#fbbf24", id: "", image: "/alessandra_hiring_manager.png" },
];

// Track which avatars have spoken to ensure all 4 get a turn
const ALL_AVATAR_KEYS: AvatarKey[] = ["june", "bryan", "graham", "alessandra"];

export default function PanelInterviewPage() {
  const router = useRouter();

  const [stage, setStage] = useState<"upload" | "loading" | "interview">("upload");
  const [loadingMsg, setLoadingMsg] = useState("");
  const [studentName, setStudentName] = useState("");

  const [transcript, setTranscript] = useState<Array<{ speaker: string; text: string; ts: number }>>([]);
  const [questionCount, setQuestionCount] = useState(0);
  const [activeAvatar, setActiveAvatar] = useState<AvatarKey | null>(null);
  const [heyGenError, setHeyGenError] = useState<string | null>(null);
  const [isSpeaking, setIsSpeaking] = useState<boolean>(false);
  const [readyAvatars, setReadyAvatars] = useState<Record<AvatarKey, boolean>>({
    june: false, bryan: false, graham: false, alessandra: false
  });

  const avatarSessionRef = useRef<LiveAvatarSession | null>(null);
  const currentSessionTokenRef = useRef<string | null>(null); // Track token for server-side stop

  // ─── Cleanup ───────────────────────────────────────────────────────────────
  const cleanup = useCallback(async () => {
    // Stop the HeyGen session server-side (using our backend proxy)
    // This avoids calling SDK stop() which causes unhandled rejections
    const token = currentSessionTokenRef.current;
    currentSessionTokenRef.current = null;
    avatarSessionRef.current = null;
    if (token) {
      fetch("/api/heygen/stop", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sessionToken: token }),
      }).catch(() => {}); // fire-and-forget, non-fatal
    }
  }, []);

  useEffect(() => {
    return () => { cleanup(); };
  }, [cleanup]);


  const avatarVideoRefs = useRef<Record<string, HTMLDivElement | HTMLVideoElement | null>>({
    june: null, bryan: null, graham: null, alessandra: null, you: null
  });
  const localVideoRef = useRef<HTMLVideoElement>(null);
  const recognitionRef = useRef<any>(null);
  const questionCountRef = useRef(questionCount);
  const transcriptRef = useRef(transcript);
  const activeAvatarRef = useRef(activeAvatar);
  const interviewStartedRef = useRef(false);
  const isProcessingRef = useRef(false);
  const spokenAvatarsRef = useRef<Set<AvatarKey>>(new Set(["june"])); // June speaks first always
  const accumulatedTextRef = useRef("");
  const accumulatedPrefixRef = useRef("");
  const silenceTimerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => { transcriptRef.current = transcript; }, [transcript]);
  useEffect(() => { activeAvatarRef.current = activeAvatar; }, [activeAvatar]);
  useEffect(() => { questionCountRef.current = questionCount; }, [questionCount]);

  // ─── Suppress HeyGen unhandled rejections (do NOT use fetch monkey-patch) ──
  useEffect(() => {
    const handler = (event: PromiseRejectionEvent) => {
      const msg = event?.reason?.message || String(event?.reason || "");
      if (
        msg.includes("Session not found") ||
        msg.includes("API request failed") ||
        msg.includes("not found") ||
        msg.includes("liveavatar")
      ) {
        console.warn("[HeyGen SDK] Suppressed unhandled rejection:", msg);
        event.preventDefault();
        event.stopImmediatePropagation();
      }
    };
    window.addEventListener("unhandledrejection", handler, true);
    return () => window.removeEventListener("unhandledrejection", handler, true);
  }, []);

  // ─── Local webcam preview ──────────────────────────────────────────────────
  useEffect(() => {
    if (stage === "interview") {
      let stream: MediaStream | null = null;
      navigator.mediaDevices.getUserMedia({ video: true, audio: false })
        .then((s) => {
          stream = s;
          if (localVideoRef.current) {
            localVideoRef.current.srcObject = s;
            localVideoRef.current.play().catch(() => {});
          }
        })
        .catch((e) => console.warn("Local camera preview error:", e));
      return () => {
        if (stream) stream.getTracks().forEach(t => t.stop());
      };
    }
  }, [stage]);


  const isEndedRef = useRef(false);

  // ─── Speech Recognition ────────────────────────────────────────────────────
  useEffect(() => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) return;

    const rec = new SpeechRecognition();
    rec.continuous = true;
    rec.interimResults = true;
    rec.lang = "en-US";

    rec.onresult = (event: any) => {
      if (isProcessingRef.current || isEndedRef.current) return;

      let sessionTranscript = "";
      for (let i = 0; i < event.results.length; ++i) {
        sessionTranscript += event.results[i][0].transcript + " ";
      }

      const fullText = (accumulatedPrefixRef.current + sessionTranscript).trim();
      if (!fullText) return;

      accumulatedTextRef.current = fullText;

      // Reset the silence timer on every new word spoken
      if (silenceTimerRef.current) {
        clearTimeout(silenceTimerRef.current);
      }

      // Allow 5 full seconds of silence to think before submitting the answer
      silenceTimerRef.current = setTimeout(async () => {
        const textToSubmit = accumulatedTextRef.current.trim();
        if (!textToSubmit || isProcessingRef.current || isEndedRef.current) return;

        isProcessingRef.current = true;
        accumulatedTextRef.current = "";
        accumulatedPrefixRef.current = "";

        try { rec.abort(); } catch (_) {}

        setTranscript(prev => [...prev, { speaker: "YOU", text: textToSubmit, ts: Date.now() }]);

        try {
          const res = await fetch("/api/panel/next-question", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              studentName,
              userMessage: textToSubmit,
              transcript: transcriptRef.current,
              questionCount: questionCountRef.current,
              spokenAvatars: Array.from(spokenAvatarsRef.current),
            }),
          });
          if (isEndedRef.current) return; // abort if ended during fetch
          const { speaker, question } = await res.json();
          const avatarKey = (speaker?.toLowerCase() as AvatarKey) || "june";

          setTranscript(prev => [...prev, { speaker, text: question, ts: Date.now() }]);
          setQuestionCount(c => {
            const next = c + 1;
            if (next >= 8) setTimeout(handleInterviewComplete, 8000);
            return next;
          });
          spokenAvatarsRef.current.add(avatarKey);
          await switchAndSpeak(avatarKey, question);
        } catch (err) {
          console.error("Follow-up failed:", err);
          if (!isEndedRef.current) {
            isProcessingRef.current = false;
            setActiveAvatar(null);
          }
        }
      }, 5000); // 5 seconds listening buffer for pauses
    };

    rec.onend = () => {
      // If recognition stopped while still candidate's turn (e.g. browser audio stream cycle),
      // preserve current text as prefix and restart recognition seamlessly
      if (activeAvatarRef.current === null && !isProcessingRef.current && !isEndedRef.current) {
        if (accumulatedTextRef.current) {
          accumulatedPrefixRef.current = accumulatedTextRef.current + " ";
        }
        try { rec.start(); } catch (_) {}
      }
    };

    recognitionRef.current = rec;

    return () => {
      if (silenceTimerRef.current) clearTimeout(silenceTimerRef.current);
      try { recognitionRef.current?.abort(); } catch (_) {}
    };
  }, [stage, studentName]); // eslint-disable-line react-hooks/exhaustive-deps

  // Start / stop mic based on whose turn it is
  useEffect(() => {
    if (activeAvatar === null && stage === "interview") {
      try { recognitionRef.current?.start(); } catch (_) {}
    } else {
      if (silenceTimerRef.current) clearTimeout(silenceTimerRef.current);
      accumulatedTextRef.current = "";
      accumulatedPrefixRef.current = "";
      try { recognitionRef.current?.abort(); } catch (_) {}
    }
  }, [activeAvatar, stage]);

  // ─── File Upload ───────────────────────────────────────────────────────────
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setStage("loading");
    setLoadingMsg("Parsing resume & analyzing skills...");
    try {
      const formData = new FormData();
      formData.append("file", file);
      const res = await fetch("/api/ats", { method: "POST", body: formData });
      const data = await res.json();
      const finalName = studentName.trim() || data.atsData?.candidate_name || "Candidate";
      startInterview(finalName, data.resumeText || "");
    } catch (err) {
      console.error(err);
      setLoadingMsg("Failed to parse resume. Proceeding anyway...");
      setTimeout(() => startInterview(studentName || "Candidate", ""), 2000);
    }
  };

  // ─── Start Interview (Agora for channel only, NOT for AI agent) ───────────
  const startInterview = async (name: string, resumeTextRaw: string) => {
    try {
      setLoadingMsg("Connecting to Interview Panel...");

      // We only need Agora for the student's mic publishing (for future use).
      // We are NOT starting the Agora AI agent. HeyGen handles all avatar speech.
      setStage("interview");
      // Store name in state (startInterview is called with correct name)
      setStudentName(name);
    } catch (err) {
      console.error(err);
      alert("Failed to start. Please check console.");
    }
  };

  // ─── Kick Off Q1 ──────────────────────────────────────────────────────────
  useEffect(() => {
    if (stage === "interview" && !interviewStartedRef.current && studentName) {
      interviewStartedRef.current = true;
      const startQ = async () => {
        isProcessingRef.current = true;
        const text = `Welcome ${studentName}! I'm June, your HR lead today. Let's kick things off — walk me through your background and what excites you most about this role.`;
        setTranscript(prev => [...prev, { speaker: "June", text, ts: Date.now() }]);
        setQuestionCount(1);
        await switchAndSpeak("june", text);
      };
      startQ();
    }
  }, [stage, studentName]); // eslint-disable-line react-hooks/exhaustive-deps

  // ─── Core: Avatar speaks via HeyGen (primary) + SpeechSynthesis (fallback) ──
  const switchAndSpeak = async (avatarKey: AvatarKey, text: string) => {
    if (isEndedRef.current) return;
    setActiveAvatar(avatarKey);
    setIsSpeaking(true);
    setHeyGenError(null);
    setReadyAvatars(prev => ({ ...prev, [avatarKey]: false }));

    // ── Step 1: Stop any previous session SERVER-SIDE before requesting a new token
    // This is critical — HeyGen returns 404 if a new session is started while the old one is alive
    const prevToken = currentSessionTokenRef.current;
    currentSessionTokenRef.current = null;
    avatarSessionRef.current = null;
    if (prevToken) {
      try {
        await fetch("/api/heygen/stop", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ sessionToken: prevToken }),
        });
      } catch (_) {}
      // Small delay to ensure HeyGen server registers the stop
      await new Promise(r => setTimeout(r, 500));
    }

    // ── Step 2: Try HeyGen live avatar ────────────────────────────────────────
    let heyGenSucceeded = false;
    try {
      // 2a. Get a fresh token
      const tokenRes = await fetch("/api/heygen/token", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ avatarKey }),
      });
      const { token } = await tokenRes.json();
      if (!token) throw new Error("No token returned");

      // Store token immediately so cleanup can stop it server-side if needed
      currentSessionTokenRef.current = token;

      // 2b. Create session object
      const session = new LiveAvatarSession(token);
      avatarSessionRef.current = session;

      // 2c. Register STREAM_READY listener BEFORE calling start() — never miss the event
      let streamTimeout: NodeJS.Timeout;
      const streamReadyPromise = new Promise<void>((resolve, reject) => {
        streamTimeout = setTimeout(() => reject(new Error("Stream ready timeout")), 35000);
        session.on(SessionEvent.SESSION_STREAM_READY, () => {
          clearTimeout(streamTimeout);
          console.log("[HeyGen] Stream ready for", avatarKey);
          // Show live video, hide placeholder
          setReadyAvatars(prev => ({ ...prev, [avatarKey]: true }));
          const vid = avatarVideoRefs.current[avatarKey] as HTMLVideoElement | null;
          if (vid) {
            try { session.attach(vid); vid.play().catch(() => {}); } catch (_) {}
          }
          resolve();
        });
      });

      // 2d. Start session (connects to HeyGen LiveKit room)
      try {
        await session.start();
      } catch (startErr) {
        clearTimeout(streamTimeout!);
        throw startErr;
      }

      // 2e. Wait for stream to be ready (video + audio tracks available)
      await streamReadyPromise;

      // 2f. Wait a short moment for the stream to stabilize before speaking
      await new Promise(r => setTimeout(r, 300));

      // 2g. Send text to speak
      session.repeat(text);
      console.log("[HeyGen] repeat() sent for", avatarKey, "—", text.slice(0, 40));

      // 2h. Wait for speech to finish.
      // Use AVATAR_SPEAK_ENDED if it fires, else fall back to time-based estimate
      await new Promise<void>((resolve) => {
        let done = false;
        const finish = () => { if (!done) { done = true; resolve(); } };

        session.on(AgentEventsEnum.AVATAR_SPEAK_ENDED, () => {
          console.log("[HeyGen] AVATAR_SPEAK_ENDED received");
          setTimeout(finish, 500); // small buffer after speech ends
        });

        // Safety: estimate reading time (avg 130 wpm, plus 3s buffer)
        const wordCount = text.trim().split(/\s+/).length;
        const estimatedMs = Math.max(5000, (wordCount / 130) * 60000 + 3000);
        setTimeout(finish, estimatedMs);
      });

      heyGenSucceeded = true;

    } catch (err: any) {
      const msg = err?.message || String(err);
      console.warn("[HeyGen] Failed:", msg);
      setHeyGenError(msg);
      heyGenSucceeded = false;
    }

    // ── Step 3: SpeechSynthesis fallback if HeyGen failed ────────────────────
    if (!heyGenSucceeded) {
      console.log("[TTS Fallback] Using browser speech for:", avatarKey);
      // Reset video state since HeyGen failed
      setReadyAvatars(prev => ({ ...prev, [avatarKey]: false }));
      await new Promise<void>((resolve) => {
        if (!window.speechSynthesis) { resolve(); return; }
        window.speechSynthesis.cancel();
        const utt = new SpeechSynthesisUtterance(text);
        utt.rate = 0.92;
        utt.pitch = avatarKey === "june" || avatarKey === "alessandra" ? 1.1 : 0.9;
        utt.volume = 1.0;
        const voices = window.speechSynthesis.getVoices();
        const voicePrefs: Record<AvatarKey, string[]> = {
          june:       ["Samantha", "Google US English", "Microsoft Zira", "en-US"],
          bryan:      ["Daniel",   "Google UK English Male", "Microsoft David", "en-GB"],
          graham:     ["Alex",     "Google UK English Male", "Microsoft Mark", "en-AU"],
          alessandra: ["Victoria", "Google US English Female", "Microsoft Hazel", "en-IN"],
        };
        const pick = voices.find(v =>
          (voicePrefs[avatarKey] || []).some(p => v.name.includes(p) || v.lang.startsWith(p))
        );
        if (pick) utt.voice = pick;
        utt.onend = () => resolve();
        utt.onerror = () => resolve();
        window.speechSynthesis.speak(utt);
      });
    }

    // ── Step 4: Stop session server-side and hand mic back to student ─────────
    await cleanup(); // fires /api/heygen/stop in background and nulls refs
    setReadyAvatars(prev => ({ ...prev, [avatarKey]: false }));
    setIsSpeaking(false);
    setActiveAvatar(null);
    isProcessingRef.current = false;
  };




  // ─── End Interview ─────────────────────────────────────────────────────────────
  const handleInterviewComplete = async () => {
    if (isEndedRef.current) return;
    isEndedRef.current = true;
    isProcessingRef.current = true;
    try { recognitionRef.current?.abort(); } catch (_) {}
    
    setLoadingMsg("Generating Panel Report...");
    setStage("loading");
    await cleanup();

    try {
      const res = await fetch("/api/panel/report", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          studentName,
          email: "student@example.com",
          transcript: transcriptRef.current,
        }),
      });

      if (!res.ok) throw new Error(`Report API failed with status ${res.status}`);
      const result = await res.json();
      if (result.error) throw new Error(result.error);

      localStorage.setItem("panel_report", JSON.stringify({
        report: result.report,
        sessionId: result.sessionId,
        transcript: transcriptRef.current,
        studentName,
      }));
      router.push("/panel-result");
    } catch (err) {
      console.error("Report generation failed:", err);
      setStage("interview");
      alert("Failed to generate report. Please try ending the interview again or check your connection.");
    }
  };

  // ─── RENDER: Upload ────────────────────────────────────────────────────────
  if (stage === "upload") {
    return (
      <div className="min-h-screen bg-[#050505] text-white flex items-center justify-center p-4 relative overflow-hidden">
        <div className="absolute top-[10%] left-[20%] w-[60%] h-[60%] bg-amber-600/10 blur-[150px] rounded-full pointer-events-none" />
        <div className="absolute bottom-[-10%] right-[10%] w-[40%] h-[40%] bg-yellow-900/20 blur-[120px] rounded-full pointer-events-none" />

        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="w-full max-w-lg rounded-[2rem] p-8 relative z-10 overflow-hidden"
          style={{
            background: "linear-gradient(145deg, #161000 0%, #050505 100%)",
            border: "1px solid rgba(251, 191, 36, 0.3)",
            boxShadow: "0 0 80px rgba(251, 191, 36, 0.15), inset 0 0 30px rgba(251, 191, 36, 0.05)"
          }}
        >
          <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-amber-400/50 to-transparent" />

          <div className="text-center mb-8 relative">
            <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-amber-500/10 border border-amber-400/30 mb-5 shadow-[0_0_30px_rgba(251,191,36,0.3)] relative">
              <motion.div animate={{ rotate: 360 }} transition={{ duration: 10, repeat: Infinity, ease: "linear" }} className="absolute inset-[-1px] rounded-full border border-dashed border-amber-500/50" />
              <span className="text-4xl drop-shadow-lg">👑</span>
            </div>
            <h1 className="text-4xl font-black mb-3 tracking-tight bg-gradient-to-r from-amber-100 via-amber-400 to-amber-600 bg-clip-text text-transparent drop-shadow-sm">
              Game of Fours
            </h1>
            <p className="text-amber-100/60 text-sm font-medium">Enter your name and upload your resume to face the elite panel.</p>
          </div>

          <div className="space-y-6 relative z-10">
            <div>
              <label className="block text-[10px] font-black uppercase tracking-widest text-amber-500 mb-2 pl-1">
                Candidate Name
              </label>
              <input
                type="text"
                value={studentName}
                onChange={(e) => setStudentName(e.target.value)}
                placeholder="Enter your full name"
                className="w-full bg-black/60 border border-amber-500/20 rounded-2xl px-5 py-4 text-white placeholder:text-white/20 focus:outline-none focus:border-amber-400 focus:ring-1 focus:ring-amber-400/50 transition-all shadow-inner"
              />
            </div>

            <div className={!studentName.trim() ? "opacity-40 pointer-events-none grayscale transition-all duration-500" : "transition-all duration-500"}>
              <label className="block text-[10px] font-black uppercase tracking-widest text-amber-500 mb-2 pl-1">
                Resume (PDF/DOCX)
              </label>
              <div className="relative group cursor-pointer border-2 border-dashed border-amber-500/30 rounded-2xl p-10 text-center hover:border-amber-400 hover:bg-amber-500/5 transition-all duration-300 bg-black/40 overflow-hidden">
                <input
                  type="file"
                  accept=".pdf,.doc,.docx"
                  onChange={handleFileUpload}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                  disabled={!studentName.trim()}
                />
                <div className="absolute inset-0 bg-gradient-to-b from-amber-500/0 to-amber-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />
                <div className="text-4xl mb-4 transform group-hover:-translate-y-2 group-hover:scale-110 transition-all duration-300 drop-shadow-lg">📄</div>
                <div className="font-bold mb-2 text-sm text-amber-100/80 group-hover:text-amber-400 transition-colors">
                  {studentName.trim() ? "Click or Drag to Upload" : "Enter name first"}
                </div>
                <div className="text-xs text-amber-500/40 font-semibold tracking-wide">Auto-starts upon selection</div>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    );
  }

  if (stage === "loading") {
    return (
      <div className="min-h-screen bg-[#07070a] text-white flex flex-col items-center justify-center p-4">
        <video src="/cbotloading.mp4" autoPlay loop muted playsInline className="w-32 h-32 object-cover rounded-full mix-blend-screen opacity-80 mb-8" />
        <div className="font-bold text-lg mb-2 text-amber-400">{loadingMsg}</div>
        <div className="text-white/40 text-sm">Please wait while we initialize...</div>
      </div>
    );
  }

  // ─── RENDER: Interview ─────────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-[#050508] text-white flex overflow-hidden">
      {/* LEFT: 2x2 Panel Grid */}
      <div className="flex-1 flex flex-col p-4 gap-4 h-screen relative">
        {/* Header */}
        <div className="flex items-center justify-between px-2">
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 bg-red-500/10 border border-red-500/20 text-red-400 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest">
              <div className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse" /> LIVE PANEL
            </div>
            <span className="font-black tracking-widest text-amber-500 text-sm uppercase">Game of Fours</span>
          </div>
          <div className="flex items-center gap-4 text-xs font-bold text-white/40 uppercase tracking-widest">
            <span>Q{questionCount}/8</span>
            <div className="flex items-center gap-1.5 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 px-3 py-1 rounded-full">
              <Mic className="w-3 h-3" /> MIC ON
            </div>
          </div>
        </div>

        {/* 2x2 Grid */}
        <div className="flex-1 grid grid-cols-2 grid-rows-2 gap-4">
          {AVATARS.map((av) => {
            const isActive = activeAvatar === av.key;
            const isReady = readyAvatars[av.key];
            const showVideo = isActive && isReady;

            return (
              <div
                key={av.key}
                className="relative rounded-2xl overflow-hidden transition-all duration-500"
                style={{
                  background: `linear-gradient(135deg, ${av.color}20, #000)`,
                  border: isActive ? `1px solid ${av.color}80` : `1px solid ${av.color}20`,
                  boxShadow: isActive ? `0 0 30px ${av.color}20` : "none",
                }}
              >
                {/* Static Image Placeholder (Always under the video) */}
                <div className={`absolute inset-0 flex flex-col items-center justify-center z-10 overflow-hidden transition-opacity duration-700 ${showVideo ? 'opacity-0' : 'opacity-100'}`}>
                  <img src={av.image} alt={av.name} className="absolute inset-0 w-full h-full object-cover" />

                  <div className="relative z-20 flex flex-col items-center bg-black/70 px-5 py-3 rounded-2xl backdrop-blur-md mt-24 border border-white/10 shadow-2xl">
                    <div className="flex items-end gap-1.5 h-8 mb-2">
                      {[1, 2, 3, 4, 5].map((bar) => (
                        <motion.div
                          key={bar}
                          className="w-1.5 rounded-t-sm"
                          style={{ background: av.color }}
                          animate={{
                            height: isActive ? ["40%", "100%", "60%", "90%", "30%"] : ["20%", "40%", "15%", "50%", "25%"]
                          }}
                          transition={{
                            duration: isActive ? 0.4 : (0.8 + bar * 0.1),
                            repeat: Infinity,
                            repeatType: "mirror",
                            ease: "easeInOut"
                          }}
                        />
                      ))}
                    </div>
                    <div className="text-[10px] font-black uppercase tracking-widest mt-1" style={{ color: av.color }}>
                      {isActive ? (heyGenError ? "TTS Fallback" : "Thinking...") : "Listening..."}
                    </div>
                    {isActive && heyGenError && (
                      <div className="text-[8px] text-red-400 mt-1 max-w-[120px] text-center leading-tight truncate">
                        {heyGenError}
                      </div>
                    )}
                  </div>
                </div>

                {/* HeyGen live video element — High z-index when active */}
                <video
                  ref={(el) => { avatarVideoRefs.current[av.key] = el; }}
                  autoPlay
                  playsInline
                  muted={false} // Needs to be unmuted to hear HeyGen, but user interacted already
                  className={`w-full h-full object-cover transition-opacity duration-700 absolute inset-0 ${showVideo ? "opacity-100 z-20" : "opacity-0 z-0 pointer-events-none"}`}
                />

                {/* Name Tag */}
                <div className="absolute bottom-4 left-4 flex items-center gap-2 bg-black/60 backdrop-blur-md border border-white/10 px-3 py-1.5 rounded-xl z-30">
                  <span className="font-bold text-sm">{av.name}</span>
                  <span className="text-[10px] text-white/50">{av.role}</span>
                </div>
              </div>
            );
          })}
        </div>

        {/* Student Cam Overlay */}
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 w-48 h-32 bg-black/80 rounded-2xl border border-white/10 overflow-hidden z-30 shadow-2xl backdrop-blur-md">
          <video
            ref={localVideoRef}
            autoPlay
            muted
            playsInline
            className="w-full h-full object-cover transform -scale-x-100"
          />
          <div className="absolute bottom-2 left-2 flex items-center gap-1.5 bg-black/60 px-2 py-0.5 rounded text-[10px] font-bold z-10">
            <div className={`w-1.5 h-1.5 rounded-full ${activeAvatar === null ? "bg-emerald-500 animate-pulse" : "bg-red-500"}`} /> YOU
          </div>
        </div>
      </div>

      {/* RIGHT: Transcript Panel */}
      <div className="w-80 bg-[#0a0a0f] border-l border-white/5 flex flex-col h-screen">
        <div className="p-6 text-center border-b border-white/5 relative">
          <div className="absolute top-0 right-0 p-4">
            <button className="text-white/20 hover:text-white transition-colors">
              <Settings2 className="w-4 h-4" />
            </button>
          </div>

          <div className="text-[10px] font-bold uppercase tracking-widest text-white/40 mb-6 mt-4">
            {activeAvatar === null ? "YOUR TURN" : "PANEL SPEAKING"}
          </div>

          <div className="relative w-32 h-32 mx-auto mb-6 flex items-center justify-center">
            {activeAvatar === null ? (
              <>
                <motion.div animate={{ scale: [1, 1.2, 1], opacity: [0.3, 0.6, 0.3] }} transition={{ duration: 3, repeat: Infinity }} className="absolute inset-0 bg-emerald-500/20 rounded-full blur-2xl" />
                <div className="w-24 h-24 rounded-full bg-gradient-to-tr from-emerald-900 to-zinc-800 shadow-[inset_0_-10px_20px_rgba(0,0,0,0.5)] border border-emerald-500/30 flex flex-col items-center justify-center">
                  <Mic className="w-6 h-6 text-emerald-400 mb-1 animate-pulse" />
                </div>
              </>
            ) : (
              <>
                <motion.div animate={{ scale: isSpeaking ? [1, 1.3, 1] : 1, opacity: isSpeaking ? [0.4, 0.8, 0.4] : 0.2 }} transition={{ duration: 1.5, repeat: Infinity }} className="absolute inset-0 rounded-full blur-2xl" style={{ backgroundColor: AVATARS.find(a => a.key === activeAvatar)?.color }} />
                <div className="w-24 h-24 rounded-full bg-gradient-to-tr from-zinc-900 to-zinc-800 shadow-[inset_0_-10px_20px_rgba(0,0,0,0.5)] border border-white/20 overflow-hidden">
                  <img
                    src={AVATARS.find(a => a.key === activeAvatar)?.image}
                    alt={activeAvatar}
                    className="w-full h-full object-cover"
                  />
                </div>
              </>
            )}
          </div>

          <div className="flex justify-center gap-1.5">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className={`w-1.5 h-1.5 rounded-full transition-colors ${i < questionCount ? "bg-amber-500" : "bg-white/10"}`} />
            ))}
          </div>
          <div className="text-[10px] text-white/30 mt-2">({questionCount} questions)</div>
        </div>

        <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-3">
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-white/40 mb-2">
            <Loader2 className="w-3 h-3 animate-spin" /> Live Transcript
          </div>

          {transcript.length === 0 ? (
            <div className="flex-1 flex flex-col items-center justify-center text-white/20">
              <Mic className="w-8 h-8 mb-2 opacity-20" />
              <p className="text-xs">Waiting for interview to begin...</p>
            </div>
          ) : (
            transcript.map((t, idx) => {
              const av = AVATARS.find(a => a.name === t.speaker);
              const color = av?.color || "#fff";
              return (
                <div key={idx} className="bg-white/5 rounded-xl p-3 border border-white/5">
                  <div className="text-[10px] font-bold uppercase tracking-widest mb-1" style={{ color }}>{t.speaker}</div>
                  <div className="text-sm text-white/80 leading-relaxed">{t.text}</div>
                </div>
              );
            })
          )}
        </div>

        <div className="p-4 border-t border-white/5">
          <button onClick={handleInterviewComplete} className="w-full py-3 rounded-xl border border-red-500/30 text-red-400 font-semibold text-sm hover:bg-red-500/10 transition-colors">
            End Interview Early
          </button>
        </div>
      </div>
    </div>
  );
}
