"use client";
/* eslint-disable @typescript-eslint/no-explicit-any, @typescript-eslint/no-unused-vars */

import React, { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { LiveAvatarSession, SessionEvent, AgentEventsEnum } from '@heygen/liveavatar-web-sdk';
import { Play, Square, ArrowLeft, Loader2, Trash2, Mic, Volume2, HelpCircle } from 'lucide-react';

export default function HRInterviewComponent() {
  const router = useRouter();
  
  // State
  const [status, setStatus] = useState<'Idle' | 'Listening' | 'Speaking' | 'Loading'>('Idle');
  const [transcript, setTranscript] = useState<Array<{ speaker: 'June HR' | 'User'; text: string }>>([]);
  const [sessionActive, setSessionActive] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Refs for speech recognition and avatar lifecycle
  const videoRef = useRef<HTMLVideoElement>(null);
  const recognitionRef = useRef<any>(null);
  const avatarRef = useRef<any>(null);
  
  // Keep active status in ref to access it in event listener callbacks safely
  const statusRef = useRef<string>('Idle');
  const isSessionActiveRef = useRef<boolean>(false);

  useEffect(() => {
    statusRef.current = status;
  }, [status]);

  useEffect(() => {
    isSessionActiveRef.current = sessionActive;
  }, [sessionActive]);

  // Load transcript from localStorage on mount
  useEffect(() => {
    const saved = localStorage.getItem('hr_interview_transcript');
    if (saved) {
      try {
        setTranscript(JSON.parse(saved));
      } catch (e) {
        console.error("Failed to parse transcript from localStorage", e);
      }
    }
  }, []);

  // Initialize Speech Recognition on Mount
  useEffect(() => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (SpeechRecognition) {
      const rec = new SpeechRecognition();
      rec.continuous = false;
      rec.interimResults = false;
      rec.lang = 'en-US';

      rec.onresult = async (event: any) => {
        const transcriptText = event.results[0][0]?.transcript;
        if (!transcriptText || transcriptText.trim() === '') return;

        // Append user response to transcript
        appendTranscript('User', transcriptText);
        setStatus('Loading'); // Wait for API and speech

        try {
          const savedTranscript = JSON.parse(localStorage.getItem('hr_interview_transcript') || '[]');
          
          const res = await fetch('/api/hr-chat', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              message: transcriptText,
              history: savedTranscript
            }),
          });
          
          const data = await res.json();
          
          if (data.response && avatarRef.current && isSessionActiveRef.current) {
            appendTranscript('June HR', data.response);
            avatarRef.current.repeat(data.response);
          } else {
            // If API succeeded but response was empty or session ended
            setStatus('Listening');
          }
        } catch (err) {
          console.error("Failed to get response from June HR:", err);
          setError("Conversation API error. Restarting microphone...");
          setStatus('Listening');
        }
      };

      rec.onerror = (event: any) => {
        console.error("Speech recognition error:", event.error);
        if (event.error === 'not-allowed') {
          setError("Microphone permission denied.");
          setSessionActive(false);
          setStatus('Idle');
        }
      };

      rec.onend = () => {
        // Automatically restart speech recognition if session is active and avatar is not speaking
        if (statusRef.current === 'Listening' && isSessionActiveRef.current) {
          try {
            rec.start();
          } catch (err) {
            console.warn("Failed to restart speech recognition:", err);
          }
        }
      };

      recognitionRef.current = rec;
    } else {
      setError("Web Speech API is not supported in this browser. Please use Chrome/Safari.");
    }

    return () => {
      // Clean up on unmount
      if (recognitionRef.current) {
        try {
          recognitionRef.current.abort();
        } catch (e) {}
      }
      if (avatarRef.current) {
        avatarRef.current.stop().catch(console.error);
      }
    };
  }, []);

  // Append response helper
  const appendTranscript = (speaker: 'June HR' | 'User', text: string) => {
    setTranscript((prev) => {
      const updated = [...prev, { speaker, text }];
      localStorage.setItem('hr_interview_transcript', JSON.stringify(updated));
      return updated;
    });
  };

  // Clear Transcript
  const clearTranscript = () => {
    setTranscript([]);
    localStorage.removeItem('hr_interview_transcript');
  };

  // Start Session
  const startSession = async () => {
    setError(null);
    setStatus('Loading');
    setSessionActive(true);

    // Clear old transcript for a fresh interview session
    setTranscript([]);
    localStorage.removeItem('hr_interview_transcript');

    try {
      // 1. Fetch secure token from our backend
      const tokenRes = await fetch('/api/heygen/token', { method: 'POST' });
      if (!tokenRes.ok) {
        throw new Error(`Failed to fetch session token (Status ${tokenRes.status})`);
      }
      const tokenData = await tokenRes.json();
      if (!tokenData.token) {
        throw new Error("Missing token in response");
      }

      // 2. Initialize LiveAvatarSession instance
      const avatarInstance = new LiveAvatarSession(tokenData.token);
      avatarRef.current = avatarInstance;

      // 3. Bind event handlers
      avatarInstance.on(SessionEvent.SESSION_STREAM_READY, () => {
        if (videoRef.current) {
          avatarInstance.attach(videoRef.current);
          videoRef.current.play().catch((err) => {
            console.error("Error playing video:", err);
          });
        }
      });

      avatarInstance.on(SessionEvent.SESSION_DISCONNECTED, () => {
        console.log("LiveAvatar stream disconnected");
        cleanupSession();
      });

      avatarInstance.on(AgentEventsEnum.AVATAR_SPEAK_STARTED, () => {
        setStatus('Speaking');
        if (recognitionRef.current) {
          try {
            recognitionRef.current.abort();
          } catch (e) {}
        }
      });

      avatarInstance.on(AgentEventsEnum.AVATAR_SPEAK_ENDED, () => {
        setStatus('Listening');
        if (recognitionRef.current && isSessionActiveRef.current) {
          try {
            recognitionRef.current.start();
          } catch (err) {
            console.warn("Failed to start speech recognition after speaking:", err);
          }
        }
      });

      // 4. Start the session using LiveAvatar API
      await avatarInstance.start();

      // 5. Initiate greeting
      const greeting = "Hello, I am June Hr i will be conducting your HR interview today. Lets begain, Could u start with a brief introduction about yourself?";
      appendTranscript('June HR', greeting);
      avatarInstance.repeat(greeting);

    } catch (err: any) {
      console.error("Failed to start avatar session:", err);
      setError(err.message || "Failed to initialize HeyGen avatar stream.");
      cleanupSession();
    }
  };

  // End Session
  const cleanupSession = async () => {
    setSessionActive(false);
    setStatus('Idle');
    
    if (recognitionRef.current) {
      try {
        recognitionRef.current.abort();
      } catch (e) {}
    }

    if (avatarRef.current) {
      try {
        await avatarRef.current.stop();
      } catch (err) {
        console.error("Error calling stop:", err);
      }
      avatarRef.current = null;
    }

    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
  };

  // Scroll to bottom of transcript whenever it updates
  const transcriptEndRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    transcriptEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [transcript]);

  return (
    <div className="min-h-screen bg-[#07070a] text-white flex flex-col relative overflow-hidden">
      {/* Background Glows */}
      <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] rounded-full bg-blue-900/10 blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] rounded-full bg-indigo-900/10 blur-[120px] pointer-events-none" />

      {/* Nav */}
      <nav className="relative z-10 border-b border-white/5 bg-black/30 backdrop-blur-md px-6 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <button 
              onClick={cleanupSession}
              className="p-2 rounded-full hover:bg-white/5 text-slate-400 hover:text-white transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div className="flex items-center space-x-2">
              <span className="text-xl font-black tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-indigo-300">
                MockMate
              </span>
              <span className="text-xs px-2 py-0.5 rounded bg-blue-500/10 border border-blue-500/20 text-blue-300 font-mono">
                HR INTERVIEW
              </span>
            </div>
          </div>
          <button
            onClick={() => {
              cleanupSession();
              router.push('/');
            }}
            className="px-4 py-2 rounded-full border border-white/10 bg-white/5 hover:bg-white/10 text-sm font-semibold transition-all"
          >
            Back to MockMate
          </button>
        </div>
      </nav>

      {/* Main Container */}
      <main className="relative z-10 flex-1 max-w-7xl mx-auto w-full p-4 md:p-6 grid grid-cols-1 md:grid-cols-12 gap-6 items-stretch">
        
        {/* Left Panel: Avatar stream */}
        <section className="md:col-span-5 flex flex-col space-y-4">
          <div className="relative flex-1 aspect-[4/3] md:aspect-auto min-h-[350px] rounded-2xl border border-white/10 bg-slate-900/25 shadow-2xl overflow-hidden backdrop-blur-md flex items-center justify-center">
            
            {/* Live Video feed */}
            {sessionActive ? (
              <video 
                ref={videoRef} 
                autoPlay 
                playsInline 
                className="w-full h-full object-cover" 
              />
            ) : (
              <div className="text-center p-8">
                <div className="w-20 h-20 rounded-full bg-indigo-500/10 border border-indigo-500/30 flex items-center justify-center mx-auto mb-4 text-indigo-400">
                  <Volume2 className="w-10 h-10" />
                </div>
                <h3 className="text-lg font-bold text-slate-200">Session Ready</h3>
                <p className="text-sm text-slate-400/80 max-w-xs mt-1">
                  Connect to June HR for a real-time, interactive placement interview round.
                </p>
              </div>
            )}

            {/* Provider and Role badge */}
            <div className="absolute top-4 left-4 bg-black/60 backdrop-blur-md px-3 py-1.5 rounded-full border border-white/10 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
              <span className="text-[10px] font-bold text-white uppercase tracking-widest">LIVE INTERVIEW</span>
            </div>

            <div className="absolute top-4 right-4 bg-black/60 backdrop-blur-md px-3 py-1 rounded-full border border-white/10 text-[10px] text-slate-400 font-medium">
              Powered by HeyGen
            </div>

            {/* Avatar Role Label */}
            <div className="absolute bottom-4 left-4 bg-black/75 backdrop-blur-md px-4 py-2 rounded-xl border border-white/10">
              <div className="text-xs text-indigo-400 font-semibold uppercase tracking-wider">Interviewer</div>
              <div className="text-base font-bold text-white">June HR</div>
            </div>
          </div>

          {/* Guidelines / Helper details */}
          <div className="glass-panel p-4 rounded-xl border border-white/5 bg-slate-950/30 text-xs text-slate-400/80 flex items-start gap-3">
            <HelpCircle className="w-5 h-5 text-indigo-400 flex-shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold text-slate-300 mb-1">How it works:</p>
              <ul className="list-disc pl-4 space-y-1">
                <li>Click <strong>Start Interview</strong> to establish the streaming connection.</li>
                <li>Ensure you have granted microphone permissions.</li>
                <li>Wait for June HR to finish speaking before replying. Your microphone will automatically activate.</li>
              </ul>
            </div>
          </div>
        </section>

        {/* Right Panel: Controls + Transcript */}
        <section className="md:col-span-7 flex flex-col space-y-4">
          <div className="glass-panel flex-1 flex flex-col rounded-2xl border border-white/10 p-6 bg-slate-900/10 backdrop-blur-md relative overflow-hidden">
            
            {/* Header / Status */}
            <div className="flex items-center justify-between border-b border-white/10 pb-4 mb-4">
              <div>
                <h2 className="text-lg font-bold text-white">Interview Transcript</h2>
                <p className="text-xs text-slate-400">Captured response records and logs</p>
              </div>

              {/* Dynamic Status Indicator */}
              <div className="flex items-center gap-2 bg-white/5 border border-white/10 px-3 py-1.5 rounded-full">
                {status === 'Loading' && (
                  <>
                    <Loader2 className="w-3.5 h-3.5 text-blue-400 animate-spin" />
                    <span className="text-xs font-semibold text-blue-300">Connecting...</span>
                  </>
                )}
                {status === 'Listening' && (
                  <>
                    <span className="relative flex h-2.5 w-2.5">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
                    </span>
                    <span className="text-xs font-semibold text-emerald-400">Listening</span>
                  </>
                )}
                {status === 'Speaking' && (
                  <>
                    <span className="relative flex h-2.5 w-2.5">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-indigo-400 opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-indigo-500"></span>
                    </span>
                    <span className="text-xs font-semibold text-indigo-400">Speaking</span>
                  </>
                )}
                {status === 'Idle' && (
                  <>
                    <span className="h-2.5 w-2.5 rounded-full bg-slate-500" />
                    <span className="text-xs font-semibold text-slate-400">Idle</span>
                  </>
                )}
              </div>
            </div>

            {/* Error Message */}
            {error && (
              <div className="mb-4 p-3 rounded-lg bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs">
                {error}
              </div>
            )}

            {/* Transcript Area */}
            <div className="flex-1 overflow-y-auto min-h-[300px] max-h-[450px] border border-white/5 rounded-xl bg-black/30 p-4 space-y-4 mb-6 scrollbar-thin scrollbar-thumb-white/10">
              {transcript.length === 0 ? (
                <div className="h-full flex items-center justify-center text-center text-slate-500/80 p-8">
                  <div>
                    <Mic className="w-8 h-8 mx-auto mb-2 opacity-30" />
                    <p className="text-sm">No dialogs recorded yet.</p>
                  </div>
                </div>
              ) : (
                transcript.map((msg, index) => (
                  <div 
                    key={index}
                    className={`flex flex-col max-w-[85%] ${msg.speaker === 'User' ? 'ml-auto items-end' : 'mr-auto items-start'}`}
                  >
                    <span className="text-[10px] text-slate-400 font-medium mb-1 uppercase tracking-wider px-1">
                      {msg.speaker === 'User' ? 'You' : 'June HR'}
                    </span>
                    <div className={`p-3 rounded-2xl text-sm leading-relaxed border ${
                      msg.speaker === 'User' 
                        ? 'bg-blue-500/10 border-blue-500/20 text-blue-100 rounded-tr-none' 
                        : 'bg-indigo-500/10 border-indigo-500/20 text-indigo-100 rounded-tl-none'
                    }`}>
                      {msg.text}
                    </div>
                  </div>
                ))
              )}
              <div ref={transcriptEndRef} />
            </div>

            {/* Control Row */}
            <div className="flex flex-col sm:flex-row gap-3">
              {!sessionActive ? (
                <button
                  onClick={startSession}
                  disabled={status === 'Loading'}
                  className="flex-1 px-6 py-3.5 rounded-xl bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white font-bold transition-all flex items-center justify-center gap-2 shadow-lg shadow-indigo-500/15 disabled:opacity-50"
                >
                  {status === 'Loading' ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      Starting Session...
                    </>
                  ) : (
                    <>
                      <Play className="w-5 h-5 fill-current" />
                      Start Interview
                    </>
                  )}
                </button>
              ) : (
                <button
                  onClick={cleanupSession}
                  className="flex-1 px-6 py-3.5 rounded-xl bg-rose-600/20 border border-rose-500/30 hover:bg-rose-600/35 text-rose-300 font-bold transition-all flex items-center justify-center gap-2"
                >
                  <Square className="w-4 h-4 fill-current" />
                  End Interview
                </button>
              )}

              {transcript.length > 0 && (
                <button
                  onClick={clearTranscript}
                  className="px-4 py-3.5 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 text-slate-300 font-semibold transition-all flex items-center justify-center gap-2"
                  title="Clear Transcript History"
                >
                  <Trash2 className="w-4 h-4" />
                  <span className="sm:hidden md:inline">Clear Logs</span>
                </button>
              )}
            </div>
          </div>
        </section>

      </main>
    </div>
  );
}
