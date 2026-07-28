'use client';
import { createContext, useContext, useState, ReactNode } from 'react';

type Mode = 'practice' | 'exam' | null;

interface ExamContextType {
  mode: Mode;
  setMode: (mode: Mode) => void;
  examData: any; // Will hold global exam state later (answers across modules)
  setExamData: (data: any) => void;
}

const ExamContext = createContext<ExamContextType | undefined>(undefined);

export function ExamProvider({ children }: { children: ReactNode }) {
  const [mode, setMode] = useState<Mode>(null);
  const [examData, setExamData] = useState<any>({});

  return (
    <ExamContext.Provider value={{ mode, setMode, examData, setExamData }}>
      {children}
    </ExamContext.Provider>
  );
}

export function useExam() {
  const context = useContext(ExamContext);
  if (context === undefined) {
    throw new Error('useExam must be used within an ExamProvider');
  }
  return context;
}
