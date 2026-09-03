/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import React, { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import PDFDownloadBtn from "@/components/PDFDownloadBtn";
import {
  Home,
  Star,
  TrendingUp,
  AlertCircle,
  CheckCircle2,
  Mic,
  MicOff,
  X,
  Loader2,
} from "lucide-react";

// ─── Types ────────────────────────────────────────────────────────────────────
interface PanelReport {
  overall_score: number;
  verdict: string;
  strengths: string[];
  weaknesses: string[];
  june_feedback: string;
  bryan_feedback: string;
  graham_feedback: string;
  alessandra_feedback: string;
}

interface ReviewButton {
  key: "june" | "bryan" | "graham" | "alessandra";
  label: string;
  subLabel: string;
  icon: string;
  color: string;
  gradFrom: string;
  gradTo: string;
  feedbackKey: keyof PanelReport;
}

const REVIEW_BUTTONS: ReviewButton[] = [
  {
    key: "june",
    label: "Real Talk, June",
    subLabel: "HR Feedback",
    icon: "💼",
    color: "rgba(167,139,250,0.8)",
    gradFrom: "#4c1d95",
    gradTo: "#3b0764",
    feedbackKey: "june_feedback",
  },
  {
    key: "bryan",
    label: "Grill Me, Bryan",
    subLabel: "Tech Review",
    icon: "⚡",
    color: "rgba(96,165,250,0.8)",
    gradFrom: "#1e3a5f",
    gradTo: "#0c1a2e",
    feedbackKey: "bryan_feedback",
  },
  {
    key: "graham",
    label: "Product Sense Check",
    subLabel: "Graham · PM",
    icon: "🎯",
    color: "rgba(52,211,153,0.8)",
    gradFrom: "#064e3b",
    gradTo: "#022c22",
    feedbackKey: "graham_feedback",
  },
  {
    key: "alessandra",
    label: "Be Honest, Alessandra",
    subLabel: "Am I Fit?",
    icon: "👑",
    color: "rgba(251,191,36,0.8)",
    gradFrom: "#78350f",
    gradTo: "#3b1a05",
    feedbackKey: "alessandra_feedback",
  },
];

// ─── Score ring colors ────────────────────────────────────────────────────────
function getScoreColor(score: number) {
  if (score >= 80) return { text: "#10b981", glow: "rgba(16,185,129,0.4)" };
  if (score >= 60) return { text: "#f59e0b", glow: "rgba(245,158,11,0.4)" };
  return { text: "#ef4444", glow: "rgba(239,68,68,0.4)" };
}

// ─── Main Component ────────────────────────────────────────────────────────────
export default function PanelResultPage() {
  const router = useRouter();
  const [report, setReport] = useState<PanelReport | null>(null);
  const [transcript, setTranscript] = useState<any[]>([]);
  const [studentName, setStudentName] = useState("Candidate");
  const [sessionId, setSessionId] = useState<string | null>(null);

  // Review session state
  const [activeReview, setActiveReview] = useState<ReviewButton | null>(null);
  const [reviewLoading, setReviewLoading] = useState(false);
  const [reviewMicActive, setReviewMicActive] = useState(false);
  const [reviewError, setReviewError] = useState<string | null>(null);

  // Review session refs
  const reviewAgoraClientRef = useRef<any>(null);
  const reviewChannelRef = useRef<string>("");
  const reviewAudioTrackRef = useRef<any>(null);
  const reviewAgentIdRef = useRef<string | null>(null); // Agora agent ID for termination
  const activeRemoteAudioRef = useRef<any>(null); // Currently playing agent audio track

  // Load report from localStorage on mount
  useEffect(() => {
    const stored = localStorage.getItem("panel_report");
    if (!stored) {
      router.push("/");
      return;
    }
    try {
      const parsed = JSON.parse(stored);
      setReport(parsed.report);
      setTranscript(parsed.transcript || []);
      setStudentName(parsed.studentName || "Candidate");
      setSessionId(parsed.sessionId || null);
    } catch {
      router.push("/");
    }
  }, [router]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      cleanupReviewSession();
    };
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // ─── Review Session Logic ──────────────────────────────────────────────────
  const cleanupReviewSession = async () => {
    // 1. Stop the remote AI agent audio to silence all voices immediately
    try {
      activeRemoteAudioRef.current?.stop();
      activeRemoteAudioRef.current = null;
    } catch (_) {}

    // 2. Stop local mic
    try {
      reviewAudioTrackRef.current?.stop();
      reviewAudioTrackRef.current?.close();
      reviewAudioTrackRef.current = null;
    } catch (_) {}

    // 3. Unsubscribe all remote users (prevents ghost audio)
    try {
      const client = reviewAgoraClientRef.current;
      if (client) {
        const remoteUsers = client.remoteUsers || [];
        for (const user of remoteUsers) {
          try {
            await client.unsubscribe(user);
          } catch (_) {}
        }
      }
    } catch (_) {}

    // 4. Tell Agora backend to stop the AI agent (uses agentId for precise kill)
    try {
      if (reviewAgentIdRef.current && reviewChannelRef.current) {
        await fetch("/api/agora/leave", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            channelName: reviewChannelRef.current,
            agentId: reviewAgentIdRef.current,
          }),
        });
      }
    } catch (_) {}
    reviewAgentIdRef.current = null;

    // 5. Leave the RTC channel
    try {
      await reviewAgoraClientRef.current?.leave();
      reviewAgoraClientRef.current = null;
    } catch (_) {}

    reviewChannelRef.current = "";
    setReviewMicActive(false);
  };

  const startReview = async (btn: ReviewButton) => {
    if (activeReview) {
      await cleanupReviewSession();
    }

    setActiveReview(btn);
    setReviewLoading(true);
    setReviewError(null);

    try {
      const channelName = `review_${btn.key}_${Date.now()}`;
      reviewChannelRef.current = channelName;
      const uid = Math.floor(Math.random() * 10000) + 100; // Random student UID

      const avatarFeedback = report?.[btn.feedbackKey as keyof PanelReport] as string || "";
      const transcriptText = transcript.map((t) => `[${t.speaker}]: ${t.text}`).join("\n");

      // 1. Kick off agent launch and token generation concurrently!
      const agentPromise = fetch("/api/agora/review-join", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          channelName,
          avatarName: btn.key,
          studentName: studentName,
          transcript: transcriptText,
          feedback: avatarFeedback,
        }),
      }).then(async (res) => {
        const data = await res.json();
        if (data?.data?.agent_id) {
          reviewAgentIdRef.current = data.data.agent_id;
        }
        return data;
      });

      const tokenPromise = fetch("/api/agora/token", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ channelName, uid }),
      }).then((res) => res.json());

      // 2. Load WebRTC client and get student token in parallel
      const [AgoraRTC, tokenData] = await Promise.all([
        import("agora-rtc-sdk-ng").then((m) => m.default),
        tokenPromise,
      ]);

      const token = tokenData?.token;
      const appId = tokenData?.appId || process.env.NEXT_PUBLIC_AGORA_APP_ID || "";
      if (!token) throw new Error("No Agora token");

      AgoraRTC.setLogLevel(4);
      const client = AgoraRTC.createClient({ mode: "rtc", codec: "vp8" });
      reviewAgoraClientRef.current = client;

      client.on("user-joined", (user) => {
        console.log("🔥 [Agora] AI Agent Joined Channel:", user.uid);
      });

      client.on("user-published", async (user, mediaType) => {
        console.log("🔥 [Agora] AI Agent Published Media:", mediaType);
        await client.subscribe(user, mediaType);
        if (mediaType === "audio") {
          // Stop any previously playing agent audio to prevent multiple simultaneous voices
          try {
            activeRemoteAudioRef.current?.stop();
          } catch (_) {}
          activeRemoteAudioRef.current = user.audioTrack;
          user.audioTrack?.setVolume(100);
          user.audioTrack?.play();
          console.log("🔥 [Agora] AI Agent Audio Playing (single track enforced)");
        }
      });

      client.on("user-unpublished", (user, mediaType) => {
        if (mediaType === "audio" && activeRemoteAudioRef.current === user.audioTrack) {
          try { activeRemoteAudioRef.current?.stop(); } catch (_) {}
          activeRemoteAudioRef.current = null;
        }
      });

      // 3. Student joins channel immediately and publishes mic
      await client.join(appId, channelName, token, uid);
      
      const micTrack = await AgoraRTC.createMicrophoneAudioTrack();
      reviewAudioTrackRef.current = micTrack;
      await client.publish([micTrack]);

      setReviewMicActive(true);

      // 4. Ensure backend agent launch was successful
      const agentData = await agentPromise;
      if (agentData?.error) {
        throw new Error(agentData.error);
      }
    } catch (err: any) {
      console.error("Review start error:", err);
      setReviewError(err.message || "Failed to start review session");
    } finally {
      setReviewLoading(false);
    }
  };

  const closeReview = async () => {
    await cleanupReviewSession();
    setActiveReview(null);
    setReviewError(null);
  };

  if (!report) {
    return (
      <div className="min-h-screen bg-[#0a0a0f] flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-amber-400 animate-spin" />
      </div>
    );
  }

  const scoreColor = getScoreColor(report.overall_score);

  return (
    <div className="min-h-screen bg-[#07070a] text-white relative overflow-x-hidden">
      {/* Background */}
      <div className="absolute top-0 right-0 w-1/2 h-1/2 bg-amber-900/5 blur-[150px] rounded-full pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-1/3 h-1/3 bg-indigo-900/10 blur-[120px] rounded-full pointer-events-none" />

      <div className="relative z-10 max-w-5xl mx-auto px-4 py-10">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-400 text-xs font-bold uppercase tracking-wider mb-4">
            <Star className="w-3.5 h-3.5" /> Panel Interview Complete
          </div>
          <h1 className="text-4xl md:text-5xl font-black mb-3">
            Your Report is{" "}
            <span
              style={{
                background: "linear-gradient(135deg, #fbbf24, #f59e0b, #d97706)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
              }}
            >
              Ready, {studentName}
            </span>
          </h1>
          <p className="text-white/50 text-sm mb-6">Here's what the panel thinks about you.</p>

          <div className="flex justify-center">
            <PDFDownloadBtn
              report={{
                overall_score: report.overall_score,
                verdict: report.verdict,
                strengths: report.strengths,
                weaknesses: report.weaknesses,
                feedback: `June (HR): ${report.june_feedback}\n\nBryan (Tech): ${report.bryan_feedback}\n\nGraham (PM): ${report.graham_feedback}\n\nAlessandra (Leadership): ${report.alessandra_feedback}`,
                stats: { totalQuestions: transcript.length / 2, negativeFlags: 0, duration: "10 mins" },
                topics: [
                  { name: "HR & Culture", score: report.overall_score },
                  { name: "Technical Depth", score: report.overall_score },
                  { name: "Product Sense", score: report.overall_score },
                  { name: "Leadership", score: report.overall_score }
                ]
              }}
              transcript={transcript.map(t => ({ sender: t.speaker, text: t.text }))}
              candidateName={studentName}
            />
          </div>
        </motion.div>

        {/* Score + Verdict */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.1 }}
          className="mb-8 rounded-3xl p-8 text-center relative overflow-hidden"
          style={{
            background: "linear-gradient(135deg, #0d0a00, #111)",
            border: "1px solid rgba(251,191,36,0.2)",
            boxShadow: `0 0 60px ${scoreColor.glow}`,
          }}
        >
          <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-amber-500/30 to-transparent" />

          {/* Score circle */}
          <div
            className="w-32 h-32 rounded-full flex items-center justify-center mx-auto mb-4 relative"
            style={{
              background: `conic-gradient(${scoreColor.text} ${report.overall_score * 3.6}deg, rgba(255,255,255,0.05) 0deg)`,
              boxShadow: `0 0 30px ${scoreColor.glow}`,
            }}
          >
            <div className="w-24 h-24 rounded-full bg-[#0d0a00] flex flex-col items-center justify-center">
              <span className="text-3xl font-black" style={{ color: scoreColor.text }}>
                {report.overall_score}
              </span>
              <span className="text-[10px] text-white/40 uppercase tracking-widest">Score</span>
            </div>
          </div>

          <h2 className="text-2xl font-black mb-2" style={{ color: scoreColor.text }}>
            {report.verdict}
          </h2>

          {/* Strengths + Weaknesses */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-8 text-left">
            <div>
              <h3 className="flex items-center gap-2 text-sm font-bold text-emerald-400 mb-3">
                <CheckCircle2 className="w-4 h-4" /> Strengths
              </h3>
              <ul className="space-y-2">
                {report.strengths.map((s, i) => (
                  <li key={i} className="flex items-start gap-2 text-xs text-white/70">
                    <span className="text-emerald-400 mt-0.5">✓</span> {s}
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <h3 className="flex items-center gap-2 text-sm font-bold text-rose-400 mb-3">
                <AlertCircle className="w-4 h-4" /> Areas to Improve
              </h3>
              <ul className="space-y-2">
                {report.weaknesses.map((w, i) => (
                  <li key={i} className="flex items-start gap-2 text-xs text-white/70">
                    <span className="text-rose-400 mt-0.5">→</span> {w}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </motion.div>

        {/* Review Mode Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="mb-8"
        >
          <div className="text-center mb-6">
            <h2 className="text-2xl font-black mb-1">
              <TrendingUp className="w-5 h-5 inline mr-2 text-amber-400" />
              Deep Dive with Your Interviewers
            </h2>
            <p className="text-white/40 text-sm">
              Click any interviewer for a 1-on-1 mentor session. They&apos;ll refer to YOUR specific answers.
            </p>
          </div>

          {/* 2x2 Review Button Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {REVIEW_BUTTONS.map((btn) => {
              const feedback = report[btn.feedbackKey] as string;
              const isActive = activeReview?.key === btn.key;

              return (
                <motion.button
                  key={btn.key}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => (isActive ? closeReview() : startReview(btn))}
                  className="relative rounded-2xl p-6 text-left overflow-hidden transition-all"
                  style={{
                    background: isActive
                      ? `linear-gradient(135deg, ${btn.gradFrom}, ${btn.gradTo})`
                      : "rgba(255,255,255,0.03)",
                    border: isActive
                      ? `1px solid ${btn.color}`
                      : "1px solid rgba(255,255,255,0.08)",
                    boxShadow: isActive ? `0 0 30px ${btn.color}40` : "none",
                  }}
                >
                  <div className="flex items-start gap-3 mb-3">
                    <span className="text-2xl">{btn.icon}</span>
                    <div>
                      <div className="font-black text-base text-white">{btn.label}</div>
                      <div className="text-xs font-semibold" style={{ color: btn.color }}>
                        {btn.subLabel}
                      </div>
                    </div>
                    {isActive && (
                      <div className="ml-auto">
                        <X className="w-4 h-4 text-white/40 hover:text-white" />
                      </div>
                    )}
                  </div>
                  <p className="text-xs text-white/55 leading-relaxed line-clamp-3">{feedback}</p>
                  {!isActive && (
                    <div
                      className="mt-4 text-xs font-bold uppercase tracking-wider"
                      style={{ color: btn.color }}
                    >
                      Talk to {btn.key.charAt(0).toUpperCase() + btn.key.slice(1)} →
                    </div>
                  )}
                </motion.button>
              );
            })}
          </div>
        </motion.div>

        {/* Active Review Session Panel */}
        <AnimatePresence>
          {activeReview && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="mb-8 rounded-3xl overflow-hidden"
              style={{
                border: `1px solid ${activeReview.color}`,
                background: `linear-gradient(135deg, ${activeReview.gradFrom}80, #000)`,
                boxShadow: `0 0 40px ${activeReview.color}30`,
              }}
            >
              <div className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">{activeReview.icon}</span>
                    <div>
                      <h3 className="font-black text-lg">
                        1-on-1 with {activeReview.key.charAt(0).toUpperCase() + activeReview.key.slice(1)}
                      </h3>
                      <p className="text-xs text-white/40">{activeReview.subLabel} · Mentor Mode</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    {reviewMicActive ? (
                      <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-[10px] font-bold">
                        <Mic className="w-3 h-3" /> MIC ON
                      </div>
                    ) : (
                      <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-rose-500/10 border border-rose-500/30 text-rose-400 text-[10px] font-bold">
                        <MicOff className="w-3 h-3" /> MIC OFF
                      </div>
                    )}
                    <button
                      onClick={closeReview}
                      className="px-3 py-1.5 rounded-full bg-white/5 border border-white/10 text-white/50 text-xs hover:bg-white/10 hover:text-white transition-all"
                    >
                      End Session
                    </button>
                  </div>
                </div>

                {reviewLoading ? (
                  <div className="flex flex-col items-center justify-center py-12 gap-3">
                    <Loader2 className="w-8 h-8 animate-spin" style={{ color: activeReview.color }} />
                    <p className="text-sm text-white/50">Connecting to {activeReview.key}...</p>
                  </div>
                ) : reviewError ? (
                  <div className="flex items-center gap-2 p-4 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-sm">
                    <AlertCircle className="w-4 h-4 flex-shrink-0" /> {reviewError}
                  </div>
                ) : (
                  <div className="aspect-video max-h-80 mx-auto rounded-2xl overflow-hidden relative bg-black/60 flex items-center justify-center">
                    {/* Glowing Orb for Voice AI */}
                    <div className="relative flex items-center justify-center">
                      <div className="absolute w-24 h-24 rounded-full bg-white/20 animate-ping" />
                      <div className="absolute w-32 h-32 rounded-full border border-white/10 animate-[spin_4s_linear_infinite]" />
                      <div className="w-20 h-20 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-4xl shadow-[0_0_30px_rgba(99,102,241,0.5)] z-10">
                        {activeReview.icon}
                      </div>
                    </div>
                    {!reviewMicActive && (
                      <div className="absolute inset-0 flex items-center justify-center bg-black/60">
                        <Loader2 className="w-8 h-8 animate-spin text-white/40" />
                      </div>
                    )}
                    {reviewMicActive && (
                      <>
                        <div className="absolute top-3 left-3 flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-black/60 backdrop-blur-md border border-white/10">
                          <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse" />
                          <span className="text-[10px] font-bold uppercase tracking-widest">LIVE</span>
                        </div>
                        <div className="absolute bottom-3 left-3 px-3 py-1.5 rounded-xl bg-black/75 backdrop-blur-md border border-white/10">
                          <div className="text-[10px] text-white/50 uppercase tracking-wider">Interviewer</div>
                          <div className="text-sm font-bold">
                            {activeReview.key.charAt(0).toUpperCase() + activeReview.key.slice(1)} · Mentor Mode
                          </div>
                        </div>
                      </>
                    )}
                  </div>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Home button */}
        <div className="text-center pb-10">
          <button
            onClick={() => {
              cleanupReviewSession();
              localStorage.removeItem("panel_report");
              router.push("/");
            }}
            className="inline-flex items-center gap-2 px-8 py-3 rounded-full bg-white/5 border border-white/10 hover:bg-white/10 text-white/70 hover:text-white font-semibold transition-all text-sm"
          >
            <Home className="w-4 h-4" /> Take me to Home
          </button>
        </div>
      </div>
    </div>
  );
}
