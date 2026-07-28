'use client';
import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Loader2, CheckCircle2, XCircle } from 'lucide-react';
import styles from '../modules.module.css';
import { saveProgress } from '../../../lib/supabaseClient';
import { useExam } from '../../context/ExamContext';

type GrammarData = {
  title: string;
  instructions: string;
  text: string;
  blanks: {
    id: number;
    options: string[];
    correctOptionIndex: number;
  }[];
};

export default function GrammarModule() {
  const router = useRouter();
  const { mode, examData: globalExamData, setExamData: setGlobalExamData } = useExam();
  
  const [examData, setExamData] = useState<GrammarData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Track selected answers: mapping blank id (1-10) to selected option index (0-2)
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
      const res = await fetch('/api/generate-grammar', { method: 'POST' });
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

  const handleSelectAnswer = (blankId: number, optionIndex: number) => {
    if (isSubmitted) return;
    setAnswers(prev => ({
      ...prev,
      [blankId]: optionIndex
    }));
  };

  const submitExam = async () => {
    if (!examData) return;

    if (mode === 'practice') {
      let correctCount = 0;
      examData.blanks.forEach((blank) => {
        if (answers[blank.id] === blank.correctOptionIndex) {
          correctCount++;
        }
      });
      
      setScore({ correct: correctCount, total: examData.blanks.length });
      setIsSubmitted(true);

      // Fetch AI Feedback
      setLoadingFeedback(true);
      try {
        const res = await fetch('/api/generate-feedback', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            moduleType: 'Sprachbausteine Teil 1',
            examData: examData,
            userAnswers: answers
          })
        });
        const data = await res.json();
        if (res.ok) {
          setAiFeedback(data.feedback);
          await saveProgress('Sprachbausteine', correctCount / examData.blanks.length * 100, data.feedback);
        }
      } catch (e) {
        console.error("Failed to fetch feedback", e);
      } finally {
        setLoadingFeedback(false);
      }

    } else if (mode === 'exam') {
      setGlobalExamData({
        ...globalExamData,
        grammar: {
          data: examData,
          answers: answers
        }
      });
      setIsSubmitted(true);
      router.push('/modules/listening'); // Next section (assuming listening is next)
    }
  };

  const allAnswered = examData ? Object.keys(answers).length === examData.blanks.length : false;

  // Format the text by replacing [1], [2] with stylized inline blocks
  const renderFormattedText = (text: string) => {
    const parts = text.split(/(\[\d+\])/g);
    
    return parts.map((part, index) => {
      const match = part.match(/\[(\d+)\]/);
      if (match) {
        const blankId = parseInt(match[1]);
        const isAnswered = answers[blankId] !== undefined;
        let selectedWord = isAnswered && examData ? examData.blanks.find(b => b.id === blankId)?.options[answers[blankId]] : '_____';

        return (
          <span key={index} style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '8px',
            margin: '0 4px',
            padding: '2px 8px',
            background: isAnswered ? 'var(--text-primary)' : 'var(--bg-secondary)',
            color: isAnswered ? 'var(--bg-primary)' : 'var(--text-primary)',
            borderRadius: '4px',
            fontWeight: 'bold',
            border: '1px solid var(--border-color)',
            transition: 'all 0.2s ease'
          }}>
            <span style={{ fontSize: '12px', opacity: 0.7 }}>{blankId}</span>
            {selectedWord}
          </span>
        );
      }
      return <span key={index}>{part}</span>;
    });
  };

  return (
    <div className="page-container">
      <header className={styles.moduleHeader}>
        <Link href="/" className={styles.backBtn}>
          <ArrowLeft size={16} /> Zurück zum Dashboard
        </Link>
        <div className={`panel ${styles.timer}`}>
          <span>Verbleibende Zeit:</span>
          <strong>60:00</strong> {/* Or whatever time remains */}
        </div>
      </header>

      <div className={styles.moduleContentWrapper}>
        {!examData && (
          <div className={`panel ${styles.instructions}`}>
            <h2>Sprachbausteine Teil 1</h2>
            <p>
              Lesen Sie den Text und entscheiden Sie, welches Wort (a, b oder c) in die jeweilige Lücke passt.
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
            
            <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 0.8fr', gap: '48px', alignItems: 'start' }}>
              
              {/* Text Area */}
              <div style={{ 
                position: 'sticky', 
                top: '120px', 
                lineHeight: '2', 
                fontSize: '16px', 
                color: 'var(--text-primary)', 
                whiteSpace: 'pre-wrap'
              }}>
                {renderFormattedText(examData.text)}
              </div>

              {/* Options Area */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                <h3 style={{ fontSize: '16px', marginBottom: '8px' }}>Optionen</h3>
                
                {examData.blanks.map((blank) => {
                  return (
                    <div key={blank.id} className="panel" style={{ padding: '16px', background: 'var(--bg-secondary)' }}>
                      <div style={{ fontWeight: 'bold', marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <span style={{ 
                          width: '24px', height: '24px', 
                          display: 'flex', alignItems: 'center', justifyContent: 'center',
                          background: 'var(--text-primary)', color: 'var(--bg-primary)',
                          borderRadius: '50%', fontSize: '12px'
                        }}>
                          {blank.id}
                        </span>
                      </div>
                      
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                        {blank.options.map((opt, oIdx) => {
                          const isSelected = answers[blank.id] === oIdx;
                          const isCorrect = isSubmitted && mode === 'practice' && blank.correctOptionIndex === oIdx;
                          const isWrongSelection = isSubmitted && mode === 'practice' && isSelected && answers[blank.id] !== blank.correctOptionIndex;
                          
                          const btnStyle: React.CSSProperties = {
                            padding: '12px 16px',
                            borderRadius: '6px',
                            border: '1px solid var(--border-color)',
                            background: isSelected ? 'var(--text-primary)' : 'transparent',
                            color: isSelected ? 'var(--bg-primary)' : 'var(--text-primary)',
                            cursor: isSubmitted ? 'default' : 'pointer',
                            textAlign: 'left',
                            transition: 'all 0.2s ease',
                            display: 'flex',
                            gap: '12px',
                            alignItems: 'center'
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
                              key={oIdx}
                              onClick={() => handleSelectAnswer(blank.id, oIdx)}
                              style={btnStyle}
                              disabled={isSubmitted}
                              className={!isSubmitted ? 'hover-effect' : ''}
                            >
                              <strong style={{ opacity: 0.6 }}>{String.fromCharCode(97 + oIdx)})</strong> {opt}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  );
                })}
              </div>

            </div>

            {/* Submission Area */}
            <div style={{ 
              marginTop: '48px', 
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
                      ? (mode === 'practice' ? 'Sie haben alle Lücken ausgefüllt. Sie können jetzt abgeben.' : 'Sie haben alle Lücken ausgefüllt. Bereit für den nächsten Teil?')
                      : 'Bitte füllen Sie alle Lücken aus, um fortzufahren.'}
                  </p>
                  <button 
                    className="btn-primary" 
                    disabled={!allAnswered}
                    onClick={submitExam}
                    style={{ width: '100%', maxWidth: '400px' }}
                  >
                    {mode === 'practice' ? 'Antworten auswerten' : 'Weiter zu Hörverstehen'}
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
                    <div style={{ padding: '24px', background: 'var(--bg-primary)', borderRadius: '8px', marginBottom: '24px', width: '100%' }}>
                      <Loader2 className="animate-spin" size={24} style={{ margin: '0 auto 16px' }} />
                      <p style={{ fontSize: '14px', color: 'var(--text-secondary)' }}>KI analysiert Ihre Antworten...</p>
                    </div>
                  ) : aiFeedback ? (
                    <div style={{ padding: '24px', background: 'var(--bg-primary)', borderRadius: '8px', marginBottom: '24px', textAlign: 'left', width: '100%' }}>
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
        )}
      </div>
    </div>
  );
}
