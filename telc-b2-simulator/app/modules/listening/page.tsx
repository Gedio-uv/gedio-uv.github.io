'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Loader2, Play, Square } from 'lucide-react';
import { useExam } from '../../context/ExamContext';
import { saveProgress } from '../../../lib/supabaseClient';

export default function ListeningModule() {
  const router = useRouter();
  const { mode, globalExamData, setGlobalExamData } = useExam();
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [examData, setExamData] = useState<any>(null);
  
  // Track selected answer for each question (question.id -> optionIndex)
  const [answers, setAnswers] = useState<Record<number, number>>({});
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [score, setScore] = useState({ correct: 0, total: 0 });
  
  const [aiFeedback, setAiFeedback] = useState<any>(null);
  const [loadingFeedback, setLoadingFeedback] = useState(false);

  if (!mode) {
    router.push('/');
    return null;
  }

  const generateExam = async () => {
    setLoading(true);
    setError(null);
    setExamData(null);
    setAnswers({});
    setIsSubmitted(false);
    setAiFeedback(null);
    
    try {
      const res = await fetch('/api/generate-listening', { method: 'POST' });
      const data = await res.json();
      
      if (!res.ok) {
        throw new Error(data.error || 'Fehler beim Generieren der Prüfung');
      }
      
      setExamData(data.exam);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSelectAnswer = (questionId: number, optionIndex: number) => {
    if (isSubmitted) return;
    setAnswers(prev => ({
      ...prev,
      [questionId]: optionIndex
    }));
  };

  const submitExam = async () => {
    if (!examData) return;

    if (mode === 'practice') {
      let correctCount = 0;
      examData.questions.forEach((q: any) => {
        if (answers[q.id] === q.correctOptionIndex) {
          correctCount++;
        }
      });
      
      setScore({ correct: correctCount, total: examData.questions.length });
      setIsSubmitted(true);

      // Fetch AI Feedback
      setLoadingFeedback(true);
      try {
        const res = await fetch('/api/generate-feedback', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            moduleType: 'Hörverstehen Teil 1',
            examData: examData,
            userAnswers: answers
          })
        });
        const data = await res.json();
        if (res.ok) {
          setAiFeedback(data.feedback);
          await saveProgress('Hörverstehen', correctCount / examData.questions.length * 100, data.feedback);
        }
      } catch (e) {
        console.error("Failed to fetch feedback", e);
      } finally {
        setLoadingFeedback(false);
      }

    } else if (mode === 'exam') {
      setGlobalExamData({
        ...globalExamData,
        listening: {
          data: examData,
          answers: answers
        }
      });
      setIsSubmitted(true);
      router.push('/modules/writing'); // Next section (assuming writing is next)
    }
  };

  const allAnswered = examData ? Object.keys(answers).length === examData.questions.length : false;

  return (
    <div className="page-container fade-in">
      <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '48px' }}>
        <Link href="/" style={{ color: 'var(--text-secondary)', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '8px', fontSize: '14px' }}>
          <ArrowLeft size={16} /> Zurück zum Dashboard
        </Link>
        {mode === 'exam' && (
          <div style={{ color: 'var(--text-primary)', fontSize: '14px', background: 'var(--bg-secondary)', padding: '8px 16px', borderRadius: '24px' }}>
            Verbleibende Zeit: <strong>20:00</strong>
          </div>
        )}
      </header>

      {!examData && !loading && (
        <div className="panel" style={{ textAlign: 'center', padding: '64px 24px' }}>
          <h2 style={{ marginBottom: '16px' }}>Hörverstehen</h2>
          <p style={{ color: 'var(--text-secondary)', marginBottom: '32px', maxWidth: '600px', margin: '0 auto 32px' }}>
            In diesem Modul hören Sie einen kurzen Text (Audio). Danach lösen Sie dazu 5 Aufgaben. 
            Bitte stellen Sie sicher, dass Ihr Ton eingeschaltet ist.
          </p>
          <button className="btn-primary" onClick={generateExam}>
            {mode === 'exam' ? 'Prüfungsteil starten' : 'Übung generieren'}
          </button>
        </div>
      )}

      {loading && (
        <div className="panel" style={{ textAlign: 'center', padding: '64px 24px' }}>
          <Loader2 className="animate-spin" size={48} style={{ margin: '0 auto 24px', color: 'var(--text-primary)' }} />
          <h2>Prüfung wird generiert...</h2>
          <p style={{ color: 'var(--text-secondary)', marginTop: '16px' }}>Bitte haben Sie einen Moment Geduld.</p>
        </div>
      )}

      {error && (
        <div className="panel" style={{ textAlign: 'center', padding: '64px 24px' }}>
          <h2 style={{ color: '#ef4444', marginBottom: '16px' }}>Fehler aufgetreten</h2>
          <p style={{ color: 'var(--text-secondary)', marginBottom: '32px' }}>{error}</p>
          <button className="btn-primary" onClick={generateExam}>Erneut versuchen</button>
        </div>
      )}

      {examData && !loading && (
        <div className="panel" style={{ padding: '48px' }}>
          <div style={{ marginBottom: '48px' }}>
            <h2 style={{ marginBottom: '16px', fontSize: '28px' }}>{examData.title}</h2>
            <p style={{ color: 'var(--text-secondary)', fontSize: '16px' }}>{examData.instructions}</p>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '48px', alignItems: 'start' }}>
            
            {/* Audio Player Area */}
            <div style={{ 
              position: 'sticky', 
              top: '120px', 
              background: 'var(--bg-secondary)', 
              padding: '32px', 
              borderRadius: '12px',
              textAlign: 'center'
            }}>
              <h3 style={{ marginBottom: '24px' }}>Audiowiedergabe</h3>
              <div style={{ display: 'flex', justifyContent: 'center', width: '100%' }}>
                <audio 
                  controls 
                  src={examData.audioUrl} 
                  style={{ width: '100%', outline: 'none' }}
                  controlsList="nodownload"
                >
                  Ihr Browser unterstützt das Audio-Element nicht.
                </audio>
              </div>
              <p style={{ marginTop: '16px', fontSize: '14px', color: 'var(--text-secondary)' }}>
                Klicken Sie auf Play, um das Interview zu hören.
              </p>
              
              {isSubmitted && mode === 'practice' && (
                <div style={{ marginTop: '32px', textAlign: 'left', borderTop: '1px solid #333', paddingTop: '24px' }}>
                  <h4 style={{ marginBottom: '12px' }}>Transkript (Nur zur Übung):</h4>
                  <p style={{ fontSize: '14px', lineHeight: '1.6', color: 'var(--text-secondary)', whiteSpace: 'pre-wrap' }}>
                    {examData.transcript}
                  </p>
                </div>
              )}
            </div>

            {/* Questions Area */}
            <div>
              {examData.questions.map((q: any) => (
                <div key={q.id} style={{ 
                  background: 'var(--bg-secondary)', 
                  padding: '24px', 
                  borderRadius: '12px', 
                  marginBottom: '24px',
                  border: isSubmitted ? (answers[q.id] === q.correctOptionIndex ? '1px solid #10b981' : '1px solid #ef4444') : '1px solid transparent'
                }}>
                  <p style={{ fontWeight: '500', marginBottom: '16px', lineHeight: '1.5' }}>
                    {q.id}. {q.statement}
                  </p>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                    {q.options.map((opt: string, optIdx: number) => {
                      const isSelected = answers[q.id] === optIdx;
                      const isCorrect = q.correctOptionIndex === optIdx;
                      
                      let btnStyle: any = {
                        padding: '12px 16px',
                        borderRadius: '8px',
                        border: '1px solid #333',
                        background: isSelected ? 'var(--bg-primary)' : 'transparent',
                        color: isSelected ? 'var(--text-primary)' : 'var(--text-secondary)',
                        textAlign: 'left' as const,
                        cursor: isSubmitted ? 'default' : 'pointer',
                        transition: 'all 0.2s',
                        fontSize: '15px'
                      };

                      if (isSubmitted && mode === 'practice') {
                        if (isCorrect) {
                          btnStyle.background = 'rgba(16, 185, 129, 0.1)';
                          btnStyle.border = '1px solid #10b981';
                          btnStyle.color = '#10b981';
                        } else if (isSelected && !isCorrect) {
                          btnStyle.background = 'rgba(239, 68, 68, 0.1)';
                          btnStyle.border = '1px solid #ef4444';
                          btnStyle.color = '#ef4444';
                        }
                      }

                      return (
                        <button 
                          key={optIdx} 
                          style={btnStyle}
                          onClick={() => handleSelectAnswer(q.id, optIdx)}
                        >
                          {opt}
                        </button>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
            
          </div>

          {/* Submission Area */}
          <div style={{ marginTop: '48px', textAlign: 'center', borderTop: '1px solid #333', paddingTop: '48px' }}>
            {!isSubmitted ? (
              <>
                {!allAnswered && (
                  <p style={{ color: 'var(--text-secondary)', marginBottom: '16px' }}>
                    Bitte beantworten Sie alle Fragen, um fortzufahren.
                  </p>
                )}
                <button 
                  className={allAnswered ? 'btn-primary' : 'btn-secondary'} 
                  onClick={submitExam}
                  disabled={!allAnswered}
                >
                  {mode === 'exam' ? 'Nächster Teil (Schreiben)' : 'Antworten auswerten'}
                </button>
              </>
            ) : (
              <div>
                {mode === 'practice' && (
                  <>
                    <h3 style={{ fontSize: '24px', marginBottom: '16px' }}>
                      Ergebnis: {score.correct} von {score.total} richtig
                    </h3>
                    <p style={{ color: 'var(--text-secondary)', marginBottom: '24px' }}>
                      Die richtigen Antworten sind grün markiert. Das Transkript des Audios ist nun auf der linken Seite sichtbar.
                    </p>

                    {loadingFeedback ? (
                      <div style={{ padding: '24px', background: 'var(--bg-primary)', borderRadius: '8px', marginBottom: '24px', width: '100%', maxWidth: '800px', margin: '0 auto 24px' }}>
                        <Loader2 className="animate-spin" size={24} style={{ margin: '0 auto 16px' }} />
                        <p style={{ fontSize: '14px', color: 'var(--text-secondary)' }}>KI analysiert Ihre Antworten...</p>
                      </div>
                    ) : aiFeedback ? (
                      <div style={{ padding: '24px', background: 'var(--bg-primary)', borderRadius: '8px', marginBottom: '24px', textAlign: 'left', width: '100%', maxWidth: '800px', margin: '0 auto 24px' }}>
                        <h4 style={{ marginBottom: '16px', color: 'var(--text-primary)' }}>KI-Analyse</h4>
                        <p style={{ fontWeight: 'bold', marginBottom: '16px' }}>{aiFeedback.scoreSummary}</p>
                        
                        {aiFeedback.mistakesAnalysis && aiFeedback.mistakesAnalysis.length > 0 && (
                          <div style={{ marginBottom: '16px' }}>
                            <strong style={{ color: '#ef4444' }}>Fehleranalyse:</strong>
                            <ul style={{ marginTop: '8px', paddingLeft: '20px', fontSize: '14px', color: 'var(--text-secondary)', lineHeight: '1.6' }}>
                              {aiFeedback.mistakesAnalysis.map((mistake: any, i: number) => (
                                <li key={i} style={{ marginBottom: '8px' }}>
                                  <strong>Frage {mistake.questionId}:</strong> {mistake.explanation}
                                  {mistake.keyVocabulary && mistake.keyVocabulary.length > 0 && (
                                    <div style={{ marginTop: '4px', display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                                      Vokabeln: {mistake.keyVocabulary.map((v: string) => (
                                        <span key={v} style={{ background: 'var(--bg-secondary)', padding: '2px 6px', borderRadius: '4px', fontSize: '12px' }}>{v}</span>
                                      ))}
                                    </div>
                                  )}
                                </li>
                              ))}
                            </ul>
                          </div>
                        )}
                        
                        {aiFeedback.recommendations && (
                          <div>
                            <strong style={{ color: '#3b82f6' }}>Empfehlungen:</strong>
                            <ul style={{ marginTop: '8px', paddingLeft: '20px', fontSize: '14px', color: 'var(--text-secondary)', lineHeight: '1.6' }}>
                              {aiFeedback.recommendations.map((rec: string, i: number) => (
                                <li key={i}>{rec}</li>
                              ))}
                            </ul>
                          </div>
                        )}
                      </div>
                    ) : null}

                    <button 
                      className="btn-primary" 
                      onClick={generateExam}
                    >
                      Neue Übung generieren
                    </button>
                  </>
                )}
              </div>
            )}
          </div>

        </div>
      )}
    </div>
  );
}
