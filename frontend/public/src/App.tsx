import React, { useState } from 'react';

interface AppState {
  page: 'consent' | 'capture' | 'results';
  sessionId?: string;
  emotionData?: any[];
}

const App: React.FC = () => {
  const [appState, setAppState] = useState<AppState>({
    page: 'consent',
  });

  const handleConsentAccept = async () => {
    try {
      const response = await fetch('http://localhost:8000/sessions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ user_id: 'test_user' }),
      });
      const data = await response.json();
      setAppState({
        page: 'capture',
        sessionId: data.session_id,
      });
    } catch (error) {
      console.error('Failed to create session:', error);
    }
  };

  return (
    <div style={styles.container}>
      <header style={styles.header}>
        <h1>Voluntary Consent Detector</h1>
        <p>Privacy-First AI-Based Detection System</p>
      </header>

      {appState.page === 'consent' && (
        <section style={styles.section}>
          <h2>Consent Required</h2>
          <p>
            This application uses AI-based emotion and audio analysis to detect
            the voluntary nature of your consent. All processing happens locally
            on your device. No raw media is uploaded.
          </p>
          <button style={styles.button} onClick={handleConsentAccept}>
            Accept & Continue
          </button>
        </section>
      )}

      {appState.page === 'capture' && (
        <section style={styles.section}>
          <h2>Session {appState.sessionId}</h2>
          <p>Capture component loading...</p>
        </section>
      )}
    </div>
  );
};

const styles: { [key: string]: React.CSSProperties } = {
  container: {
    minHeight: '100vh',
    backgroundColor: '#f5f5f5',
    padding: '20px',
  },
  header: {
    textAlign: 'center',
    marginBottom: '40px',
  },
  section: {
    maxWidth: '600px',
    margin: '0 auto',
    backgroundColor: '#fff',
    padding: '30px',
    borderRadius: '8px',
    boxShadow: '0 2px 10px rgba(0,0,0,0.1)',
  },
  button: {
    backgroundColor: '#17a2b8',
    color: '#fff',
    padding: '12px 24px',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer',
    fontSize: '16px',
    fontWeight: 'bold',
  },
};

export default App;
