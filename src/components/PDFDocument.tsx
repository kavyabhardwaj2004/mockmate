/* eslint-disable @typescript-eslint/no-explicit-any, @typescript-eslint/no-unused-vars */
import React from 'react';
import { Page, Text, View, Document, StyleSheet } from '@react-pdf/renderer';

const styles = StyleSheet.create({
  page: { padding: 40, fontFamily: 'Helvetica', backgroundColor: '#ffffff' },
  header: { fontSize: 24, marginBottom: 20, color: '#333', fontWeight: 'bold' },
  section: { marginBottom: 20, paddingBottom: 15, borderBottom: '1 solid #ddd' },
  title: { fontSize: 16, color: '#0056b3', marginBottom: 10, fontWeight: 'bold' },
  row: { flexDirection: 'row', marginBottom: 5 },
  label: { width: 150, fontSize: 11, color: '#555' },
  value: { flex: 1, fontSize: 11, color: '#000' },
  scoreBox: { backgroundColor: '#f4f4f4', padding: 15, borderRadius: 5, marginTop: 10 },
  scoreTitle: { fontSize: 14, fontWeight: 'bold', color: '#222' },
  scoreText: { fontSize: 12, marginTop: 5 },
  evalBox: { marginTop: 10, padding: 10, backgroundColor: '#fafafa', borderLeft: '3 solid #0056b3' },
  evalTopic: { fontSize: 12, fontWeight: 'bold', marginBottom: 5 },
  evalSummary: { fontSize: 10, color: '#444' }
});

