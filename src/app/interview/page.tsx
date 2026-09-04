/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import React, { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useChat } from 'ai/react';
import { Message } from 'ai';
import { useInterviewStore } from '@/store/useInterviewStore';
import { DOMAIN_TOPICS, Topic } from '@/data/questionBank';
import { Heart, Send, AlertTriangle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const BANNED = [
  // Explicit offensive language
  "stupid", "idiot", "shut up", "dumb", "useless", "nonsense", "bloody", "fuck",
  "foolish", "moron", "shut it", "rubbish", "trash", "hate this",
  // Flirty / romantic / suggestive (catches the "date" scenario)
  "go on a date", "on a date", "let's date", "lets date", "let's go out", "lets go out",
  "you're beautiful", "ur beautiful", "hey beautiful", "hey gorgeous", "hey sexy",
  "you're hot", "ur hot", "you're cute", "ur cute",
  "fall in love", "i love you", "kiss me", "hug me",
  "boring questions", "way too boring", "way to boring", "too boring",
  "not interested", "don't want to answer", "dont want to answer",
  "rather not", "skip this", "i quit", "i give up", "this is pointless",
];

export default function InterviewPage() {
  const router = useRouter();
  const sessionData = useInterviewStore(state => state.sessionData);
  const { topic_idx, proctor_lives, incrementBehavioralWarning, deductLife, addEvaluation, terminateInterview, completeInterview, nextTopic, incrementFollowUp, isComplete } = useInterviewStore();

  const [topics, setTopics] = useState<Topic[]>([]);
  const [pageReady, setPageReady] = useState(false);
  const [fsExited, setFsExited] = useState(false);
  const [qElapsed, setQElapsed] = useState(0);
  const [delayFlagged, setDelayFlagged] = useState<boolean[]>([]);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [isSpeaking, setIsSpeaking] = useState(false);

  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const proctorTimerRef = useRef<NodeJS.Timeout | null>(null);
  const endInterviewCalled = useRef(false);

  const speakText = (text: string) => {
    if (typeof window === "undefined" || !window.speechSynthesis) return;
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.onstart = () => setIsSpeaking(true);
    utterance.onend = () => setIsSpeaking(false);
    utterance.onerror = () => setIsSpeaking(false);
    window.speechSynthesis.speak(utterance);
  };

  const cleanup = () => {
    if (streamRef.current) streamRef.current.getTracks().forEach(t => t.stop());
    if (proctorTimerRef.current) clearInterval(proctorTimerRef.current);
    if (typeof window !== "undefined" && window.speechSynthesis) {
      window.speechSynthesis.cancel();
    }
    setIsSpeaking(false);
  }

  const captureFrame = () => {
    if (!videoRef.current) return null;
    const canvas = document.createElement('canvas');
    canvas.width = 640; canvas.height = 480;
    canvas.getContext('2d')?.drawImage(videoRef.current, 0, 0, 640, 480);
    return canvas.toDataURL('image/jpeg', 0.75).split(',')[1];
  };

  const handleInfraction = (reason: string) => {
    setToastMessage(`⚠️ INFRACTION: ${reason}`);
    setTimeout(() => setToastMessage(null), 5000);
    deductLife(reason);
  };

  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true });
      streamRef.current = stream;
      if (videoRef.current) videoRef.current.srcObject = stream;
    } catch {
      handleInfraction("Camera disconnected or blocked");
    }
  };

  const runVisionCheck = async () => {
    const frame = captureFrame();
    if (!frame) return;
    try {
      const res = await fetch('/api/vision', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ imageBase64: frame })
      });
      const data = await res.json();
      if (data.violation) {
        handleInfraction(data.reason);
      }
    } catch (e) {
      console.error(e);
    }
  };

  const scheduleNextProctorCheck = () => {
    proctorTimerRef.current = setInterval(async () => {
      await runVisionCheck();
    }, 8000); // ✅ Check every 8 seconds, not 45-90s
  };
  if (proctorTimerRef.current) clearInterval(proctorTimerRef.current);
  const endSession = (reason?: string) => {
    if (endInterviewCalled.current) return;
    endInterviewCalled.current = true;
    cleanup();
    if (document.fullscreenElement) {
      document.exitFullscreen().catch(() => { });
    }
    if (reason) terminateInterview(reason);
    else completeInterview();
    router.push('/result');
  };

  const { messages, input, handleInputChange, handleSubmit, setMessages, isLoading } = useChat({
    api: '/api/chat',
    onFinish: (message) => {
      try {
        const match = message.content.match(/\{[\s\S]*\}/);
        if (match) {
          const parsed = JSON.parse(match[0]);

          if (parsed.violation) {
            const { behavioral_warnings: warnings } = useInterviewStore.getState();

            // Record the score penalty regardless of warning count
            addEvaluation({
              topic: topics[topic_idx]?.topic || "Behavioral",
              rating_total: 0,
              dim_technical: 0,
              dim_communication: 0,
              dim_resume: 0,
              impact_tech: -2.5,
              impact_comm: -2.5,
              impact_res: -2.5,
              summary: "Behavioral violation — inappropriate or unprofessional conduct.",
              missing_keywords: [],
              detected_mistakes: ["Professional misconduct"]
            });

            if (warnings === 0) {
              // First violation: show warning, deduct life, stay on current question
              incrementBehavioralWarning();
              deductLife("Professional misconduct");
              setToastMessage("⚠️ WARNING: Inappropriate or unprofessional response detected.");
              setTimeout(() => setToastMessage(null), 7000);

              const reprimandText = parsed.interviewer_text || "That response is highly inappropriate. Please maintain decorum and answer the question professionally.";
              const current = messagesRef.current;
              if (current.length > 0) {
                setMessages([
                  ...current.slice(0, -1),
                  { ...current[current.length - 1], content: reprimandText }
                ]);
              }
              speakText(reprimandText);
              return;
            } else {
              // Second violation: disqualify immediately
              endSession("Disqualified: Repeated Professional Misconduct.");
              return;
            }
          }
          const { topic_idx: currentIdx, follow_up_count: currentFollowUp } =
            useInterviewStore.getState();

          // Ensure fallback to default if parsing failed internally
          const r = parsed.rating_total || 0;
          addEvaluation({
            topic: topics[currentIdx]?.topic || "General",
            rating_total: r,
            dim_technical: parsed.dim_technical || 0,
            dim_communication: parsed.dim_communication || 0,
            dim_resume: parsed.dim_resume || 0,
            impact_tech: parsed.impact_tech || 0,
            impact_comm: parsed.impact_comm || 0,
            impact_res: parsed.impact_res || 0,
            summary: parsed.summary || "Summary generation failed.",
            missing_keywords: parsed.missing_keywords || [],
            detected_mistakes: parsed.detected_mistakes || []
          });

          const shouldMoveOn = parsed.move_on || currentFollowUp >= 1;

          if (shouldMoveOn) {
            nextTopic();
            setQElapsed(0);
            const { topic_idx: newIdx } = useInterviewStore.getState();

            if (newIdx < topics.length) {
              const nextQ = topics[newIdx]?.core_question;
              const transitionText = parsed.interviewer_text
                ? parsed.interviewer_text
                : `Let's move on. ${nextQ}`;

              const current = messagesRef.current;
              if (current.length > 0) {
                setMessages([
                  ...current.slice(0, -1),
                  { ...current[current.length - 1], content: transitionText }
                ]);
              }
              speakText(transitionText);
            } else {
              const finalMessage = parsed.interviewer_text || "Thank you. That concludes our interview.";
              const current = messagesRef.current;
              if (current.length > 0) {
                setMessages([
                  ...current.slice(0, -1),
                  { ...current[current.length - 1], content: finalMessage }
                ]);
              }
              speakText(finalMessage);
              setTimeout(() => endSession(), 5000);
            }
          } else {
            incrementFollowUp();
            setQElapsed(0);
            const textMessage = parsed.interviewer_text || "Can you elaborate further?";
            const current = messagesRef.current;
            if (current.length > 0) {
              setMessages([
                ...current.slice(0, -1),
                { ...current[current.length - 1], content: textMessage }
              ]);
            }
            speakText(textMessage);
          }
        }
      } catch (e) {
        console.error("Failed to parse AI message", e);
      }
    }
  });

  const messagesRef = useRef<Message[]>([]);

  useEffect(() => {
    messagesRef.current = messages;
  }, [messages]);



  useEffect(() => {
    if (!sessionData) {
      router.push('/login');
      return;
    }
    const normalizeDomain = (d: string) => {
      const lower = (d || "").toLowerCase();
      if (lower.includes("aiml") || lower.includes("data science")) return "AIML";
      if (lower.includes("webdev") || lower.includes("web dev") || lower.includes("web") || lower.includes("full stack")) return "WebDev";
      if (lower.includes("dsa") || lower.includes("core cs")) return "DSA";
      if (lower.includes("devops") || lower.includes("dev ops") || lower.includes("cloud")) return "DevOps";
      if (lower.includes("cyber")) return "Cyber";
      return "DSA";
    };
    const mappedDomain = normalizeDomain(sessionData.domain);
    const domainData = DOMAIN_TOPICS[mappedDomain];
    const levelParams = domainData ? domainData[sessionData.level] : DOMAIN_TOPICS["DSA"]["Beginner"];
    
    // Pick 3 technical questions
    const techQuestions = [...levelParams].sort(() => 0.5 - Math.random()).slice(0, 3);
    // Pick 1 resume question
    const resumeParams = DOMAIN_TOPICS["Resume"] ? DOMAIN_TOPICS["Resume"]["Beginner"] : [];
    const resumeQuestions = [...resumeParams].sort(() => 0.5 - Math.random()).slice(0, 1);
    
    // Q0 intro topic
    const Q0_Topic: Topic = {
      topic: "Resume Intro",
      core_question: "Could you walk me through your resume in your own words?",
      sub_questions: [
        "Mentioned background / education",
        "Mentioned key skills",
        "Mentioned projects or experiences"
      ],
      ideal_answer: "I have a background in software engineering/computer science and have worked on projects. I am proficient in relevant technologies and have experience building applications.",
      must_have_keywords: ["resume", "experience", "project", "education", "skills"],
      common_mistakes: ["Unstructured introduction", "No mention of core skills", "Reading resume verbatim"],
      rating_guide: {
        1: "Unable to introduce themselves.",
        2: "Very brief or unclear introduction.",
        3: "Introduces education and some skills.",
        4: "Good overview of background, skills, and projects.",
        5: "Excellent, structured walkthrough of resume highlighting key achievements and skills."
      },
      evaluation_weights: {
        keyword_match: 20,
        conceptual_correctness: 40,
        clarity: 20,
        example_usage: 20
      }
    };

    // Combine them (Intro Q0 first, then Resume, then 3 Technical)
    const combinedTopics = [Q0_Topic, ...resumeQuestions, ...techQuestions];
    setTopics(combinedTopics);
    setDelayFlagged(new Array(combinedTopics.length).fill(false));

    setTimeout(() => setPageReady(true), 3000);

    startCamera();
    scheduleNextProctorCheck();

    return () => {
      cleanup();
    };
  }, []);

  useEffect(() => {
    const handleFSChange = () => {
      if (!document.fullscreenElement && pageReady && !fsExited) {
        setFsExited(true);
        endSession('Fullscreen violation — interview ended immediately.');
      }
    };
    const handleVisChange = () => {
      if (document.hidden && pageReady) {
        endSession('Tab switch detected — interview ended immediately.');
      }
    };
    document.addEventListener('fullscreenchange', handleFSChange);
    document.addEventListener('visibilitychange', handleVisChange);
    return () => {
      document.removeEventListener('fullscreenchange', handleFSChange);
      document.removeEventListener('visibilitychange', handleVisChange);
    };
  }, [pageReady, fsExited]);

  useEffect(() => {
    const interval = setInterval(() => {
      setQElapsed(prev => prev + 1);
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (qElapsed > 180 && qElapsed < 600 && !delayFlagged[topic_idx]) {
      const newFlags = [...delayFlagged];
      newFlags[topic_idx] = true;
      setDelayFlagged(newFlags);
      handleInfraction('Excessive Response Delay');
    }
  }, [qElapsed, topic_idx, delayFlagged]);

  useEffect(() => {
    if (topics.length > 0 && messages.length === 0 && topic_idx === 0) {
      const greeting = `Hello ${sessionData?.name}. I've reviewed your background. To begin, ${topics[0].core_question}`;
      setMessages([{ id: 'greeting', role: 'assistant', content: greeting }]);
      speakText(greeting);
    }
  }, [topics]);

  const onSubmitForm = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    if (BANNED.some(w => input.toLowerCase().includes(w))) {
      const { behavioral_warnings: warnings } = useInterviewStore.getState();
      if (warnings === 0) {
        incrementBehavioralWarning();
        deductLife("Professional misconduct");
        setToastMessage("⚠️ WARNING: Professional misconduct/banned language detected.");
        setTimeout(() => setToastMessage(null), 5000);

        const reprimandText = "That language is highly unprofessional. Let's keep this session strictly professional. Please answer the question properly.";
        const current = messagesRef.current;
        setMessages([
          ...current,
          { id: Date.now().toString(), role: 'user', content: input },
          { id: (Date.now() + 1).toString(), role: 'assistant', content: reprimandText }
        ]);

        speakText(reprimandText);
        handleInputChange({ target: { value: '' } } as any);
        return;
      } else {
        endSession("Disqualified: Repeated Professional Misconduct.");
        return;
      }
    }

    setQElapsed(0);

    // Call vision implicitly
    runVisionCheck();

    handleSubmit(e, {
      options: {
        body: {
          data: {
            candidateInfo: sessionData,
            currentTopic: topics[topic_idx],
            nextTopic: topics[topic_idx + 1] || null
          }
        }
      }
    });
  };

  const getHearts = () => {
    return Array(3).fill(0).map((_, i) => (
      <Heart key={i} className={`w-6 h-6 mx-1 ${i < proctor_lives ? 'text-rose-500 fill-rose-500' : 'text-gray-600 fill-gray-600'}`} />
    ));
  };

  if (!topics.length) return <div className="min-h-screen bg-black flex items-center justify-center text-white">Initializing Protocol...</div>;

  return (
    <div className="min-h-screen bg-[#0a0a0f] text-white flex overflow-hidden">
      <div className="w-72 border-r border-white/10 bg-black/40 flex flex-col items-center py-8">
        <div className="mb-8">
          <h2 className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-indigo-300 mb-2">MockMate</h2>
        </div>

        <div className="mb-10 w-full px-6">
          <p className="text-xs text-white/50 uppercase tracking-widest font-semibold mb-2 text-center">Session Integrity</p>
          <div className="flex justify-center mb-2">
            {getHearts()}
          </div>
        </div>

        <div className="w-48 h-36 rounded-xl overflow-hidden relative border border-white/10 mb-8 mt-auto">
          <video ref={videoRef} autoPlay playsInline muted className="w-full h-full object-cover opacity-80" />
          <div className="absolute top-2 right-2 flex items-center pr-2 py-1 pl-1 bg-black/50 rounded-full border border-red-500/30">
            <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse mr-2" />
            <span className="text-[10px] font-bold text-red-500">LIVE</span>
          </div>
        </div>

        <div className="text-center w-full px-6 text-sm text-white/40">
          Question Time Elapsed: {Math.floor(qElapsed / 60)}m {qElapsed % 60}s
        </div>
      </div>

      <div className="flex-1 flex flex-col h-screen relative">
        <AnimatePresence>
          {toastMessage && (
            <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} className="absolute top-4 left-1/2 transform -translate-x-1/2 bg-red-900/90 border border-red-500 text-white px-6 py-3 rounded-full text-sm font-semibold shadow-2xl z-50 flex items-center">
              <AlertTriangle className="w-4 h-4 mr-2" /> {toastMessage}
            </motion.div>
          )}
          {qElapsed > 240 && (
            <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="absolute top-16 left-1/2 transform -translate-x-1/2 bg-orange-600/90 text-white px-6 py-2 rounded-full text-sm font-semibold shadow-2xl z-50 animate-pulse">
              ❗ PRESENCE INQUIRY: Respond immediately!
            </motion.div>
          )}
        </AnimatePresence>

        {/* Interview Panel Avatars */}
        <div className="w-full bg-[#050505] border-b border-white/10 p-6 flex justify-center items-center gap-8 shrink-0 relative">
           
           {/* UI Overlay for Live status */}
           <div className="absolute top-4 left-4 flex items-center bg-black/60 px-3 py-1.5 rounded-full border border-white/10 backdrop-blur-md z-10">
             <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse mr-2"></div>
             <span className="text-xs font-bold text-white tracking-widest">LIVE PANEL</span>
           </div>

           {/* HR Interviewer */}
           <div className={`relative w-56 h-56 rounded-xl overflow-hidden transition-all duration-300 ${
             topic_idx < 2 
               ? isSpeaking 
                 ? 'ring-2 ring-indigo-400 shadow-[0_0_25px_rgba(129,140,248,0.6)] scale-105' 
                 : 'ring-2 ring-indigo-400 shadow-[0_0_20px_rgba(129,140,248,0.3)] scale-105' 
               : 'ring-1 ring-white/10 opacity-70 filter grayscale-[30%]'
           } ${topic_idx < 2 && isSpeaking ? 'avatar-speaking' : ''}`}>
              <img src="/avatar_hr.png" alt="HR Reviewer" className="w-full h-full object-cover" />
              <div className="absolute bottom-3 left-3 bg-black/80 px-2.5 py-1 rounded text-xs font-medium text-white border border-white/10 flex items-center gap-2">
                 {topic_idx < 2 && (
                    <span className={`w-1.5 h-1.5 rounded-full ${isSpeaking ? 'bg-indigo-400 animate-ping' : 'bg-green-500 animate-pulse'}`}></span>
                 )}
                 HR Manager
              </div>
              {topic_idx < 2 && isSpeaking && (
                 <div className="absolute top-3 right-3 bg-indigo-500/80 px-2 py-0.5 rounded-full text-[10px] font-bold text-white flex items-center gap-1 animate-pulse border border-indigo-400">
                    <span className="flex gap-0.5 items-end h-3">
                      <span className="w-0.5 bg-white rounded-full animate-bar-grow-1" style={{ height: '100%' }} />
                      <span className="w-0.5 bg-white rounded-full animate-bar-grow-2" style={{ height: '100%' }} />
                      <span className="w-0.5 bg-white rounded-full animate-bar-grow-3" style={{ height: '100%' }} />
                    </span>
                    Speaking
                 </div>
              )}
           </div>

           {/* Tech Lead */}
           <div className={`relative w-56 h-56 rounded-xl overflow-hidden transition-all duration-300 ${
             (topic_idx === 2 || topic_idx === 4)
               ? isSpeaking
                 ? 'ring-2 ring-blue-400 shadow-[0_0_25px_rgba(96,165,250,0.6)] scale-105'
                 : 'ring-2 ring-blue-400 shadow-[0_0_20px_rgba(96,165,250,0.3)] scale-105'
               : 'ring-1 ring-white/10 opacity-70 filter grayscale-[30%]'
           } ${(topic_idx === 2 || topic_idx === 4) && isSpeaking ? 'avatar-speaking' : ''}`}>
              <img src="/avatar_tech1.png" alt="Tech Interviewer 1" className="w-full h-full object-cover" />
              <div className="absolute bottom-3 left-3 bg-black/80 px-2.5 py-1 rounded text-xs font-medium text-white border border-white/10 flex items-center gap-2">
                 {(topic_idx === 2 || topic_idx === 4) && (
                    <span className={`w-1.5 h-1.5 rounded-full ${isSpeaking ? 'bg-blue-400 animate-ping' : 'bg-green-500 animate-pulse'}`}></span>
                 )}
                 Tech Lead
              </div>
              {(topic_idx === 2 || topic_idx === 4) && isSpeaking && (
                 <div className="absolute top-3 right-3 bg-blue-500/80 px-2 py-0.5 rounded-full text-[10px] font-bold text-white flex items-center gap-1 animate-pulse border border-blue-400">
                    <span className="flex gap-0.5 items-end h-3">
                      <span className="w-0.5 bg-white rounded-full animate-bar-grow-1" style={{ height: '100%' }} />
                      <span className="w-0.5 bg-white rounded-full animate-bar-grow-2" style={{ height: '100%' }} />
                      <span className="w-0.5 bg-white rounded-full animate-bar-grow-3" style={{ height: '100%' }} />
                    </span>
                    Speaking
                 </div>
              )}
           </div>

           {/* Senior Engineer */}
           <div className={`relative w-56 h-56 rounded-xl overflow-hidden transition-all duration-300 ${
             topic_idx === 3 
               ? isSpeaking
                 ? 'ring-2 ring-blue-400 shadow-[0_0_25px_rgba(96,165,250,0.6)] scale-105'
                 : 'ring-2 ring-blue-400 shadow-[0_0_20px_rgba(96,165,250,0.3)] scale-105'
               : 'ring-1 ring-white/10 opacity-70 filter grayscale-[30%]'
           } ${topic_idx === 3 && isSpeaking ? 'avatar-speaking' : ''}`}>
              <img src="/avatar_tech2.png" alt="Tech Interviewer 2" className="w-full h-full object-cover" />
              <div className="absolute bottom-3 left-3 bg-black/80 px-2.5 py-1 rounded text-xs font-medium text-white border border-white/10 flex items-center gap-2">
                 {topic_idx === 3 && (
                    <span className={`w-1.5 h-1.5 rounded-full ${isSpeaking ? 'bg-blue-400 animate-ping' : 'bg-green-500 animate-pulse'}`}></span>
                 )}
                 Senior Engineer
              </div>
              {topic_idx === 3 && isSpeaking && (
                 <div className="absolute top-3 right-3 bg-blue-500/80 px-2 py-0.5 rounded-full text-[10px] font-bold text-white flex items-center gap-1 animate-pulse border border-blue-400">
                    <span className="flex gap-0.5 items-end h-3">
                      <span className="w-0.5 bg-white rounded-full animate-bar-grow-1" style={{ height: '100%' }} />
                      <span className="w-0.5 bg-white rounded-full animate-bar-grow-2" style={{ height: '100%' }} />
                      <span className="w-0.5 bg-white rounded-full animate-bar-grow-3" style={{ height: '100%' }} />
                    </span>
                    Speaking
                 </div>
              )}
           </div>

        </div>

        <div className="flex-1 overflow-y-auto p-8 space-y-6 flex flex-col pb-24">
          {messages.map(m => (
            <div key={m.id} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
              <div className={`max-w-[70%] rounded-2xl px-6 py-4 ${m.role === 'user' ? 'bg-indigo-600 text-indigo-50 border border-indigo-500/50' : 'bg-white/5 border border-white/10 text-white/90'}`}>
                {m.role === 'assistant' && typeof m.content === 'string' && m.content.includes('"rating_total"') ? (
                  <span className="animate-pulse text-blue-400 font-mono text-sm">Processing Evaluation Engine...</span>
                ) : (
                  m.content
                )}
              </div>
            </div>
          ))}
          {isLoading && messages[messages.length - 1]?.role === 'user' && (
            <div className="flex justify-start">
              <div className="bg-white/5 border border-white/10 text-white/50 px-6 py-4 rounded-full flex items-center">
                <span className="animate-bounce mr-1">.</span><span className="animate-bounce delay-100 mr-1">.</span><span className="animate-bounce delay-200">.</span>
              </div>
            </div>
          )}
        </div>

        <div className="absolute bottom-0 w-full p-6 bg-gradient-to-t from-black via-black/80 to-transparent">
          <form onSubmit={onSubmitForm} className="relative max-w-4xl mx-auto flex items-center">
            <input
              value={input}
              onChange={handleInputChange}
              disabled={isLoading || isComplete}
              placeholder="Type your explanation..."
              className="w-full bg-white/10 border border-white/20 rounded-full py-4 pl-6 pr-16 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 disabled:opacity-50"
            />
            <button type="submit" disabled={isLoading} className="absolute right-2 p-3 bg-indigo-500 rounded-full hover:bg-indigo-400 disabled:opacity-50 disabled:hover:bg-indigo-500 font-medium transition-colors">
              <Send className="w-5 h-5 text-white" />
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
