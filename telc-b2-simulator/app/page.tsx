'use client';
import { useState, useEffect } from 'react';
import Link from "next/link";
import { BookOpen, Headphones, PenTool, Mic, Play, Settings, ArrowLeft, LogOut } from "lucide-react";
import styles from "./page.module.css";
import { useExam } from "./context/ExamContext";
import { supabase } from '../lib/supabaseClient';

export default function Home() {
  const { mode, setMode } = useExam();
  const [showModules, setShowModules] = useState(!!mode);
  const [opacity, setOpacity] = useState(1);
  
  // Auth state
  const [session, setSession] = useState<any>(null);
  const [loadingAuth, setLoadingAuth] = useState(true);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setLoadingAuth(false);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });

    return () => subscription.unsubscribe();
  }, []);

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loginError, setLoginError] = useState('');

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError('');
    if (!email || !password) return;

    // Try to login
    let { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    // If login fails because user doesn't exist, try signing them up
    if (error && error.message.includes('Invalid login credentials')) {
      const { error: signUpError } = await supabase.auth.signUp({
        email,
        password,
      });
      
      if (signUpError) {
        setLoginError(signUpError.message);
      }
      return;
    }

    if (error) {
      setLoginError(error.message);
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
  };

  const handleSelectMode = (selectedMode: 'practice' | 'exam') => {
    // Fade out
    setOpacity(0);
    setTimeout(() => {
      setMode(selectedMode);
      setShowModules(true);
      // Fade in
      setOpacity(1);
    }, 300); // 300ms transition
  };

  const handleChangeMode = () => {
    setOpacity(0);
    setTimeout(() => {
      setMode(null);
      setShowModules(false);
      setOpacity(1);
    }, 300);
  };

  if (loadingAuth) {
    return (
      <div className="page-container" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <p>Laden...</p>
      </div>
    );
  }

  if (!session) {
    return (
      <div className="page-container" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <div className="panel" style={{ textAlign: 'center', padding: '48px', maxWidth: '400px' }}>
          <h1 style={{ marginBottom: '16px' }}>TELC B2 Simulator</h1>
          <p style={{ color: 'var(--text-secondary)', marginBottom: '32px' }}>
            Melden Sie sich an, um Ihren Fortschritt zu speichern.
          </p>
          <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <input 
              type="email" 
              placeholder="Ihre E-Mail-Adresse" 
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              style={{ padding: '16px', fontSize: '1rem', background: 'var(--bg-secondary)', border: '1px solid var(--border-color)', borderRadius: '8px', color: 'var(--text-primary)', width: '100%', boxSizing: 'border-box' }}
            />
            <input 
              type="password" 
              placeholder="Passwort" 
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              minLength={6}
              style={{ padding: '16px', fontSize: '1rem', background: 'var(--bg-secondary)', border: '1px solid var(--border-color)', borderRadius: '8px', color: 'var(--text-primary)', width: '100%', boxSizing: 'border-box' }}
            />
            {loginError && <p style={{ color: 'rgb(239, 68, 68)', fontSize: '0.9rem', textAlign: 'left' }}>{loginError}</p>}
            <button type="submit" className="primary-button" style={{ width: '100%', padding: '16px', fontSize: '1.1rem' }}>
              Anmelden / Registrieren
            </button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="page-container" style={{ transition: 'opacity 0.3s ease', opacity: opacity }}>
      <header className={styles.header}>
        <div>
          <h1>TELC B2 Simulator</h1>
          <p>
            {showModules 
              ? (mode === 'practice' ? 'Modus: Einzelmodus' : 'Modus: Prüfungsmodus') 
              : 'Willkommen zurück. Wie möchten Sie heute üben?'}
          </p>
        </div>
        <div className="user-profile" style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div className="avatar">
            {session.user.user_metadata?.avatar_url ? (
              <img src={session.user.user_metadata.avatar_url} alt="Avatar" style={{ width: '100%', height: '100%', borderRadius: '50%' }} />
            ) : (
              session.user.email?.[0].toUpperCase() || 'U'
            )}
          </div>
          <button onClick={handleLogout} className={styles.backBtn} title="Abmelden">
            <LogOut size={16} />
          </button>
        </div>
      </header>

      {!showModules ? (
        <section className="panel" style={{ padding: '48px', maxWidth: '900px', margin: '0 auto', textAlign: 'center' }}>
          <h2 style={{ marginBottom: '48px' }}>Wählen Sie einen Modus, um zu beginnen</h2>
          <div className="responsive-grid-2">
            
            <div 
              className="panel hover-effect"
              onClick={() => handleSelectMode('practice')}
              style={{ padding: '32px', cursor: 'pointer', textAlign: 'left' }}
            >
              <Settings size={40} style={{ marginBottom: '24px', color: 'var(--text-primary)' }} />
              <h3 style={{ marginBottom: '12px', fontSize: '20px' }}>Einzelmodus</h3>
              <p style={{ color: 'var(--text-secondary)', fontSize: '15px', lineHeight: '1.6' }}>
                Üben Sie einzelne Module in Ihrem eigenen Tempo. Nach jeder Aufgabe erhalten Sie sofortiges Feedback und detaillierte Analysen von der KI.
              </p>
            </div>

            <div 
              className="panel hover-effect"
              onClick={() => handleSelectMode('exam')}
              style={{ padding: '32px', cursor: 'pointer', textAlign: 'left' }}
            >
              <Play size={40} style={{ marginBottom: '24px', color: 'var(--text-primary)' }} />
              <h3 style={{ marginBottom: '12px', fontSize: '20px' }}>Prüfungsmodus</h3>
              <p style={{ color: 'var(--text-secondary)', fontSize: '15px', lineHeight: '1.6' }}>
                Simulieren Sie die echte TELC-Prüfung. Alle Module nacheinander, unter Zeitdruck und ohne Feedback zwischen den Aufgaben.
              </p>
            </div>

          </div>
        </section>
      ) : (
        <>
          <div style={{ marginBottom: '32px' }}>
            <button 
              onClick={handleChangeMode}
              style={{ 
                background: 'transparent', 
                border: 'none', 
                color: 'var(--text-secondary)', 
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                fontSize: '14px'
              }}
              className="hover-effect"
            >
              <ArrowLeft size={16} /> Modus ändern
            </button>
          </div>

          <div className={styles.dashboardGrid}>
            <div className={`panel ${styles.moduleCard}`}>
              <div className={styles.moduleIconWrapper}>
                <BookOpen size={24} />
              </div>
              <h3>Leseverstehen</h3>
              <p>Teil 1, 2, 3</p>
              <div className={styles.progressTrack}>
                <div className={styles.progressFill} style={{ width: '0%' }}></div>
              </div>
              <Link href="/modules/reading" className="btn-primary" style={{ display: 'block', textAlign: 'center', textDecoration: 'none' }}>
                {mode === 'exam' ? 'Prüfung starten' : 'Üben'}
              </Link>
            </div>

            <div className={`panel ${styles.moduleCard}`}>
              <div className={styles.moduleIconWrapper}>
                <Headphones size={24} />
              </div>
              <h3>Sprachbausteine</h3>
              <p>Grammatik Teil 1, 2</p>
              <div className={styles.progressTrack}>
                <div className={styles.progressFill} style={{ width: '0%' }}></div>
              </div>
              <Link href="/modules/grammar" className="btn-primary" style={{ display: 'block', textAlign: 'center', textDecoration: 'none' }}>
                {mode === 'exam' ? 'Prüfung starten' : 'Üben'}
              </Link>
            </div>

            <div className={`panel ${styles.moduleCard}`}>
              <div className={styles.moduleIconWrapper}>
                <Headphones size={24} />
              </div>
              <h3>Hörverstehen</h3>
              <p>Teil 1, 2, 3</p>
              <div className={styles.progressTrack}>
                <div className={styles.progressFill} style={{ width: '0%' }}></div>
              </div>
              <Link href="/modules/listening" className="btn-primary" style={{ display: 'block', textAlign: 'center', textDecoration: 'none' }}>
                {mode === 'exam' ? 'Prüfung starten' : 'Üben'}
              </Link>
            </div>

            <div className={`panel ${styles.moduleCard}`}>
              <div className={styles.moduleIconWrapper}>
                <Mic size={24} />
              </div>
              <h3>Mündliche Prüfung</h3>
              <p>15 Minuten</p>
              <div className={styles.progressTrack}>
                <div className={styles.progressFill} style={{ width: '0%' }}></div>
              </div>
              <Link href="/modules/speaking" className="btn-primary" style={{ display: 'block', textAlign: 'center', textDecoration: 'none' }}>
                {mode === 'exam' ? 'Prüfung starten' : 'Üben'}
              </Link>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
