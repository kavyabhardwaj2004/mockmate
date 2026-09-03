/* eslint-disable @typescript-eslint/no-explicit-any, @typescript-eslint/no-unused-vars, react/no-unescaped-entities */
"use client";

import React, { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useInterviewStore } from '@/store/useInterviewStore';
import { Camera, CameraOff, Upload, CheckCircle, ShieldAlert, Cpu, Sparkles, User, ShieldCheck } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useGuideBot } from '@/components/GuideBotContext';

export default function LoginPage() {
  const router = useRouter();
  const { setShowChecklist } = useGuideBot();
  const setSessionData = useInterviewStore(state => state.setSessionData);
  const startInterview = useInterviewStore(state => state.startInterview);

  const [formData, setFormData] = useState({ name: '', email: '', branch: 'CSE' });
  const [file, setFile] = useState<File | null>(null);
  const [atsLoading, setAtsLoading] = useState(false);
  const [atsResult, setAtsResult] = useState<any>(null);
  const [detectedDomains, setDetectedDomains] = useState<string[]>([]);

  const [selectedDomain, setSelectedDomain] = useState<string | null>(null);
  const [selectedLevel, setSelectedLevel] = useState<string | null>(null);
  const [cameraError, setCameraError] = useState(false);
  const [agreed, setAgreed] = useState(false);
  const [snapshotObjPos, setSnapshot] = useState<string | null>(null);

  // New Face Verification states
  const [verifyingFace, setVerifyingFace] = useState(false);
  const [faceVerified, setFaceVerified] = useState(false);
  const [faceError, setFaceError] = useState<string | null>(null);

  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);

  useEffect(() => {
    startCamera();
    return () => {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
      }
    };
  }, []);

  const startCamera = async () => {
    setCameraError(false);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
    } catch (err) {
      setCameraError(true);
    }
  };

  const takeSnapshot = async () => {
    if (videoRef.current) {
      setVerifyingFace(true);
      setFaceError(null);
      setFaceVerified(false);
      setAgreed(false);

      const canvas = document.createElement('canvas');
      canvas.width = 640;
      canvas.height = 480;
      canvas.getContext('2d')?.drawImage(videoRef.current, 0, 0, 640, 480);
      
      const dataUrl = canvas.toDataURL('image/jpeg', 0.75);
      const base64Data = dataUrl.split(',')[1];

      try {
        const res = await fetch('/api/vision', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ imageBase64: base64Data })
        });

        const data = await res.json();
        
        if (data.violation) {
          setFaceError(`Face validation failed: Face not seen. Make sure your face is fully visible in the camera.`);
          setSnapshot(null);
          setFaceVerified(false);
        } else {
          setSnapshot(dataUrl);
          setFaceVerified(true);
          setFaceError(null);
        }
      } catch (err) {
        console.error("Face verification API error:", err);
        setFaceError("Network error during face verification. Please try again.");
        setSnapshot(null);
        setFaceVerified(false);
      } finally {
        setVerifyingFace(false);
      }
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const selected = e.target.files[0];
      setFile(selected);
      setAtsLoading(true);

      const form = new FormData();
      form.append('resume', selected);
      if (selectedDomain) form.append('domain', selectedDomain);

      try {
        const res = await fetch('/api/ats', { method: 'POST', body: form });
        const data = await res.json();

        if (data.atsData) setAtsResult(data.atsData);
        if (data.domains) setDetectedDomains(data.domains);
        if (data.resumeText) setSessionData({ resumeText: data.resumeText });

      } catch (err) {
        console.error("ATS Call failed", err);
        // fallback shows default domains so user isn't stuck
        setDetectedDomains(["DSA", "WebDev", "AIML", "Cyber", "DevOps"]);
      } finally {
        setAtsLoading(false);
      }
    }
  };

  const beginInterview = async () => {
    if (!formData.name || !selectedDomain || !selectedLevel || !agreed || !snapshotObjPos || !faceVerified) return;

    setSessionData({
      ...formData,
      domain: selectedDomain,
      level: selectedLevel,
      ats_score: atsResult?.final_ats_score,
      rec_strength: atsResult?.rec_strength || atsResult?.recommendation_verdict,
      gap_analysis: atsResult?.gap_analysis,
      impact_score: atsResult?.impact_score
    });

    startInterview();

    try {
      await document.documentElement.requestFullscreen();
    } catch (err) {
      console.warn("Fullscreen request denied", err);
    }

    setShowChecklist(true);
  };

  const isFormComplete = formData.name && selectedDomain && selectedLevel && agreed && file && snapshotObjPos && faceVerified;

  return (
    <div className="min-h-screen py-10 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
      {/* Background Orbs */}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-blue-600/20 blur-[120px]" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] rounded-full bg-indigo-600/20 blur-[120px]" />

      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-12">
          <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
            <h1 className="text-5xl font-extrabold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-indigo-300">
              MockMate
            </h1>
            <p className="mt-3 text-lg text-white/50 max-w-2xl mx-auto">
              AI-Powered Placement Bot. Proceed with integrity.
            </p>
          </motion.div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Left Column: Details & ATS */}
          <motion.div initial={{ x: -30, opacity: 0 }} animate={{ x: 0, opacity: 1 }} className="space-y-6">
            <div className="glass-panel p-8 rounded-2xl relative overflow-hidden group">
              <div className="absolute top-0 left-0 w-1 h-full bg-blue-500" />
              <h2 className="text-2xl font-bold mb-6 flex items-center"><User className="mr-3 text-blue-400" /> Candidate Profile</h2>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-white/70 mb-1">Full Name</label>
                  <input type="text" className="glass-input w-full" placeholder="John Doe" value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })} />
                </div>
                <div className="grid grid-cols-1 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-white/70 mb-1">Branch</label>
                    <select className="glass-input w-full bg-black/80" value={formData.branch} onChange={e => setFormData({ ...formData, branch: e.target.value })}>
                      <option>CSE</option>
                      <option>IT</option>
                      <option>ECE</option>
                      <option>EEE</option>
                      <option>Other</option>
                    </select>
                  </div>
                </div>
              </div>
            </div>

            <div className="glass-panel p-8 rounded-2xl relative">
              <div className="absolute top-0 left-0 w-1 h-full bg-indigo-500" />
              <h2 className="text-2xl font-bold mb-6 flex items-center"><Upload className="mr-3 text-indigo-400" /> Context Upload</h2>

              <label className="border-2 border-dashed border-white/20 hover:border-indigo-400/50 rounded-xl p-8 flex flex-col items-center justify-center cursor-pointer transition-colors bg-white/5 group">
                <input type="file" className="hidden" accept=".pdf" onChange={handleFileUpload} />
                <Sparkles className="w-10 h-10 text-white/30 group-hover:text-indigo-400 mb-3 transition-colors" />
                <span className="text-white/60 group-hover:text-white transition-colors">
                  {file ? file.name : "Upload Resume (PDF format)"}
                </span>
              </label>

              <AnimatePresence>
                {atsLoading && (
                  <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} className="mt-6 text-center text-indigo-300 flex items-center justify-center">
                    <span className="animate-spin w-5 h-5 border-2 border-indigo-400 border-t-transparent rounded-full mr-3" />
                    AI Profiling Engine Active...
                  </motion.div>
                )}

                {atsResult && !atsLoading && (
                  <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="mt-6 p-5 bg-black/60 rounded-xl border border-white/10">
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <div className="text-xs text-white/40 uppercase tracking-widest font-semibold mb-1">Final ATS Score</div>
                        <div className="text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r from-green-400 to-emerald-600">
                          {atsResult.final_ats_score} <span className="text-lg text-white/50">/ 100</span>
                        </div>
                      </div>
                      <div className="px-3 py-1 rounded-full bg-green-500/10 border border-green-500/30 text-green-400 text-sm font-medium">
                        {atsResult.hireability_badge}
                      </div>
                    </div>

                    <div className="h-2 w-full bg-white/5 rounded-full mb-6 overflow-hidden">
                      <motion.div initial={{ width: 0 }} animate={{ width: `${atsResult.final_ats_score}%` }} className="h-full bg-gradient-to-r from-green-400 to-emerald-500" />
                    </div>

                    <div className="mb-4">
                      <span className="text-sm text-white/50 block mb-2">Recommendation Impact</span>
                      <div className="text-sm bg-white/5 p-3 rounded-lg border border-white/5 italic">
                        &quot;{atsResult.recommendation_verdict}&quot; (Boost: +{(atsResult.rec_boost_applied || 0).toFixed(1)})
                      </div>
                    </div>

                    {atsResult.gap_analysis && atsResult.gap_analysis.length > 0 && (
                      <div>
                        <span className="text-sm text-white/50 block mb-2">Skill Gaps Detected</span>
                        <div className="flex flex-wrap gap-2">
                          {atsResult.gap_analysis.map((gap: string, i: number) => (
                            <span key={i} className="px-2 py-1 bg-red-500/10 border border-red-500/20 rounded text-red-300 text-xs flex items-center">
                              <ShieldAlert className="w-3 h-3 justify-center mr-1" /> {gap}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                  </motion.div>
                )}
              </AnimatePresence>

              {(detectedDomains.length > 0 || file) && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mt-8">
                  <h3 className="text-sm font-medium text-white/70 mb-3 flex items-center">
                    <Cpu className="w-4 h-4 mr-2" /> Select Interview Domain
                  </h3>
                  <div className="grid grid-cols-2 gap-3">
                    {detectedDomains.map(d => (
                      <button
                        key={d}
                        onClick={() => setSelectedDomain(d)}
                        className={`py-2 px-4 rounded-lg border transition-all ${selectedDomain === d ? 'bg-indigo-600/20 border-indigo-500 text-white' : 'bg-white/5 border-white/10 text-white/60 hover:bg-white/10'}`}
                      >
                        {d}
                      </button>
                    ))}
                  </div>
                </motion.div>
              )}

              {selectedDomain && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mt-6">
                  <h3 className="text-sm font-medium text-white/70 mb-3">Select Difficulty Protocol</h3>
                  <div className="grid grid-cols-2 gap-3">
                    <button
                      onClick={() => setSelectedLevel("Beginner")}
                      className={`py-2 px-4 rounded-lg border transition-all ${selectedLevel === "Beginner" ? 'bg-blue-600/20 border-blue-500 text-white' : 'bg-white/5 border-white/10 text-white/60 hover:bg-white/10'}`}
                    >
                      Standard Phase
                    </button>
                    <button
                      onClick={() => setSelectedLevel("Advanced")}
                      className={`py-2 px-4 rounded-lg border transition-all ${selectedLevel === "Advanced" ? 'bg-rose-600/20 border-rose-500 text-white' : 'bg-white/5 border-white/10 text-white/60 hover:bg-white/10'}`}
                    >
                      Deep-Dive
                    </button>
                  </div>
                </motion.div>
              )}
            </div>
          </motion.div>

          {/* Right Column: Integrity Center */}
          <motion.div
            initial={{ x: 30, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            className="space-y-6"
          >
            <div className="glass-panel p-8 rounded-2xl relative h-full flex flex-col justify-between">
              <div className="absolute top-0 right-0 w-1 h-full bg-rose-500" />

              <div>
                <h2 className="text-2xl font-bold mb-6 flex items-center">
                  <ShieldCheck className="mr-3 text-rose-400" /> Session Integrity
                </h2>

                {cameraError ? (
                  <div className="bg-rose-900/20 border border-rose-500/30 rounded-xl p-8 text-center flex flex-col items-center justify-center">
                    <CameraOff className="w-12 h-12 text-rose-400 mb-4" />
                    <h3 className="text-rose-100 font-semibold text-lg mb-2">Camera Access Required</h3>
                    <p className="text-rose-200/60 text-sm mb-6 max-w-sm">
                      Proctoring metrics rely on intermittent visual sampling. Please allow camera permissions and click retry.
                    </p>
                    <button onClick={startCamera} className="bg-rose-600 hover:bg-rose-500 text-white py-2 px-6 rounded-lg transition-colors">
                      Retry Feed
                    </button>
                  </div>
                ) : (
                  <div className="relative rounded-xl overflow-hidden bg-black aspect-video border border-white/10 flex items-center justify-center group">
                    <video ref={videoRef} autoPlay playsInline muted className="w-full h-full object-cover transform -scale-x-100" />

                    {snapshotObjPos && (
                      <div className="absolute inset-0 bg-black/60 flex flex-col items-center justify-center backdrop-blur-sm z-10 transition-all">
                        <img src={snapshotObjPos} className="h-[80%] object-contain filter grayscale border-4 border-emerald-500/50 rounded pointer-events-none" alt="Snapshot" />
                        <div className="absolute top-4 right-4 bg-emerald-500/90 text-white px-3 py-1 rounded text-xs font-bold flex items-center">
                          <CheckCircle className="w-4 h-4 mr-2" /> Verified
                        </div>
                        <button
                          onClick={() => { setSnapshot(null); setFaceVerified(false); setAgreed(false); setFaceError(null); }}
                          className="mt-2 bg-rose-600 hover:bg-rose-500 text-white py-1 px-4 rounded-full text-xs font-semibold shadow-lg"
                        >
                          Retake Snapshot
                        </button>
                      </div>
                    )}

                    {verifyingFace && (
                      <div className="absolute inset-0 bg-black/70 flex flex-col items-center justify-center z-20">
                        <span className="animate-spin w-8 h-8 border-2 border-indigo-400 border-t-transparent rounded-full mb-3" />
                        <span className="text-xs text-indigo-300 font-bold tracking-wider">Verifying Face Presence...</span>
                      </div>
                    )}

                    {!snapshotObjPos && !verifyingFace && (
                      <button onClick={takeSnapshot} className="absolute bottom-6 bg-white/10 hover:bg-white/20 backdrop-blur-md border border-white/20 text-white py-2 px-6 rounded-full flex items-center opacity-0 group-hover:opacity-100 transition-all font-medium font-sm shadow-xl">
                        <Camera className="w-4 h-4 mr-2" /> Capture Identity Frame
                      </button>
                    )}

                    {!snapshotObjPos && !verifyingFace && (
                      <div className="absolute top-4 left-4 flex gap-2">
                        <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
                        <span className="text-xs text-white/50 font-medium">LIVE</span>
                      </div>
                    )}
                  </div>
                )}

                {faceError && (
                  <div className="mt-4 p-4 bg-rose-950/30 border border-rose-500/30 text-rose-300 text-xs rounded-xl flex items-start gap-2">
                    <ShieldAlert className="w-4 h-4 mt-0.5 flex-shrink-0" />
                    <span>{faceError}</span>
                  </div>
                )}
              </div>

              <div className="mt-8 pt-8 border-t border-white/10">
                <label className={`flex items-start space-x-3 cursor-pointer group mb-8 ${!faceVerified ? 'opacity-40 cursor-not-allowed pointer-events-none' : ''}`}>
                  <div className="flex-shrink-0 mt-1">
                    <div className={`w-5 h-5 rounded border flex items-center justify-center transition-colors ${agreed ? 'bg-emerald-500 border-emerald-500' : 'border-white/30 group-hover:border-white/60'}`}>
                      {agreed && <CheckCircle className="w-3 h-3 text-white" />}
                    </div>
                  </div>
                  <input 
                    type="checkbox" 
                    className="hidden" 
                    checked={agreed} 
                    disabled={!faceVerified}
                    onChange={() => faceVerified && setAgreed(!agreed)} 
                  />
                  <span className="text-sm text-white/60 select-none group-hover:text-white/80 transition-colors">
                    I agree to continuous AI-driven proctoring, including random camera frame analysis, window visibility tracking, and algorithmic grading.
                  </span>
                </label>

                <button
                  onClick={beginInterview}
                  disabled={!isFormComplete}
                  className={`w-full py-4 rounded-xl text-lg font-bold flex items-center justify-center transition-all ${isFormComplete ? 'premium-btn' : 'bg-white/5 text-white/20 cursor-not-allowed'}`}
                >
                  {isFormComplete ? (
                    <>Initialize Neural Session <Sparkles className="w-5 h-5 ml-2" /></>
                  ) : (
                    faceVerified ? 'Consent to proctoring to begin' : 'Complete Face Capture to Begin'
                  )}
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}