"use client";

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { GoogleLogin } from '@react-oauth/google';
import { useRouter, usePathname } from 'next/navigation';
import { useGuideBot } from './GuideBotContext';
import { CheckCircle2, XCircle, X } from 'lucide-react';

export default function GuideBot() {
  const router = useRouter();
  const pathname = usePathname();
  const { message, clearMessage, showChecklist, setShowChecklist } = useGuideBot();
  const [isExpanded, setIsExpanded] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [agreed, setAgreed] = useState(false);
  const [isVisible, setIsVisible] = useState(true);

  // Check login state on mount
  useEffect(() => {
    const logged = localStorage.getItem('mockmate_logged_in');
    if (logged === 'true') {
      setIsLoggedIn(true);
      setIsExpanded(false);
    } else {
      // Only show expanded login on home page if not logged in
      if (pathname === '/') {
        setIsExpanded(true);
      }
    }
  }, [pathname]);

  // Hide bot in interview rounds
  useEffect(() => {
    if (pathname?.includes('interview')) {
      setIsVisible(false);
    } else {
      setIsVisible(true);
    }
  }, [pathname]);

  const handleLoginSuccess = (credentialResponse: any) => {
    console.log("Login Success:", credentialResponse);
    localStorage.setItem('mockmate_logged_in', 'true');
    
    // Decode JWT to get email and name
    try {
      if (credentialResponse.credential) {
        const payload = JSON.parse(atob(credentialResponse.credential.split('.')[1]));
        if (payload.email) localStorage.setItem('mockmate_email', payload.email);
        if (payload.name) localStorage.setItem('mockmate_name', payload.name);
      }
    } catch (e) {
      console.error("Failed to decode JWT", e);
    }

    setIsLoggedIn(true);
    setIsExpanded(false);
    
    // Check if they've interviewed before (simulated)
    const hasInterviewed = localStorage.getItem('mockmate_has_interviewed');
    if (hasInterviewed === 'true') {
      router.push('/dashboard');
    }
  };

  if (!isVisible) return null;

  return (
    <AnimatePresence>
      <motion.div
        layout
        initial={isExpanded ? { opacity: 0, scale: 0.8, y: 50 } : false}
        animate={{ 
          opacity: 1, 
          scale: 1,
          y: 0,
          // When expanded, center it. When minimized, move to bottom right.
        }}
        transition={{ type: "spring", stiffness: 300, damping: 25 }}
        className={`fixed z-50 ${(isExpanded || showChecklist) ? 'inset-0 flex items-center justify-center bg-black/60 backdrop-blur-sm' : 'bottom-6 right-6 flex items-end gap-4'}`}
      >
        
        {/* Expanded Welcome / Login Card */}
        {isExpanded && !isLoggedIn && (
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-[#111116] border border-indigo-500/30 pt-16 px-8 pb-8 rounded-3xl max-w-md w-full shadow-[0_20px_50px_rgba(0,0,0,0.5)] relative mt-16 text-center"
          >
            {/* Close cross button */}
            <button 
              onClick={() => setIsExpanded(false)}
              className="absolute top-4 right-4 text-white/50 hover:text-white p-1.5 rounded-full hover:bg-white/10 transition-all text-sm z-20"
              title="Close"
              aria-label="Close"
            >
              <X className="w-5 h-5" />
            </button>

            {/* The overlapping bot circle */}
            <div className="absolute -top-12 left-1/2 -translate-x-1/2 w-24 h-24 rounded-full overflow-hidden border-4 border-[#0a0a0f] shadow-[0_0_25px_rgba(99,102,241,0.5)] z-10 bg-black">
              <video src="/cutiebot.mp4" autoPlay loop muted playsInline className="w-full h-full object-cover" />
            </div>

            <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/20 blur-[50px] rounded-full pointer-events-none" />
            
            <h2 className="text-2xl font-bold text-white mb-4 tracking-tight">Hiyo Matee! Welcome to MockMate 🎉</h2>
            
            <div className="text-white/70 space-y-3 mb-8 leading-relaxed text-sm">
              <p>Congrats on taking the first big step toward cracking your dream interview.</p>
              <p>You just landed on the exact platform that's going to prep you, push you, and make you unstoppable.</p>
              <p>Let's turn those "ummm" moments into "I've got this" moments. Ready to start?</p>
            </div>

            <div className="flex justify-center">
              <GoogleLogin
                onSuccess={handleLoginSuccess}
                onError={() => console.log('Login Failed')}
                theme="filled_black"
                shape="pill"
              />
            </div>
          </motion.div>
        )}

        {/* Expanded Logged In Card */}
        {isExpanded && isLoggedIn && (
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-[#111116] border border-indigo-500/30 pt-16 px-8 pb-8 rounded-3xl max-w-md w-full shadow-[0_20px_50px_rgba(0,0,0,0.5)] relative mt-16 text-center"
          >
            <button 
              onClick={() => setIsExpanded(false)}
              className="absolute top-4 right-4 text-white/50 hover:text-white p-1.5 rounded-full hover:bg-white/10 transition-all text-sm z-20"
              title="Close"
              aria-label="Close"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="absolute -top-12 left-1/2 -translate-x-1/2 w-24 h-24 rounded-full overflow-hidden border-4 border-[#0a0a0f] shadow-[0_0_25px_rgba(99,102,241,0.5)] z-10 bg-black">
              <video src="/cutiebot.mp4" autoPlay loop muted playsInline className="w-full h-full object-cover" />
            </div>

            <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/20 blur-[50px] rounded-full pointer-events-none" />
            
            <h2 className="text-2xl font-bold text-white mb-2 tracking-tight">Welcome Back! 🚀</h2>
            <p className="text-white/70 text-sm mb-6">You're logged in with your MockMate account.</p>

            <div className="space-y-3">
              <button
                onClick={() => {
                  setIsExpanded(false);
                  router.push('/dashboard');
                }}
                className="w-full py-3 px-6 rounded-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-bold shadow-[0_0_20px_rgba(79,70,229,0.4)] transition-all flex items-center justify-center gap-2 text-sm"
              >
                <span>📊</span> Take Me to My Dashboard
              </button>

              <button
                onClick={() => {
                  setIsExpanded(false);
                  router.push('/login');
                }}
                className="w-full py-3 px-6 rounded-full border border-white/20 hover:bg-white/10 text-white/80 font-semibold transition-all text-sm"
              >
                Start New Interview Session
              </button>
            </div>
          </motion.div>
        )}


        {/* Pre-Interview DOs and DON'Ts Checklist */}
        {showChecklist && !isExpanded && (
           <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-[#111116] border border-indigo-500/30 pt-16 px-10 pb-10 rounded-3xl max-w-2xl w-full shadow-[0_20px_50px_rgba(0,0,0,0.5)] relative mt-16 text-center"
          >
            {/* The overlapping bot circle */}
            <div className="absolute -top-12 left-1/2 -translate-x-1/2 w-24 h-24 rounded-full overflow-hidden border-4 border-[#0a0a0f] shadow-[0_0_25px_rgba(99,102,241,0.5)] z-10 bg-black">
              <video src="/cutiebot.mp4" autoPlay loop muted playsInline className="w-full h-full object-cover" />
            </div>

            <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/20 blur-[50px] rounded-full pointer-events-none" />

            <h3 className="text-2xl font-bold text-white mb-8 flex items-center justify-center gap-2">
              <span className="text-3xl">⚠️</span> Final Check Before We Start
            </h3>
            
            <div className="grid grid-cols-2 gap-10 mb-8 text-left">
              <div className="space-y-4">
                <h4 className="font-semibold text-emerald-400 flex items-center gap-2 text-lg"><CheckCircle2 className="w-5 h-5"/> DO's</h4>
                <ul className="text-sm text-white/70 space-y-3">
                  <li><strong className="text-white">Check Mic + Camera</strong> - Make sure I can hear you clearly.</li>
                  <li><strong className="text-white">Sit in a Quiet Room</strong> - Neutral background, no distractions.</li>
                  <li><strong className="text-white">Listen Fully</strong> - Wait for me to finish. Use STAR method.</li>
                  <li><strong className="text-white">Be Yourself + Honest</strong> - It's okay to say "I don't know".</li>
                </ul>
              </div>
              <div className="space-y-4">
                <h4 className="font-semibold text-rose-400 flex items-center gap-2 text-lg"><XCircle className="w-5 h-5"/> DON'Ts</h4>
                <ul className="text-sm text-white/70 space-y-3">
                  <li><strong className="text-white">Don't Read From Notes</strong> - I can tell. Practice, don't memorize.</li>
                  <li><strong className="text-white">Don't Use Fillers</strong> - Avoid "umm", "like". Pause instead.</li>
                  <li><strong className="text-white">Don't Interrupt</strong> - Let me complete the question.</li>
                  <li><strong className="text-white">Don't Stress</strong> - This is practice. Learn and try again.</li>
                </ul>
              </div>
            </div>

            <div className="flex items-center justify-between border-t border-white/10 pt-6 mt-4">
              <label className="flex items-center gap-3 cursor-pointer text-sm text-white/90">
                <input type="checkbox" checked={agreed} onChange={(e) => setAgreed(e.target.checked)} className="w-5 h-5 rounded border-gray-600 bg-gray-800 focus:ring-indigo-500" />
                I agree to both
              </label>
              <button 
                disabled={!agreed}
                onClick={() => {
                  setShowChecklist(false);
                  if (pathname === '/login') {
                    router.push('/interview');
                  } else {
                    router.push('/hr-interview');
                  }
                }}
                className={`px-8 py-3 rounded-full font-bold transition-all ${agreed ? 'bg-indigo-600 hover:bg-indigo-500 text-white shadow-[0_0_20px_rgba(79,70,229,0.4)]' : 'bg-gray-800 text-gray-500 cursor-not-allowed'}`}
              >
                Continue to Interview
              </button>
            </div>
          </motion.div>
        )}

        {/* Dynamic Contextual Message Balloon */}
        <AnimatePresence>
          {message && !isExpanded && !showChecklist && (
            <motion.div
              initial={{ opacity: 0, scale: 0.8, x: 20, y: 10 }}
              animate={{ opacity: 1, scale: 1, x: 0, y: 0 }}
              exit={{ opacity: 0, scale: 0.8, x: 20, y: 10 }}
              className="bg-[#0a0a0f]/80 backdrop-blur-xl border border-indigo-500/30 text-white text-sm p-4 rounded-3xl rounded-br-sm max-w-[300px] shadow-[0_10px_40px_rgba(99,102,241,0.3)] mb-6 mr-2 relative overflow-hidden"
            >
              <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/10 to-transparent pointer-events-none" />
              <div className="flex items-start gap-3 relative z-10">
                <div className="flex-shrink-0 w-7 h-7 rounded-full bg-gradient-to-tr from-indigo-500 to-blue-400 flex items-center justify-center shadow-lg shadow-indigo-500/40 mt-0.5">
                  <span className="text-white text-[10px] leading-none">✨</span>
                </div>
                <span className="leading-relaxed text-indigo-50 font-medium tracking-wide">{message}</span>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Minimized Floating Bot */}
        {!isExpanded && (
          <motion.div 
            layoutId="bot-avatar"
            onClick={() => setIsExpanded(true)}
            className="w-28 h-28 rounded-full overflow-hidden border-2 border-blue-400/50 shadow-[0_0_20px_rgba(96,165,250,0.4)] cursor-pointer hover:scale-105 transition-transform bg-black"
          >
            <video src="/cutiebot.mp4" autoPlay loop muted playsInline className="w-full h-full object-cover" />
          </motion.div>
        )}

      </motion.div>
    </AnimatePresence>
  );
}
