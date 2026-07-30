"use client";

import { useEffect, useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useExam } from '../../context/ExamContext';
import { CheckCircle, AlertCircle, BookOpen, Film, Plane, Activity, Mic, Square, Loader2, ArrowLeft } from 'lucide-react';
import styles from '../modules.module.css';
import { saveProgress } from '../../../lib/supabaseClient';

const TOPICS = [
  { id: 'buch', title: 'Ein Buch', icon: <BookOpen size={20} />, prompt: 'Präsentieren Sie ein Buch, das Sie kürzlich gelesen haben.' },
  { id: 'film', title: 'Ein Film', icon: <Film size={20} />, prompt: 'Präsentieren Sie einen Film, der Sie beeindruckt hat.' },
  { id: 'reise', title: 'Eine Reise', icon: <Plane size={20} />, prompt: 'Erzählen Sie von einer unvergesslichen Reise.' },
  { id: 'sport', title: 'Sport / Hobby', icon: <Activity size={20} />, prompt: 'Stellen Sie Ihr Lieblingshobby oder Ihren Lieblingssport vor.' }
];

export default function SpeakingModule() {
  const router = useRouter();
  const { mode } = useExam();
  
  const [selectedTopic, setSelectedTopic] = useState<any>(null);
  const [isRecording, setIsRecording] = useState(false);
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [recordingTime, setRecordingTime] = useState(0);
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<any>(null);

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  if (!mode) {
    router.push('/');
    return null;
  }

  useEffect(() => {
    if (isRecording) {
      timerRef.current = setInterval(() => {
        setRecordingTime(prev => prev + 1);
      }, 1000);
    } else {
      if (timerRef.current) clearInterval(timerRef.current);
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isRecording]);

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      
      const chunks: BlobPart[] = [];
      
      mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) chunks.push(e.data);
      };
      
      mediaRecorder.onstop = () => {
        const blob = new Blob(chunks, { type: 'audio/webm' });
        setAudioBlob(blob);
        setAudioUrl(URL.createObjectURL(blob));
        // Stop all tracks to release microphone
        stream.getTracks().forEach(track => track.stop());
      };
      
      setAudioBlob(null);
      setAudioUrl(null);
      setRecordingTime(0);
      setResult(null);
      setError(null);
      
      mediaRecorder.start();
      setIsRecording(true);
    } catch (err: any) {
      console.error(err);
      setError('Mikrofonzugriff verweigert oder nicht verfügbar. Bitte erlauben Sie den Zugriff.');
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
    }
  };

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  const submitAudio = async () => {
    if (!audioBlob || !selectedTopic) return;
    
    setIsSubmitting(true);
    setError(null);
    setResult(null);

    const formData = new FormData();
    formData.append('audio', audioBlob, 'recording.webm');
    formData.append('topic', selectedTopic.prompt);

    try {
      const res = await fetch('/api/evaluate-speaking', {
        method: 'POST',
        body: formData
      });
      
      const data = await res.json();
      
      if (!res.ok) {
        throw new Error(data.error || 'Fehler bei der Auswertung');
      }
      
      setResult(data);
      await saveProgress('Mündliche Prüfung', data.comprehensibilityScore || 0, data.analysis || '');
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="page-container">
      <header className={styles.moduleHeader}>
        <Link href="/" className={styles.backBtn}>
          <ArrowLeft size={16} /> Zurück zum Dashboard
        </Link>
        <div className={`panel ${styles.timer}`}>
          <span>Modus:</span>
          <span style={{ fontWeight: 'bold', color: 'var(--accent-color)' }}>
            {mode === 'practice' ? 'Übungsmodus' : 'Prüfungsmodus'}
          </span>
        </div>
      </header>

      <div className={styles.content}>
        <div className={styles.mainColumn} style={{ gridColumn: '1 / -1' }}>
          
          {!selectedTopic ? (
            <div className={`panel ${styles.instructions}`}>
              <h1 style={{ marginBottom: '8px' }}>Mündliche Prüfung</h1>
              <h2 style={{ marginBottom: '16px', fontSize: '1.2rem', fontWeight: 500 }}>Wählen Sie ein Thema</h2>
              <p style={{ marginBottom: '24px', color: 'var(--text-secondary)' }}>
                Für den ersten Teil der mündlichen Prüfung müssen Sie eine kurze Präsentation (ca. 1-2 Minuten) halten.
                Worüber möchten Sie sprechen?
              </p>
              
              <div className="responsive-grid-2">
                {TOPICS.map(topic => (
                  <button
                    key={topic.id}
                    onClick={() => setSelectedTopic(topic)}
                    style={{
                      background: 'var(--bg-secondary)',
                      border: '1px solid #333',
                      padding: '24px',
                      borderRadius: '8px',
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      gap: '12px',
                      cursor: 'pointer',
                      transition: 'border-color 0.2s',
                      color: 'var(--text-primary)'
                    }}
                    onMouseEnter={(e) => e.currentTarget.style.borderColor = 'var(--accent-color)'}
                    onMouseLeave={(e) => e.currentTarget.style.borderColor = '#333'}
                  >
                    {topic.icon}
                    <span style={{ fontSize: '18px', fontWeight: '500' }}>{topic.title}</span>
                  </button>
                ))}
              </div>
            </div>
          ) : (
            <div className={`panel ${styles.instructions}`}>
              <h1 style={{ marginBottom: '24px' }}>Mündliche Prüfung</h1>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '24px' }}>
                <div>
                  <h2 style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    {selectedTopic.icon} {selectedTopic.title}
                  </h2>
                  <p style={{ marginTop: '8px', fontSize: '18px', color: 'var(--text-secondary)' }}>
                    {selectedTopic.prompt}
                  </p>
                </div>
                {!isRecording && !isSubmitting && !result && (
                  <button onClick={() => {
                    setSelectedTopic(null);
                    setAudioBlob(null);
                    setAudioUrl(null);
                  }} style={{ background: 'transparent', border: 'none', color: '#666', cursor: 'pointer', textDecoration: 'underline' }}>
                    Thema ändern
                  </button>
                )}
              </div>

              {error && (
                <div style={{ padding: '16px', background: 'rgba(239, 68, 68, 0.1)', color: '#ef4444', borderRadius: '8px', marginBottom: '24px' }}>
                  {error}
                </div>
              )}

              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '40px 0', borderTop: '1px solid #333' }}>
                <div style={{ fontSize: '48px', fontWeight: 'bold', fontFamily: 'monospace', marginBottom: '32px', color: isRecording ? '#ef4444' : 'var(--text-primary)' }}>
                  {formatTime(recordingTime)}
                </div>

                {!isRecording && !audioBlob ? (
                  <button 
                    onClick={startRecording}
                    className="btn-primary"
                    style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '16px 32px', fontSize: '18px', borderRadius: '32px' }}
                  >
                    <Mic size={24} /> Aufnahme starten
                  </button>
                ) : isRecording ? (
                  <button 
                    onClick={stopRecording}
                    style={{ 
                      background: '#ef4444', color: 'white', border: 'none', 
                      display: 'flex', alignItems: 'center', gap: '8px', 
                      padding: '16px 32px', fontSize: '18px', borderRadius: '32px', cursor: 'pointer' 
                    }}
                  >
                    <Square size={24} fill="currentColor" /> Aufnahme beenden
                  </button>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '24px', width: '100%' }}>
                    {audioUrl && !result && (
                      <audio src={audioUrl} controls style={{ width: '100%', maxWidth: '400px' }} />
                    )}
                    
                    <div style={{ display: 'flex', gap: '16px' }}>
                      <button 
                        onClick={startRecording}
                        className="btn-secondary"
                        disabled={isSubmitting}
                      >
                        Neu aufnehmen
                      </button>
                      
                      <button 
                        onClick={submitAudio}
                        className="btn-primary"
                        disabled={isSubmitting || !!result}
                        style={{ display: 'flex', alignItems: 'center', gap: '8px' }}
                      >
                        {isSubmitting ? (
                          <><Loader2 size={20} className={styles.spin} /> Auswertung läuft...</>
                        ) : result ? (
                          <><CheckCircle size={20} /> Ausgewertet</>
                        ) : (
                          'Antwort einreichen'
                        )}
                      </button>
                    </div>
                  </div>
                )}
              </div>

              {/* Feedback Section */}
              {result && (
                <div className={styles.feedbackSection} style={{ marginTop: '32px', borderTop: '1px solid #333', paddingTop: '32px' }}>
                  <h3>Systemauswertung</h3>
                  
                  <div style={{ marginTop: '24px', background: 'var(--bg-primary)', padding: '24px', borderRadius: '8px', border: '1px solid #333' }}>
                    <h4 style={{ marginBottom: '12px', color: 'var(--accent-color)' }}>{result.feedback.scoreSummary}</h4>
                    
                    <div style={{ marginTop: '16px', marginBottom: '24px' }}>
                      <p style={{ fontSize: '14px', color: '#888', marginBottom: '8px' }}>Was das System gehört hat (Transkription):</p>
                      <p style={{ fontStyle: 'italic', color: 'var(--text-secondary)' }}>"{result.transcript}"</p>
                    </div>

                    {result.feedback.mistakesAnalysis && result.feedback.mistakesAnalysis.length > 0 && (
                      <div style={{ marginTop: '24px' }}>
                        <h4 style={{ marginBottom: '16px' }}>Analyse der Antworten</h4>
                        {result.feedback.mistakesAnalysis.map((mistake: any, idx: number) => (
                          <div key={idx} style={{ marginBottom: '16px', padding: '16px', background: 'rgba(255,255,255,0.03)', borderRadius: '6px' }}>
                            <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px' }}>
                              <AlertCircle size={20} color="#f59e0b" style={{ flexShrink: 0, marginTop: '2px' }} />
                              <div>
                                <strong style={{ color: 'var(--text-primary)' }}>{mistake.questionId}</strong>
                                <p style={{ marginTop: '8px', color: 'var(--text-secondary)' }}>{mistake.explanation}</p>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                    
                    {result.feedback.recommendations && result.feedback.recommendations.length > 0 && (
                      <div style={{ marginTop: '24px', paddingTop: '24px', borderTop: '1px solid #333' }}>
                        <h4 style={{ marginBottom: '16px', color: '#10b981' }}>Empfehlungen</h4>
                        <ul style={{ listStylePosition: 'inside', color: 'var(--text-secondary)' }}>
                          {result.feedback.recommendations.map((rec: string, idx: number) => (
                            <li key={idx} style={{ marginBottom: '8px' }}>{rec}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
