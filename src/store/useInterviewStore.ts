import { create } from 'zustand';

export interface SessionData {
  name: string;
  email: string;
  branch: string;
  domain: string;
  level: string;
  resumeText: string;
  ats_score?: number;
  rec_strength?: number;
  gap_analysis?: string[];
  impact_score?: number;
}

export interface QuestionEvaluation {
  topic: string;
  rating_total: number;
  dim_technical: number;
  dim_communication: number;
  dim_resume: number;
  impact_tech: number;
  impact_comm: number;
  impact_res: number;
  summary: string;
  missing_keywords?: string[];
  detected_mistakes?: string[];
}

interface InterviewState {
  sessionData: SessionData | null;
  setSessionData: (data: Partial<SessionData>) => void;

  // Real-time interview state
  topic_idx: number;
  follow_up_count: number;
  proctor_lives: number;
  startTime: number | null;
  evaluations: QuestionEvaluation[];
  isDisqualified: boolean;
  terminationReason: string | null;
  isComplete: boolean;

  behavioral_warnings: number;

  // Actions
  nextTopic: () => void;
  incrementFollowUp: () => void;
  deductLife: (reason: string) => void;
  addEvaluation: (evalData: QuestionEvaluation) => void;
  incrementBehavioralWarning: () => void;
  startInterview: () => void;
  terminateInterview: (reason: string) => void;
  completeInterview: () => void;
  resetInterview: () => void;
}

export const useInterviewStore = create<InterviewState>((set) => ({
  sessionData: null,
  setSessionData: (data) => set((state) => ({
    sessionData: { ...state.sessionData, ...data } as SessionData
  })),

  topic_idx: 0,
  follow_up_count: 0,
  proctor_lives: 3,
  behavioral_warnings: 0,
  startTime: null,
  evaluations: [],
  isDisqualified: false,
  terminationReason: null,
  isComplete: false,

  nextTopic: () => set((state) => ({ topic_idx: state.topic_idx + 1, follow_up_count: 0 })),
  incrementFollowUp: () => set((state) => ({ follow_up_count: state.follow_up_count + 1 })),
  deductLife: (reason) => set((state) => {
    const newLives = state.proctor_lives - 1;
    if (newLives <= 0) {
      return { proctor_lives: 0, isDisqualified: true, terminationReason: `0 lives remaining. Last infraction: ${reason}`, isComplete: true };
    }
    return { proctor_lives: newLives };
  }),
  addEvaluation: (evalData) => set((state) => ({ evaluations: [...state.evaluations, evalData] })),
  incrementBehavioralWarning: () => set((state) => ({ behavioral_warnings: state.behavioral_warnings + 1 })),
  startInterview: () => set({
    topic_idx: 0,
    follow_up_count: 0,
    proctor_lives: 3,
    behavioral_warnings: 0,
    startTime: Date.now(),
    evaluations: [],
    isDisqualified: false,
    terminationReason: null,
    isComplete: false,
  }),
  terminateInterview: (reason) => set({ isDisqualified: true, terminationReason: reason, isComplete: true }),
  completeInterview: () => set({ isComplete: true }),
  resetInterview: () => set({
    topic_idx: 0,
    follow_up_count: 0,
    proctor_lives: 3,
    behavioral_warnings: 0,
    startTime: null,
    evaluations: [],
    isDisqualified: false,
    terminationReason: null,
    isComplete: false,
    sessionData: null,
  })
}));
