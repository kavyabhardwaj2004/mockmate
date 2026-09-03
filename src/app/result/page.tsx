/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useInterviewStore } from '@/store/useInterviewStore';
import { supabase } from '@/lib/supabase';
import { ShieldCheck, AlertOctagon, Home, Activity } from 'lucide-react';
import dynamic from 'next/dynamic';

const PDFDownloadButton = dynamic(() => import('@/components/PDFDownloadBtn'), { ssr: false });

export default function ResultPage() {
  const router = useRouter();
  const { sessionData, evaluations, isDisqualified, terminationReason, resetInterview } = useInterviewStore();
  const [history, setHistory] = useState<any[]>([]);
  const [saving, setSaving] = useState(true);

  useEffect(() => {
    if (!sessionData) {
      router.push('/login');
      return;
    }

    const processResult = async () => {
      if (isDisqualified) {
        setSaving(false);
        return;
      }

      const raw_score = evaluations.reduce((acc, curr) => acc + curr.rating_total, 0);
      const avg_tech = evaluations.reduce((acc, curr) => acc + curr.dim_technical, 0) / (evaluations.length || 1);
      const avg_comm = evaluations.reduce((acc, curr) => acc + curr.dim_communication, 0) / (evaluations.length || 1);

      try {
        localStorage.setItem('mockmate_has_interviewed', 'true');
        
        await supabase.from('sessions').insert({
          email: sessionData.email,
          domain: sessionData.domain,
          level: sessionData.level,
          avg_tech,
          avg_comm,
          final_score: raw_score,
          ats_score: sessionData.ats_score,
          infractions: 3 - useInterviewStore.getState().proctor_lives
        });

        const { data } = await supabase
          .from('sessions')
          .select('*')
          .eq('email', sessionData.email)
          .eq('domain', sessionData.domain)
          .order('date', { ascending: false })
          .limit(5);

        if (data) setHistory(data.reverse());
      } catch (err) {
        console.error("Database save error", err);
      } finally {
        setSaving(false);
      }
    };

    processResult();
  }, [sessionData, isDisqualified, evaluations]);

  if (!sessionData) return null;

  return (
    <div className="min-h-screen bg-[#0a0a0f] py-12 px-4 sm:px-6 lg:px-8 text-white relative flex flex-col items-center justify-center">
       <div className="absolute top-0 right-0 w-1/2 h-1/2 bg-blue-900/10 blur-[150px] rounded-full pointer-events-none" />
       
       <div className="max-w-4xl w-full mx-auto space-y-8 relative z-10">
         {isDisqualified ? (
           <div className="bg-red-950/40 border border-red-500/50 rounded-2xl p-10 text-center shadow-2xl backdrop-blur-xl">
              <AlertOctagon className="w-20 h-20 text-red-500 mx-auto mb-6" />
              <h1 className="text-4xl font-bold text-red-400 mb-4">Session Terminated</h1>
              <p className="text-red-200/80 mb-6 text-lg">{terminationReason}</p>
              <div className="text-sm text-red-300/50 italic mb-8 border-t border-red-500/20 pt-6 mt-6">
                No diagnostics report is generated for disqualified sessions per policy.
              </div>
           </div>
         ) : (
           <div className="space-y-8">
             <div className="bg-emerald-950/30 border border-emerald-500/30 rounded-2xl p-10 text-center shadow-2xl backdrop-blur-xl">
                <ShieldCheck className="w-20 h-20 text-emerald-500 mx-auto mb-6" />
                <h1 className="text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-green-500 mb-4">Interview Complete</h1>
                <p className="text-emerald-100/70 mb-10 text-lg">Integrity confirmed. Diagnostics compiled successfully.</p>
                
                <div className="flex justify-center flex-col sm:flex-row gap-4 items-center">
                  {!saving ? (
                     <PDFDownloadButton 
                        sessionData={sessionData} 
                        evaluations={evaluations} 
                        history={history} 
                     />
                  ) : (
                     <div className="animate-pulse text-emerald-300">Synchronizing diagnostics to datastore...</div>
                  )}
                </div>
             </div>
             
             <div className="bg-white/5 border border-white/10 rounded-2xl p-8 backdrop-blur-xl">
                <h2 className="text-xl font-semibold mb-6 flex items-center"><Activity className="w-5 h-5 mr-3 text-indigo-400"/> Diagnostic Preview</h2>
                <div className="text-sm text-white/50 mb-4">Please download the full PDF to view comprehensive SHAP analytics, tabular insights, and generated trajectory planning.</div>
             </div>
           </div>
         )}
         
         <div className="text-center mt-12">
           <button 
              onClick={() => { resetInterview(); router.push('/login'); }} 
              className="bg-white/5 hover:bg-white/10 border border-white/20 text-white font-medium py-3 px-8 rounded-full transition-all inline-flex items-center shadow-lg"
           >
              <Home className="w-4 h-4 mr-2" /> Return to Mock Dashboard
           </button>
         </div>
       </div>
    </div>
  );
}