export const DiagnosticDocument = ({ sessionData, evaluations, history }: any) => {
  const safeText = (text: string) => text ? text.replace(/[\u2018\u2019]/g, "'").replace(/[\u201C\u201D]/g, '"') : '';

  const totalScore = evaluations?.reduce((acc: number, curr: any) => acc + curr.rating_total, 0) || 0;
  const maxScore = (evaluations?.length || 5) * 5;

  // 1. Group evaluations by Domain
  const resumeEvals = evaluations?.filter((ev: any) => ev.topic === "Resume Intro" || ev.topic === "Resume") || [];
  const techEvals = evaluations?.filter((ev: any) => ev.topic !== "Resume Intro" && ev.topic !== "Resume") || [];

  const resumeAvg = resumeEvals.length > 0 
    ? (resumeEvals.reduce((acc: number, curr: any) => acc + curr.rating_total, 0) / resumeEvals.length).toFixed(1)
    : 'N/A';
  
  const techAvg = techEvals.length > 0 
    ? (techEvals.reduce((acc: number, curr: any) => acc + curr.rating_total, 0) / techEvals.length).toFixed(1)
    : 'N/A';

  // 2. Aggregate missing keywords
  const missingKeywordsSet = new Set<string>();
  evaluations?.forEach((ev: any) => {
    ev.missing_keywords?.forEach((kw: string) => {
      if (kw && kw.trim()) missingKeywordsSet.add(kw.trim());
    });
  });
  const allMissingKeywords = Array.from(missingKeywordsSet);

  // 3. Aggregate common mistakes/weaknesses
  const detectedMistakesSet = new Set<string>();
  evaluations?.forEach((ev: any) => {
    ev.detected_mistakes?.forEach((m: string) => {
      if (m && m.trim()) detectedMistakesSet.add(m.trim());
    });
  });
  const detectedMistakesList = Array.from(detectedMistakesSet);

  // 4. Strengths & Weaknesses
  const sortedEvals = evaluations ? [...evaluations].sort((a: any, b: any) => b.rating_total - a.rating_total) : [];
  const strengths = sortedEvals.filter((ev: any) => ev.rating_total >= 3.5).map((ev: any) => ev.topic);
  const weaknesses = sortedEvals.filter((ev: any) => ev.rating_total < 3.0).map((ev: any) => ev.topic);

  return (
    <Document>
      <Page size="A4" style={styles.page}>
         <View style={styles.section}>
            <Text style={styles.header}>Technical Diagnostic Report</Text>
            <View style={styles.row}>
               <Text style={styles.label}>Candidate Name:</Text>
               <Text style={styles.value}>{safeText(sessionData?.name)}</Text>
            </View>
            <View style={styles.row}>
               <Text style={styles.label}>Domain & Level:</Text>
               <Text style={styles.value}>{sessionData?.domain} - {sessionData?.level}</Text>
            </View>
            <View style={styles.row}>
               <Text style={styles.label}>Date:</Text>
               <Text style={styles.value}>{new Date().toLocaleDateString()}</Text>
            </View>
         </View>

         <View style={styles.section}>
            <Text style={styles.title}>ATS Hireability Profile</Text>
            <View style={styles.row}>
               <Text style={styles.label}>Final ATS Score:</Text>
               <Text style={styles.value}>{sessionData?.ats_score} / 100</Text>
            </View>
            <View style={styles.row}>
               <Text style={styles.label}>Recommendation Impact:</Text>
               <Text style={styles.value}>{sessionData?.rec_strength || 'No recommendation boost detected.'}</Text>
            </View>
            <View style={styles.row}>
               <Text style={styles.label}>Missing Skills/Gaps:</Text>
               <Text style={styles.value}>{sessionData?.gap_analysis?.join(', ') || 'None identified'}</Text>
            </View>
         </View>

         <View style={styles.section}>
            <Text style={styles.title}>Domain-wise Assessment</Text>
            <View style={styles.row}>
               <Text style={styles.label}>Resume & Intro Average:</Text>
               <Text style={styles.value}>{resumeAvg} / 5</Text>
            </View>
            <View style={styles.row}>
               <Text style={styles.label}>Technical Skills Average:</Text>
               <Text style={styles.value}>{techAvg} / 5</Text>
            </View>
         </View>

         <View style={styles.section}>
            <Text style={styles.title}>Detailed Analysis & Insights</Text>
            <View style={{ marginBottom: 6 }}>
               <Text style={{ fontSize: 11, fontWeight: 'bold', color: '#2b6cb0' }}>Identified Strengths:</Text>
               <Text style={{ fontSize: 10, color: '#2d3748', marginTop: 2 }}>
                  {strengths.length > 0 ? strengths.join(', ') : 'None identified. Focus on conceptual clarity.'}
               </Text>
            </View>
            <View style={{ marginBottom: 6 }}>
               <Text style={{ fontSize: 11, fontWeight: 'bold', color: '#c53030' }}>Areas for Improvement:</Text>
               <Text style={{ fontSize: 10, color: '#2d3748', marginTop: 2 }}>
                  {weaknesses.length > 0 ? weaknesses.join(', ') : 'No major weaknesses identified.'}
               </Text>
            </View>
            {allMissingKeywords.length > 0 && (
               <View style={{ marginBottom: 6 }}>
                  <Text style={{ fontSize: 11, fontWeight: 'bold', color: '#dd6b20' }}>Missing Keywords / Concepts:</Text>
                  <Text style={{ fontSize: 10, color: '#2d3748', marginTop: 2 }}>
                     {allMissingKeywords.join(', ')}
                  </Text>
               </View>
            )}
            {detectedMistakesList.length > 0 && (
               <View>
                  <Text style={{ fontSize: 11, fontWeight: 'bold', color: '#e53e3e' }}>Flagged Mistakes:</Text>
                  <Text style={{ fontSize: 10, color: '#2d3748', marginTop: 2 }}>
                     {detectedMistakesList.join(', ')}
                  </Text>
               </View>
            )}
         </View>

         <View style={styles.section}>
            <Text style={styles.title}>Interview Performance Breakdown</Text>
            {evaluations?.map((ev: any, idx: number) => (
               <View key={idx} style={styles.evalBox}>
                  <Text style={styles.evalTopic}>Q{idx + 1}: {safeText(ev.topic)} (Score: {ev.rating_total}/5)</Text>
                  <Text style={styles.evalSummary}>{safeText(ev.summary)}</Text>
                  <Text style={{ fontSize: 9, marginTop: 4, color: '#666' }}>
                     Impacts - Tech: {ev.impact_tech} | Comm: {ev.impact_comm} | Resume: {ev.impact_res}
                  </Text>
               </View>
            ))}
         </View>

         <View style={styles.scoreBox}>
            <Text style={styles.scoreTitle}>Final Weighted Assessment</Text>
            <Text style={styles.scoreText}>Cumulative Score: {totalScore} / {maxScore}</Text>
         </View>
      </Page>
    </Document>
  );
};

