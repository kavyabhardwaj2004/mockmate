"use client";

import React from 'react';
import { motion } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { MessageSquare, Settings, FileText, CheckCircle2, TrendingUp, AlertCircle } from 'lucide-react';

export default function Dashboard() {
  const router = useRouter();

  const handleStartMock = () => {
    // Simulating user clicking Start New Mock
    router.push('/home'); // Or anywhere the flow starts
  };

  return (
    <div className="min-h-screen bg-[#0a0a0f] text-white p-6 md:p-12 overflow-x-hidden font-sans">
      <div className="max-w-7xl mx-auto space-y-8">
        
        {/* Header Section */}
        <div className="flex justify-between items-end mb-10 border-b border-white/10 pb-6">
          <div>
            <h1 className="text-4xl font-extrabold tracking-tight mb-2">Performance Dashboard</h1>
            <p className="text-white/50">Comprehensive analysis of your latest simulated interviews.</p>
          </div>
        </div>

        {/* Main Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          
          {/* Card 1: Resume Health & Bubbles (Spans 2 columns) */}
          <div className="md:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-6">
            
            {/* Resume Health */}
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-[#111116] border border-white/5 rounded-3xl p-8 relative overflow-hidden"
            >
              <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/10 blur-[50px] rounded-full" />
              <h3 className="text-xl font-bold mb-6 flex items-center gap-2"><FileText className="w-5 h-5 text-emerald-400"/> Resume Health</h3>
              
              <div className="flex items-center gap-6 mb-6">
                <div className="relative w-24 h-24 flex items-center justify-center rounded-full border-4 border-emerald-500/20">
                  <svg className="absolute inset-0 w-full h-full transform -rotate-90">
                    <circle cx="44" cy="44" r="44" stroke="currentColor" strokeWidth="8" fill="transparent" className="text-gray-800" transform="translate(4,4)"/>
                    <circle cx="44" cy="44" r="44" stroke="currentColor" strokeWidth="8" fill="transparent" strokeDasharray="276" strokeDashoffset="50" className="text-emerald-500 transition-all duration-1000 ease-out" transform="translate(4,4)"/>
                  </svg>
                  <span className="text-2xl font-bold text-white">82</span>
                </div>
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-sm text-white/70"><AlertCircle className="w-4 h-4 text-rose-400"/> Add 2 projects</div>
                  <div className="flex items-center gap-2 text-sm text-white/70"><AlertCircle className="w-4 h-4 text-rose-400"/> Quantify impact</div>
                  <div className="flex items-center gap-2 text-sm text-white/70"><AlertCircle className="w-4 h-4 text-amber-400"/> ATS Keywords: 6 missing</div>
                </div>
              </div>
              <button className="w-full py-3 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 transition-colors font-semibold text-emerald-300">
                Fix with AI
              </button>
            </motion.div>

            {/* 3D Skill Bubbles */}
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="bg-[#111116] border border-white/5 rounded-3xl p-8 relative overflow-hidden flex flex-col justify-center items-center h-full"
            >
              <h3 className="text-lg font-bold mb-6 self-start text-white/80">Extracted Skills</h3>
              <div className="relative w-full h-48 flex justify-center items-center">
                {/* Framer Motion Animated 3D-like Bubbles */}
                <motion.div animate={{ y: [0, -10, 0] }} transition={{ repeat: Infinity, duration: 4, ease: "easeInOut" }} className="absolute z-30 flex items-center justify-center w-24 h-24 rounded-full bg-gradient-to-br from-blue-400 to-indigo-600 shadow-[0_10px_30px_rgba(79,70,229,0.5)] border border-white/20 backdrop-blur-md">
                  <span className="font-bold text-sm">React</span>
                </motion.div>
                <motion.div animate={{ y: [0, 15, 0] }} transition={{ repeat: Infinity, duration: 5, ease: "easeInOut", delay: 1 }} className="absolute -ml-24 mt-10 z-20 flex items-center justify-center w-20 h-20 rounded-full bg-gradient-to-br from-emerald-400 to-teal-600 shadow-[0_10px_20px_rgba(16,185,129,0.4)] border border-white/20">
                  <span className="font-bold text-xs">Node.js</span>
                </motion.div>
                <motion.div animate={{ y: [0, -12, 0] }} transition={{ repeat: Infinity, duration: 4.5, ease: "easeInOut", delay: 0.5 }} className="absolute ml-28 -mt-8 z-10 flex items-center justify-center w-16 h-16 rounded-full bg-gradient-to-br from-rose-400 to-orange-500 shadow-[0_8px_16px_rgba(244,63,94,0.4)] border border-white/20">
                  <span className="font-bold text-[10px]">Python</span>
                </motion.div>
              </div>
            </motion.div>
          </div>

          {/* Guide Bot Levitating Card */}
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-gradient-to-b from-indigo-900/40 to-[#111116] border border-indigo-500/30 rounded-3xl p-8 flex flex-col items-center text-center justify-center relative overflow-hidden"
          >
            <motion.div 
              animate={{ y: [0, -15, 0] }} 
              transition={{ repeat: Infinity, duration: 4, ease: "easeInOut" }}
              className="w-24 h-24 rounded-full overflow-hidden border-4 border-indigo-400/50 shadow-[0_0_30px_rgba(99,102,241,0.5)] mb-6"
            >
              <video src="/cutiebot.mp4" autoPlay loop muted playsInline className="w-full h-full object-cover" />
            </motion.div>
            <h3 className="text-xl font-bold mb-2">You're back! 🔥</h3>
            <p className="text-sm text-indigo-200/80 mb-6">That's the spirit I like! Let's ace the next interview with solid practice 💪</p>
            <button onClick={handleStartMock} className="w-full py-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold transition-all shadow-[0_0_20px_rgba(99,102,241,0.4)]">
              Start New Mock
            </button>
          </motion.div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          
          {/* Comparative Score Analysis */}
          <motion.div 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-[#111116] border border-white/5 rounded-3xl p-8"
          >
            <h3 className="text-xl font-bold mb-6 flex items-center gap-2"><TrendingUp className="w-5 h-5 text-blue-400"/> Performance vs Pro</h3>
            
            <div className="space-y-6">
              {/* Stat 1 */}
              <div>
                <div className="flex justify-between text-sm mb-2">
                  <span className="text-white/70">Technical</span>
                  <span className="font-bold text-white">8.5 / 10 <span className="text-white/30 font-normal">| Pro: 9.0</span></span>
                </div>
                <div className="w-full bg-gray-800 rounded-full h-2">
                  <div className="bg-blue-500 h-2 rounded-full" style={{ width: '85%' }}></div>
                </div>
              </div>

              {/* Stat 2 */}
              <div>
                <div className="flex justify-between text-sm mb-2">
                  <span className="text-white/70">Communication</span>
                  <span className="font-bold text-white">7.2 / 10 <span className="text-white/30 font-normal">| Pro: 8.5</span></span>
                </div>
                <div className="w-full bg-gray-800 rounded-full h-2">
                  <div className="bg-amber-500 h-2 rounded-full" style={{ width: '72%' }}></div>
                </div>
                <p className="text-xs text-amber-400 mt-2 bg-amber-500/10 inline-block px-2 py-1 rounded">
                  💡 Tip: Reduce filler words
                </p>
              </div>

              {/* Stat 3 */}
              <div>
                <div className="flex justify-between text-sm mb-2">
                  <span className="text-white/70">Confidence</span>
                  <span className="font-bold text-white">9.1 / 10 <span className="text-white/30 font-normal">| Pro: 8.8</span></span>
                </div>
                <div className="w-full bg-gray-800 rounded-full h-2">
                  <div className="bg-emerald-500 h-2 rounded-full" style={{ width: '91%' }}></div>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Weakest Area Focus */}
          <motion.div 
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-gradient-to-br from-rose-900/20 to-[#111116] border border-rose-500/20 rounded-3xl p-8 flex flex-col justify-between"
          >
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs font-semibold mb-4">
                <AlertCircle className="w-3.5 h-3.5" /> Target Area
              </div>
              <h3 className="text-2xl font-bold mb-2 text-white">System Design</h3>
              <p className="text-white/60 text-sm leading-relaxed mb-8">
                Based on your last interview, your weakest area was System Design architecture scaling. Specifically around database sharding and caching strategies.
              </p>
            </div>
            
            <div className="space-y-3">
              <button className="w-full py-3 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/30 text-rose-300 font-semibold transition-colors">
                15 min System Design Mock
              </button>
              <button className="w-full py-3 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-white/80 font-semibold transition-colors">
                Behavioral Mock for PM role
              </button>
            </div>
          </motion.div>

        </div>

        {/* Pro vs Student Comparison visual layout */}
        <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="bg-[#111116] border border-white/5 rounded-3xl p-8"
        >
           <h3 className="text-xl font-bold mb-6">Answer Blueprint Comparison</h3>
           <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="p-6 rounded-2xl bg-white/5 border border-white/10">
                <div className="flex justify-between items-center mb-4">
                  <span className="text-sm text-white/50 uppercase tracking-wider font-bold">Your Response</span>
                  <span className="text-xs bg-rose-500/20 text-rose-300 px-2 py-1 rounded">Avg Structure</span>
                </div>
                <p className="text-sm text-white/70 leading-relaxed font-serif italic">
                  "I was leading a team and we had a conflict about the tech stack. So I just listened to everyone and we voted. In the end, we used React."
                </p>
              </div>
              <div className="p-6 rounded-2xl bg-gradient-to-br from-indigo-900/30 to-blue-900/30 border border-blue-500/30 relative">
                <div className="flex justify-between items-center mb-4">
                  <span className="text-sm text-blue-300 uppercase tracking-wider font-bold flex items-center gap-2"><CheckCircle2 className="w-4 h-4"/> Pro Response (STAR)</span>
                </div>
                <p className="text-sm text-white/90 leading-relaxed font-serif">
                  "<span className="text-blue-300 font-bold">Situation:</span> During the Q3 overhaul, my team conflicted over Angular vs React. <span className="text-blue-300 font-bold">Task:</span> I needed to align 5 engineers on a unified stack. <span className="text-blue-300 font-bold">Action:</span> I facilitated a spike test for both, comparing load times objectively. <span className="text-blue-300 font-bold">Result:</span> We unanimously adopted React, improving delivery speed by 20%."
                </p>
              </div>
           </div>
        </motion.div>

        {/* Support Footer */}
        <div className="flex justify-center mt-12 mb-8">
          <div className="inline-flex items-center gap-4 bg-[#1a1a24] border border-white/10 rounded-full py-3 px-6 cursor-pointer hover:bg-[#252532] transition-colors">
            <span className="text-sm text-white/70">Stuck? Ask Guide Bot or Contact Support</span>
            <MessageSquare className="w-5 h-5 text-indigo-400" />
          </div>
        </div>

      </div>
    </div>
  );
}
