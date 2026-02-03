import React, { useState } from 'react';
import ConsentScreen, { ConsentData } from './components/ConsentScreen';
import './index.css';

const App: React.FC = () => {
  const [consentRecord, setConsentRecord] = useState<ConsentData | null>(null);
  const [showConsentFlow, setShowConsentFlow] = useState(false);

  const handleConsentComplete = (data: ConsentData) => {
    setConsentRecord(data);
    setShowConsentFlow(false);
  };

  const handleStart = () => {
    setConsentRecord(null);
    setShowConsentFlow(true);
  };

  return (
    <div className="app">
      <header className="app-header">
        <div>
          <p className="eyebrow">Voluntary Consent Detector</p>
          <h1>Verify consent with privacy-first AI safeguards.</h1>
          <p className="subtitle">
            Capture consent signals, protect personal data, and store a compliant audit trail
            for high-stakes registrations.
          </p>
          <div className="hero-actions">
            <button className="primary-btn" onClick={handleStart}>
              Start Consent Verification
            </button>
            <button className="secondary-btn">View Compliance Guide</button>
          </div>
        </div>
        <div className="hero-card">
          <h2>Trust Dashboard</h2>
          <ul>
            <li>✅ DPDPA 2023 compliance checks</li>
            <li>🔒 Encrypted consent payloads</li>
            <li>🧠 On-device emotion analysis</li>
            <li>📋 Tamper-evident signatures</li>
          </ul>
        </div>
      </header>

      <section className="feature-grid">
        <div className="feature-card">
          <h3>Capture</h3>
          <p>Record real-time facial cues and consent confirmations without storing raw video.</p>
        </div>
        <div className="feature-card">
          <h3>Verify</h3>
          <p>AI models check for voluntary engagement and confidence thresholds before approval.</p>
        </div>
        <div className="feature-card">
          <h3>Secure</h3>
          <p>Consent data is encrypted, hashed, and digitally signed for audit-grade integrity.</p>
        </div>
      </section>

      <section className="consent-flow">
        <div className="consent-intro">
          <h2>Consent workflow</h2>
          <p>
            Launch a guided verification flow for land registration, financial onboarding, or
            any high-stakes agreement.
          </p>
        </div>

        {showConsentFlow ? (
          <ConsentScreen
            documentType="Land Deed Registration"
            onConsentComplete={handleConsentComplete}
            onCancel={() => setShowConsentFlow(false)}
          />
        ) : (
          <div className="consent-placeholder">
            <p>No active consent session.</p>
            <button className="primary-btn" onClick={handleStart}>
              Launch Consent Session
            </button>
          </div>
        )}

        {consentRecord && (
          <div className="consent-summary">
            <h3>Consent Summary</h3>
            <div className="summary-grid">
              <div>
                <span>Emotion</span>
                <strong>{consentRecord.detectedEmotion}</strong>
              </div>
              <div>
                <span>Confidence</span>
                <strong>{(consentRecord.emotionConfidence * 100).toFixed(2)}%</strong>
              </div>
              <div>
                <span>Timestamp</span>
                <strong>{new Date(consentRecord.consentTimestamp).toLocaleString()}</strong>
              </div>
              <div>
                <span>Jurisdiction</span>
                <strong>{consentRecord.jurisdiction}</strong>
              </div>
            </div>
            <p className="hash-preview">
              Encrypted payload hash: <code>{consentRecord.digitalSignature.slice(0, 20)}...</code>
            </p>
          </div>
        )}
      </section>
    </div>
  );
};

export default App;