export const PanelDiagnosticDocument = ({ report, transcript }: any) => {
  const safeText = (text: string) => text ? text.replace(/[\u2018\u2019]/g, "'").replace(/[\u201C\u201D]/g, '"') : '';

  return (
    <Document>
      <Page size="A4" style={styles.page}>
         <View style={styles.section}>
            <Text style={styles.header}>Game of Fours - Panel Interview Report</Text>
            <View style={styles.row}>
               <Text style={styles.label}>Date:</Text>
               <Text style={styles.value}>{new Date().toLocaleDateString()}</Text>
            </View>
            <View style={styles.row}>
               <Text style={styles.label}>Total Questions:</Text>
               <Text style={styles.value}>{transcript ? transcript.length / 2 : 0}</Text>
            </View>
         </View>

         <View style={styles.section}>
            <Text style={styles.title}>Panel Verdict</Text>
            <View style={styles.row}>
               <Text style={styles.label}>Overall Score:</Text>
               <Text style={styles.value}>{report?.overall_score || 0} / 100</Text>
            </View>
            <View style={{ marginTop: 10 }}>
               <Text style={{ fontSize: 11, fontWeight: 'bold', color: '#2b6cb0' }}>Verdict:</Text>
               <Text style={{ fontSize: 10, color: '#2d3748', marginTop: 4 }}>{safeText(report?.verdict)}</Text>
            </View>
         </View>

         <View style={styles.section}>
            <Text style={styles.title}>Feedback Summary</Text>
            <View style={{ marginBottom: 10 }}>
               <Text style={{ fontSize: 11, fontWeight: 'bold', color: '#38a169' }}>Strengths:</Text>
               <Text style={{ fontSize: 10, color: '#2d3748', marginTop: 4 }}>
                  {report?.strengths?.length > 0 ? report.strengths.join(', ') : 'None identified.'}
               </Text>
            </View>
            <View>
               <Text style={{ fontSize: 11, fontWeight: 'bold', color: '#e53e3e' }}>Weaknesses:</Text>
               <Text style={{ fontSize: 10, color: '#2d3748', marginTop: 4 }}>
                  {report?.weaknesses?.length > 0 ? report.weaknesses.join(', ') : 'None identified.'}
               </Text>
            </View>
         </View>

         <View style={styles.section}>
            <Text style={styles.title}>Individual Panelist Feedback</Text>
            <View style={styles.evalBox}>
               <Text style={styles.evalTopic}>June (HR & Teamwork)</Text>
               <Text style={styles.evalSummary}>{safeText(report?.june_feedback)}</Text>
            </View>
            <View style={styles.evalBox}>
               <Text style={styles.evalTopic}>Bryan (Technical & Architecture)</Text>
               <Text style={styles.evalSummary}>{safeText(report?.bryan_feedback)}</Text>
            </View>
            <View style={styles.evalBox}>
               <Text style={styles.evalTopic}>Graham (Product & User Experience)</Text>
               <Text style={styles.evalSummary}>{safeText(report?.graham_feedback)}</Text>
            </View>
            <View style={styles.evalBox}>
               <Text style={styles.evalTopic}>Alessandra (Business & Leadership)</Text>
               <Text style={styles.evalSummary}>{safeText(report?.alessandra_feedback)}</Text>
            </View>
         </View>
      </Page>
    </Document>
  );
};
