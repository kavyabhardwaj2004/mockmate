"use client";

import React, { useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowRight, Cpu, ShieldCheck, Sparkles, TrendingUp, UserCheck, AlertCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useGuideBot } from '@/components/GuideBotContext';

export default function LandingPage() {
  const router = useRouter();
  const { showMessage, clearMessage, setShowChecklist } = useGuideBot();
  const [isLoading, setIsLoading] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [hasInterviewed, setHasInterviewed] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);

  React.useEffect(() => {
    if (typeof window !== 'undefined') {
      setIsLoggedIn(localStorage.getItem('mockmate_logged_in') === 'true');
      setHasInterviewed(localStorage.getItem('mockmate_has_interviewed') === 'true');
    }
  }, []);

  const triggerLoading = (callback: () => void) => {
    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      callback();
    }, 3000); // 3 seconds loading screen duration
  };

  const handleStart = () => {
    triggerLoading(() => {
      router.push('/login');
    });
  };

  return (
    <div className="min-h-screen bg-[#0a0a0f] text-white overflow-x-hidden relative">
      {/* Background Glows */}
      <div className="absolute top-[-20%] left-[-10%] w-[60%] h-[60%] rounded-full bg-blue-900/20 blur-[150px] pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] rounded-full bg-indigo-900/20 blur-[150px] pointer-events-none" />

      {/* Navigation Bar */}
      <nav className="relative z-10 border-b border-white/5 bg-black/20 backdrop-blur-md px-6 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Cpu className="w-8 h-8 text-blue-400" />
            <span className="text-2xl font-black tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-indigo-300">
              MockMate
            </span>
          </div>
          <div className="flex items-center space-x-3">
            {isLoggedIn && (
              <button 
                onClick={() => triggerLoading(() => router.push('/dashboard'))}
                className="px-5 py-2 rounded-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white text-sm font-bold shadow-[0_0_15px_rgba(79,70,229,0.4)] transition-all flex items-center gap-1.5"
              >
                <span>📊</span> My Dashboard
              </button>
            )}
            <button 
              onClick={handleStart}
              className="px-5 py-2 rounded-full border border-blue-500/30 bg-blue-500/10 hover:bg-blue-500/20 text-blue-300 text-sm font-semibold transition-all"
            >
              Launch Bot
            </button>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <div className="relative z-10 max-w-7xl mx-auto px-6 pt-16 pb-20 text-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-indigo-500/10 border border-indigo-500/30 text-indigo-300 text-xs font-semibold uppercase tracking-wider mb-6">
            <Sparkles className="w-3.5 h-3.5" /> AI-Powered Placement Bot
          </div>
          
          <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight mb-6 leading-tight">
            Accelerate Your Journey from <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-rose-400 via-purple-400 to-emerald-400">
              Preparation to Placement
            </span>
          </h1>
          
          <p className="text-lg md:text-xl text-white/60 max-w-3xl mx-auto mb-10 leading-relaxed">
            Upload your resume, verify your identity, and enter a strict, real-life neural simulation. Undergo proctored testing, receive behavioral tone checks, and review comprehensive SHAP diagnostic feedback.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <button 
              onClick={handleStart}
              onMouseEnter={() => showMessage("Nervous? Good. That means you care. Let's turn that into confidence. Tap to start your mock interview.")}
              onMouseLeave={clearMessage}
              className="premium-btn text-lg py-4 px-8 rounded-full inline-flex items-center group"
            >
              <span>Start Interview Simulation</span>
              <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </button>

            {isLoggedIn && (
              <button 
                onClick={() => triggerLoading(() => router.push('/dashboard'))}
                className="px-8 py-4 rounded-full border border-indigo-500/40 bg-indigo-500/10 hover:bg-indigo-500/20 text-indigo-300 text-lg font-bold shadow-[0_0_20px_rgba(99,102,241,0.3)] transition-all inline-flex items-center gap-2"
              >
                <span>📊</span> Take Me to My Dashboard
              </button>
            )}
          </div>
        </motion.div>

        {/* Transition Showcase */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="mt-20 max-w-4xl mx-auto"
        >
          <h2 className="text-2xl font-bold mb-10 text-white/80">The MockMate Career Transition</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-stretch relative">
            {/* Left: Unemployed */}
            <div 
              onMouseEnter={() => showMessage("This is the MockMate glow-up✨. From panic to placement. Wanna start yours?")}
              onMouseLeave={clearMessage}
              className="glass-panel rounded-2xl overflow-hidden border-rose-500/20 relative group hover:border-rose-500/40 transition-all flex flex-col"
            >
              <div className="absolute top-4 left-4 z-20 bg-rose-500/90 text-white text-xs font-bold px-3 py-1 rounded-full flex items-center">
                <AlertCircle className="w-3.5 h-3.5 mr-1" /> Unprepared & Distressed
              </div>
              <div className="aspect-[4/5] relative w-full overflow-hidden bg-black/40">
                <img 
                  src="/unemployed.png" 
                  alt="Unprepared Candidate" 
                  className="w-full h-full object-cover filter grayscale opacity-80 group-hover:scale-105 group-hover:opacity-100 transition-all duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#0a0a0f] via-transparent to-transparent z-10" />
              </div>
              <div className="p-6 text-left mt-auto bg-black/40">
                <h3 className="text-lg font-bold text-rose-300 mb-2">Before: Mismatched & Stressed</h3>
                <p className="text-sm text-white/60">
                  Submitting generic resumes, facing visual proctoring alerts, receiving default 2/5 scores, and getting disqualified for unprofessional tone.
                </p>
              </div>
            </div>

            {/* Right: Employed */}
            <div 
              onMouseEnter={() => showMessage("This is the MockMate glow-up✨. From panic to placement. Wanna start yours?")}
              onMouseLeave={clearMessage}
              className="glass-panel rounded-2xl overflow-hidden border-emerald-500/20 relative group hover:border-emerald-500/40 transition-all flex flex-col"
            >
              <div className="absolute top-4 right-4 z-20 bg-emerald-500/90 text-white text-xs font-bold px-3 py-1 rounded-full flex items-center">
                <UserCheck className="w-3.5 h-3.5 mr-1" /> MockMate Certified
              </div>
              <div className="aspect-[4/5] relative w-full overflow-hidden bg-black/40">
                <img 
                  src="/employed.png" 
                  alt="Placed Candidate" 
                  className="w-full h-full object-cover opacity-90 group-hover:scale-105 group-hover:opacity-100 transition-all duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#0a0a0f] via-transparent to-transparent z-10" />
              </div>
              <div className="p-6 text-left mt-auto bg-black/40">
                <h3 className="text-lg font-bold text-emerald-300 mb-2">After: Placed & Confident</h3>
                <p className="text-sm text-white/60">
                  Targeted dynamic resume alignment, flawless identity verification, high-performance mock execution, and detailed diagnostic insights.
                </p>
              </div>
            </div>
            
            {/* Center Decorative Divider */}
            <div className="hidden md:flex absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-30 w-12 h-12 bg-indigo-600 rounded-full border-4 border-[#0a0a0f] items-center justify-center shadow-2xl">
              <TrendingUp className="w-5 h-5 text-white animate-pulse" />
            </div>
          </div>
        </motion.div>

        {/* Capabilities Section */}
        <div className="mt-32 max-w-6xl mx-auto text-left">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-5xl font-black mb-4">Core Platform Capabilities</h2>
            <p className="text-white/50 text-base max-w-xl mx-auto">
              Built on a foundation of integrity, neural matching, and deep placement analytics.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div 
              onMouseEnter={() => showMessage("Psst... Recruiters use ATS first. Let's make sure your resume gets past the robots 🤖 → Humans")}
              onMouseLeave={clearMessage}
              className="glass-panel p-6 rounded-2xl relative overflow-hidden group hover:-translate-y-1 transition-all"
            >
              <div className="w-12 h-12 rounded-xl bg-blue-500/10 border border-blue-500/30 flex items-center justify-center mb-5 text-blue-400 group-hover:bg-blue-500/20 transition-all">
                <Cpu className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold mb-2 text-white/90">Smart ATS Parser</h3>
              <p className="text-sm text-white/50 leading-relaxed">
                Extracts PDF resumes, evaluates professional references, and scores job alignment using exact metrics and keywords.
              </p>
            </div>

            <div 
              onMouseEnter={() => showMessage("No tab switching, no cheating, just you vs the interview. Just like the real thing!")}
              onMouseLeave={clearMessage}
              className="glass-panel p-6 rounded-2xl relative overflow-hidden group hover:-translate-y-1 transition-all"
            >
              <div className="w-12 h-12 rounded-xl bg-indigo-500/10 border border-indigo-500/30 flex items-center justify-center mb-5 text-indigo-400 group-hover:bg-indigo-500/20 transition-all">
                <ShieldCheck className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold mb-2 text-white/90">Visual Proctoring</h3>
              <p className="text-sm text-white/50 leading-relaxed">
                Verifies candidate identity prior to checkout and tracks gaze, devices, and focus status dynamically every 8 seconds.
              </p>
            </div>

            <div 
              onMouseEnter={() => showMessage("Watch your slangss, Matee! 😏 I'll flag filler words, rudeness, or \"umm\"s before HR does")}
              onMouseLeave={clearMessage}
              className="glass-panel p-6 rounded-2xl relative overflow-hidden group hover:-translate-y-1 transition-all"
            >
              <div className="w-12 h-12 rounded-xl bg-rose-500/10 border border-rose-500/30 flex items-center justify-center mb-5 text-rose-400 group-hover:bg-rose-500/20 transition-all">
                <AlertCircle className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold mb-2 text-white/90">Behavioral Checks</h3>
              <p className="text-sm text-white/50 leading-relaxed">
                Audits semantic responses for rude, lazy, entitled, or flirty comments. Warns once and terminates on repeated offences.
              </p>
            </div>

            <div 
              onMouseEnter={() => showMessage("No more guessing! I'll break down exactly where you lost marks + how to improve 📊")}
              onMouseLeave={clearMessage}
              className="glass-panel p-6 rounded-2xl relative overflow-hidden group hover:-translate-y-1 transition-all"
            >
              <div className="w-12 h-12 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center mb-5 text-emerald-400 group-hover:bg-emerald-500/20 transition-all">
                <TrendingUp className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold mb-2 text-white/90">Diagnostic Reports</h3>
              <p className="text-sm text-white/50 leading-relaxed">
                Compiles detailed grading matrices, dimension impact factors, and SHAP analytics into downloadable PDFs.
              </p>
            </div>
          </div>
        </div>

        {/* ══════════════════════════════════════════════════════════════
             GAME OF FOURS — Premium 4-Avatar Panel Card
             Placed ABOVE the June HR card intentionally
        ══════════════════════════════════════════════════════════════ */}
        <div
          onMouseEnter={() => showMessage("👑 Game of Fours: You slay or you get slayed. No middle ground. ⚔️")}
          onMouseLeave={clearMessage}
          onClick={() => triggerLoading(() => router.push('/panel-interview'))}
          className="mt-32 max-w-4xl mx-auto cursor-pointer relative overflow-hidden rounded-3xl group"
          style={{
            background: 'linear-gradient(135deg, #0d0a00 0%, #1a1000 40%, #0d0600 100%)',
            border: '1px solid rgba(251,191,36,0.25)',
            boxShadow: '0 0 60px rgba(217,119,6,0.12), 0 0 120px rgba(120,53,15,0.08), inset 0 1px 0 rgba(251,191,36,0.08)',
          }}
        >
          {/* Ambient glow layers */}
          <div className="absolute -top-20 -right-20 w-72 h-72 rounded-full bg-amber-500/8 blur-[80px] pointer-events-none group-hover:bg-amber-500/15 transition-all duration-700" />
          <div className="absolute -bottom-10 -left-10 w-48 h-48 rounded-full bg-orange-700/10 blur-[60px] pointer-events-none" />
          <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-amber-500/40 to-transparent" />

          {/* ELITE badge */}
          <div className="absolute top-5 right-5 flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-black tracking-[0.15em] uppercase"
            style={{ background: 'rgba(251,191,36,0.12)', border: '1px solid rgba(251,191,36,0.3)', color: '#fbbf24' }}>
            <span>⚔️</span> ELITE
          </div>

          <div className="p-8 md:p-10">
            {/* Header */}
            <div className="flex items-start gap-4 mb-6">
              <div className="w-14 h-14 rounded-2xl flex items-center justify-center flex-shrink-0 text-2xl"
                style={{ background: 'rgba(251,191,36,0.1)', border: '1px solid rgba(251,191,36,0.2)' }}>
                👑
              </div>
              <div className="text-left">
                <div className="inline-flex items-center gap-2 mb-1">
                  <span className="text-[10px] font-bold tracking-[0.2em] uppercase text-amber-400/70">MockMate Presents</span>
                </div>
                <h2 className="text-3xl md:text-4xl font-black tracking-tight"
                  style={{ background: 'linear-gradient(135deg, #fbbf24 0%, #f59e0b 40%, #d97706 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                  Game of Fours
                </h2>
                <p className="text-amber-100/50 text-sm mt-1 font-medium">4 Interviewers. 8 Questions. Zero Mercy.</p>
              </div>
            </div>

            {/* Description */}
            <p className="text-white/55 text-sm leading-relaxed mb-8 max-w-2xl">
              Face a real panel — HR, Tech, Product, and the Hiring Manager — all at once. 
              Agora AI routes your answers to the right expert. HeyGen avatars deliver the questions live.
              One chance. One room. Real pressure.
            </p>

            {/* 4 Avatar chips */}
            <div className="flex flex-wrap gap-3 mb-8">
              {[
                { name: 'June', role: 'HR Manager', color: 'rgba(167,139,250,0.15)', border: 'rgba(167,139,250,0.3)', text: '#c4b5fd' },
                { name: 'Bryan', role: 'Tech Lead', color: 'rgba(96,165,250,0.15)', border: 'rgba(96,165,250,0.3)', text: '#93c5fd' },
                { name: 'Graham', role: 'Product Manager', color: 'rgba(52,211,153,0.15)', border: 'rgba(52,211,153,0.3)', text: '#6ee7b7' },
                { name: 'Alessandra', role: 'Hiring Manager', color: 'rgba(251,191,36,0.15)', border: 'rgba(251,191,36,0.3)', text: '#fcd34d' },
              ].map((av) => (
                <div key={av.name} className="flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-semibold"
                  style={{ background: av.color, border: `1px solid ${av.border}`, color: av.text }}>
                  <span className="w-1.5 h-1.5 rounded-full animate-pulse" style={{ background: av.text }} />
                  {av.name} · {av.role}
                </div>
              ))}
            </div>

            {/* Bottom row */}
            <div className="flex items-center justify-between">
              {/* Stats */}
              <div className="flex items-center gap-6 text-xs text-white/40">
                <div className="flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
                  <span className="font-semibold text-white/60">LIVE PANEL</span>
                </div>
                <span>8 Questions</span>
                <span>4 Experts</span>
                <span>AI-Routed</span>
              </div>

              {/* CTA button */}
              <button
                className="flex items-center gap-2 px-6 py-3 rounded-full text-sm font-bold transition-all duration-300 group-hover:scale-105"
                style={{
                  background: 'linear-gradient(135deg, #d97706, #b45309)',
                  boxShadow: '0 0 20px rgba(217,119,6,0.4)',
                  color: '#fff',
                }}
              >
                Enter the Panel <span className="text-base">⚔️</span>
              </button>
            </div>
          </div>
        </div>

        {/* AI Avatar Demo Section — June HR (kept below Game of Fours) */}
        <div 
          onMouseEnter={() => showMessage("That's June! She's friendly but she _will_ ask tough HR questions. Ready to impress her?👀")}
          onMouseLeave={clearMessage}
          className="mt-8 max-w-4xl mx-auto text-center glass-panel p-8 rounded-3xl border border-blue-500/20 relative overflow-hidden"
        >
          <div className="absolute -top-10 -left-10 w-40 h-40 bg-blue-500/10 blur-[50px] rounded-full pointer-events-none" />
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/30 text-blue-300 text-xs font-semibold uppercase tracking-wider mb-4">
            <Sparkles className="w-3.5 h-3.5 animate-pulse" /> AI Avatar Demo
          </div>
          <h2 className="text-2xl md:text-3xl font-bold mb-3">June HR Round</h2>
          <p className="text-white/60 max-w-xl mx-auto mb-6 text-sm">
            Experience real-time interactive HR simulation with our streaming AI avatar, June HR. 
            Speak naturally and receive dynamic feedback.
          </p>
          <button 
            onClick={() => triggerLoading(() => setShowChecklist(true))}
            className="px-6 py-3 rounded-full border border-blue-400 hover:bg-blue-400/10 text-blue-300 text-sm font-semibold transition-all hover:shadow-[0_0_15px_rgba(96,165,250,0.3)]"
          >
            Start HR Round
          </button>
        </div>

        {/* Footer CTA */}
        <div className="mt-32 p-12 glass-panel rounded-3xl relative overflow-hidden text-center max-w-4xl mx-auto border-indigo-500/20">
          <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-600/10 blur-[80px] rounded-full pointer-events-none" />
          <h2 className="text-3xl font-extrabold mb-4">Ready to test your readiness?</h2>
          <p className="text-white/60 max-w-xl mx-auto mb-8 text-sm">
            MockMate will evaluate your technical capabilities, communications, and resume credentials against rigorous benchmark criteria.
          </p>
          <button 
            onClick={handleStart}
            className="premium-btn text-base font-bold py-3 px-8 rounded-full"
          >
            Initialize Session
          </button>
        </div>
      </div>

      {/* Loading Overlay */}
      <AnimatePresence>
        {isLoading && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.5 }}
            className="fixed inset-0 z-[100] flex flex-col justify-center items-center bg-black"
          >
            <video 
              ref={videoRef}
              autoPlay
              muted 
              loop 
              playsInline
              className="w-[400px] h-[400px] object-cover rounded-full mix-blend-screen"
            >
              <source src="/cbotloading.mp4" type="video/mp4" />
            </video>
            <div className="mt-4 text-base text-white/50 tracking-[0.3em] uppercase font-light animate-pulse font-['Outfit']">
              Authenticating
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
