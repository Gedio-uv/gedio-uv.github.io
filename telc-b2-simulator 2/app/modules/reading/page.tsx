'use client';
import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Loader2, CheckCircle2, XCircle } from 'lucide-react';
import styles from '../modules.module.css';
import { saveProgress } from '../../../lib/supabaseClient';
import { useExam } from '../../context/ExamContext';

type ExamData = {
  title: string;
  instructions: string;
  headlines: string[];
  texts: {
    id: string;
    content: string;
    correctHeadlineIndex: number;
  }[];
};

export default function ReadingModule() {
  const router = useRouter();
  const { mode, examData: globalExamData, setExamData: setGlobalExamData } = useExam();
  
  const [examData, setExamData] = useState<ExamData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Track selected answers: mapping text index to selected headline index
  const [answers, setAnswers] = useState<Record<number, number>>({});
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [score, setScore] = useState({ correct: 0, total: 0 });

  const [aiFeedback, setAiFeedback] = useState<any>(null);
  const [loadingFeedback, setLoadingFeedback] = useState(false);

  const generateExam = async () => {
    setLoading(true);
    setError(null);
    setExamData(null);
    setAnswers({});
    setIsSubmitted(false);
    setAiFeedback(null);
    
    try {
      const res = await fetch('/api/generate-reading', { method: 'POST' });
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

  const handleSelectAnswer = (textIndex: number, headlineIndex: number) => {
    if (isSubmitted) return;
    setAnswers(prev => ({
      ...prev,
      [textIndex]: headlineIndex
    }));
  };

  const submitExam = async () => {
    if (!examData) return;

    if (mode === 'practice') {
      let correctCount = 0;
      examData.texts.forEach((text, idx) => {
        if (answers[idx] === text.correctHeadlineIndex) {
          correctCount++;
        }
      });
      
      setScore({ correct: correctCount, total: examData.texts.length });
      setIsSubmitted(true);
      
      // Fetch AI Feedback
      setLoadingFeedback(true);
      try {
        const res = await fetch('/api/generate-feedback', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            moduleType: 'Leseverstehen Teil 1',
            examData: examData,
            userAnswers: answers
          })
        });
        const data = await res.json();
        if (res.ok) {
          setAiFeedback(data.feedback);
          await saveProgress('Leseverstehen', correctCount / examData.texts.length * 100, data.feedback);
        }
      } catch (e) {
        console.error("Failed to fetch feedback", e);
      } finally {
        setLoadingFeedback(false);
      }

    } else if (mode === 'exam') {
      // In exam mode, we save the answers globally and go to the next module
      setGlobalExamData({
        ...globalExamData,
        reading: {
          data: examData,
          answers: answers
        }
      });
      setIsSubmitted(true); // Locks the UI
      router.push('/modules/grammar'); // Next section
    }
  };

  // Check if all texts have an answer
  const allAnswered = examData ? Object.keys(answers).length === examData.texts.length : false;

  return (
    <div className="page-container">
      <header className={styles.moduleHeader}>
        <Link href="/" className={styles.backBtn}>
          <ArrowLeft size={16} /> Zurück zum Dashboard
        </Link>
        <div className={`panel ${styles.timer}`}>
          <span>Verbleibende Zeit:</span>
          <strong>90:00</strong>
        </div>
      </header>

      <div className={styles.moduleContentWrapper}>
        {!examData && (
          <div className={`panel ${styles.instructions}`}>
            <h2>Leseverstehen & Sprachbausteine</h2>
            <p>
              Dieses Modul besteht aus 3 Teilen zum Leseverstehen und 2 Teilen zu Sprachbausteinen (Grammatik).
              Sie haben insgesamt 90 Minuten Zeit, um alle Aufgaben zu bearbeiten.
            </p>
            <p style={{ marginTop: '12px', color: 'var(--text-secondary)' }}>
              Modus: <strong>{mode === 'practice' ? 'Einzelmodus (Feedback aktiviert)' : 'Prüfungsmodus (Strikt)'}</strong>
            </p>
            
            {error && (
              <div style={{ color: '#ef4444', marginTop: '16px', padding: '12px', background: 'rgba(239, 68, 68, 0.1)', borderRadius: '6px' }}>
                {error}
              </div>
            )}

            <div className={styles.mt4}>
              <button className="btn-primary" onClick={generateExam} disabled={loading || !mode}>
                {loading ? <><Loader2 className="animate-spin" size={16} /> Generiere...</> : 'Prüfung mit KI generieren und starten'}
              </button>
              {!mode && <p style={{color: 'red', marginTop: '8px'}}>Bitte wählen Sie zuerst einen Modus im Dashboard.</p>}
            </div>
          </div>
        )}

        {examData && (
          <div className="panel" style={{ padding: '32px' }}>
            <h2 style={{ marginBottom: '16px' }}>{examData.title}</h2>
            <p style={{ color: 'var(--text-secondary)', marginBottom: '32px', fontSize: '15px' }}>
              {examData.instructions}
            </p>
            
            <div style={{ display: 'grid', gap: '32px' }}>
              {/* Headlines Grid */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                {examData.headlines.map((headline, idx) => (
                  <div key={idx} className="panel" style={{ padding: '12px 16px', fontSize: '14px', background: 'var(--bg-secondary)' }}>
                    <strong style={{ color: 'var(--text-primary)' }}>{String.fromCharCode(65 + idx)}</strong>. {headline}
                  </div>
                ))}
              </div>

              {/* Texts and Answer selection */}
              <div style={{ display: 'grid', gap: '32px', marginTop: '16px' }}>
                {examData.texts.map((text, idx) => (
                  <div key={text.id} style={{ 
                    paddingBottom: '32px', 
                    borderBottom: idx < examData.texts.length - 1 ? '1px solid var(--border-color)' : 'none' 
                  }}>
                    <div style={{ display: 'flex', gap: '16px', alignItems: 'flex-start' }}>
                      <div style={{ 
                        background: 'var(--text-primary)', 
                        color: 'var(--bg-primary)', 
                        padding: '4px 12px', 
                        borderRadius: '6px', 
                        fontWeight: 'bold',
                        marginTop: '4px'
                      }}>
                        {idx + 1}
                      </div>
                      <div style={{ flex: 1 }}>
                        <p style={{ lineHeight: '1.7', fontSize: '15px', marginBottom: '20px' }}>{text.content}</p>
                        
                        <div style={{ display: 'flex', alignItems: 'center', gap: '16px', flexWrap: 'wrap' }}>
                          <span style={{ fontSize: '14px', color: 'var(--text-secondary)' }}>Wählen Sie die Lösung:</span>
                          <div style={{ display: 'flex', gap: '8px' }}>
                            {examData.headlines.map((_, hIdx) => {
                              const isSelected = answers[idx] === hIdx;
                              const isCorrect = isSubmitted && mode === 'practice' && text.correctHeadlineIndex === hIdx;
                              const isWrongSelection = isSubmitted && mode === 'practice' && isSelected && answers[idx] !== text.correctHeadlineIndex;
                              
                              const btnStyle: React.CSSProperties = {
                                padding: '8px 16px',
                                borderRadius: '6px',
                                border: '1px solid var(--border-color)',
                                background: isSelected ? 'var(--text-primary)' : 'transparent',
                                color: isSelected ? 'var(--bg-primary)' : 'var(--text-primary)',
                                cursor: isSubmitted ? 'default' : 'pointer',
                                transition: 'all 0.2s ease',
                                fontWeight: '500',
                              };

                              if (isSubmitted && mode === 'practice') {
                                if (isCorrect) {
                                  btnStyle.background = 'rgba(34, 197, 94, 0.2)';
                                  btnStyle.border = '1px solid rgb(34, 197, 94)';
                                  btnStyle.color = 'rgb(34, 197, 94)';
                                } else if (isWrongSelection) {
                                  btnStyle.background = 'rgba(239, 68, 68, 0.2)';
                                  btnStyle.border = '1px solid rgb(239, 68, 68)';
                                  btnStyle.color = 'rgb(239, 68, 68)';
                                } else {
                                  btnStyle.opacity = '0.5';
                                }
                              } else if (isSubmitted && mode === 'exam' && !isSelected) {
                                btnStyle.opacity = '0.5';
                              }

                              return (
                                <button 
                                  key={hIdx}
                                  onClick={() => handleSelectAnswer(idx, hIdx)}
                                  style={btnStyle}
                                  disabled={isSubmitted}
                                  className={!isSubmitted ? 'hover-effect' : ''}
                                >
                                  {String.fromCharCode(65 + hIdx)}
                                </button>
                              );
                            })}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Submission Area */}
              <div style={{ 
                marginTop: '16px', 
                padding: '24px', 
                background: 'var(--bg-secondary)', 
                borderRadius: '8px',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: '16px'
              }}>
                {!isSubmitted ? (
                  <>
                    <p style={{ color: 'var(--text-secondary)', fontSize: '14px' }}>
                      {allAnswered 
                        ? (mode === 'practice' ? 'Sie haben alle Fragen beantwortet. Sie können jetzt abgeben.' : 'Sie haben alle Fragen beantwortet. Bereit für den nächsten Teil?')
                        : 'Bitte beantworten Sie alle Fragen, um fortzufahren.'}
                    </p>
                    <button 
                      className="btn-primary" 
                      disabled={!allAnswered}
                      onClick={submitExam}
                      style={{ width: '100%', maxWidth: '400px' }}
                    >
                      {mode === 'practice' ? 'Antworten auswerten' : 'Weiter zu Sprachbausteine (Grammatik)'}
                    </button>
                  </>
                ) : mode === 'practice' ? (
                  <div style={{ textAlign: 'center' }}>
                    <h3 style={{ marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '8px', justifyContent: 'center' }}>
                      {score.correct === score.total ? <CheckCircle2 color="rgb(34, 197, 94)" /> : <XCircle color="rgb(239, 68, 68)" />}
                      Ergebnis: {score.correct} von {score.total} richtig
                    </h3>
                    <p style={{ color: 'var(--text-secondary)', marginBottom: '24px' }}>
                      Die richtigen Antworten sind grün markiert.
                    </p>
                    
                    {loadingFeedback ? (
                      <div style={{ padding: '24px', background: 'var(--bg-primary)', borderRadius: '8px', marginBottom: '24px' }}>
                        <Loader2 className="animate-spin" size={24} style={{ margin: '0 auto 16px' }} />
                        <p style={{ fontSize: '14px', color: 'var(--text-secondary)' }}>KI analysiert Ihre Antworten...</p>
                      </div>
                    ) : aiFeedback ? (
                      <div style={{ padding: '24px', background: 'var(--bg-primary)', borderRadius: '8px', marginBottom: '24px', textAlign: 'left' }}>
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
                      style={{ background: 'transparent', border: '1px solid var(--border-color)', color: 'var(--text-primary)' }}
                    >
                      Neue Prüfung generieren
                    </button>
                  </div>
                ) : (
                   <div style={{ textAlign: 'center' }}>
                    <Loader2 className="animate-spin" size={24} style={{ margin: '0 auto 16px' }} />
                    <p>Lade nächsten Abschnitt...</p>
                  </div>
                )}
              </div>

            </div>
          </div>
        )}
      </div>
    </div>
  );
}
