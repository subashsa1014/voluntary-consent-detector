import React, { useState } from 'react';
import Capture from './Capture';
import {
  encryptConsent,
  generateHash,
  generateKeyPair,
  signConsent,
  checkDPDPACompliance
} from '../utils/crypto';

interface ConsentScreenProps {
  documentType: string;
  jurisdiction?: string;
  onConsentComplete: (consentData: ConsentData) => void;
  onCancel: () => void;
}

export interface ConsentData {
  userId: string;
  documentType: string;
  detectedEmotion: string;
  emotionConfidence: number;
  userConsent: boolean;
  consentTimestamp: string;
  encryptedData: string;
  digitalSignature: string;
  jurisdiction: string;
}

const ConsentScreen: React.FC<ConsentScreenProps> = ({
  documentType,
  jurisdiction = 'India',
  onConsentComplete,
  onCancel
}) => {
  const [currentEmotion, setCurrentEmotion] = useState<string>('neutral');
  const [emotionConfidence, setEmotionConfidence] = useState<number>(0);
  const [isModelReady, setIsModelReady] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const handleEmotionDetected = (emotion: string, confidence: number) => {
    setCurrentEmotion(emotion);
    setEmotionConfidence(confidence);
  };

  const handleConsentSubmit = async (agreed: boolean) => {
    if (!agreed) {
      onCancel();
      return;
    }

    const timestamp = new Date().toISOString();
    const userId = 'USER_' + Math.random().toString(36).substr(2, 9); // Placeholder

    const rawData = {
      userId,
      documentType,
      detectedEmotion: currentEmotion,
      emotionConfidence,
      userConsent: agreed,
      consentTimestamp: timestamp,
      jurisdiction,
      dataUsagePurpose: 'Document registration verification',
      dataRetentionPeriod: '7 years',
      rightToWithdraw: true
    };

    // 1. Check compliance
    const compliance = checkDPDPACompliance(rawData);
    if (!compliance.compliant && jurisdiction === 'India') {
      setError(`Consent does not meet DPDPA requirements: ${compliance.issues.join(', ')}`);
      return;
    }

    // 2. Encrypt and Sign
    const { privateKey } = await generateKeyPair();
    const encryptionKey = `CONSENT_KEY_${userId}`;
    const encryptedData = await encryptConsent(JSON.stringify(rawData), encryptionKey);
    const dataHash = await generateHash(encryptedData);
    const digitalSignature = await signConsent(dataHash, privateKey);

    const finalData: ConsentData = {
      ...rawData,
      encryptedData,
      digitalSignature
    };

    onConsentComplete(finalData);
  };

  if (error) {
    return (
      <div className="error-container">
        <h2>Error</h2>
        <p>{error}</p>
        <button onClick={() => window.location.reload()}>Retry</button>
      </div>
    );
  }

  return (
    <div className="consent-screen">
      <h1>Voluntary Consent Verification</h1>
      <p>Project: <strong>{documentType}</strong></p>
      
      <div className="capture-section">
        {!isModelReady && (
          <div className="loading-models">
            <p>Loading AI models for secure verification...</p>
          </div>
        )}
        <Capture
          onEmotionDetected={handleEmotionDetected}
          onModelReady={setIsModelReady}
          onError={(message) => setError(message)}
        />
        
        <div className="status-overlay">
          <p>Detected Emotion: <strong>{currentEmotion}</strong></p>
          <p>Confidence: <strong>{(emotionConfidence * 100).toFixed(2)}%</strong></p>
        </div>

        <div className="consent-controls">
          <p>Do you voluntarily consent to the registration of this document?</p>
          <button 
            className="btn-approve"
            onClick={() => handleConsentSubmit(true)}
            disabled={emotionConfidence < 0.6 || !isModelReady} // Requirement: 60% confidence
          >
            I Consent
          </button>
          <button 
            className="btn-decline"
            onClick={() => handleConsentSubmit(false)}
          >
            Decline
          </button>
        </div>
      </div>

      <div className="legal-footer">
        <p>This process is compliant with the Digital Personal Data Protection Act (DPDPA) 2023.</p>
      </div>

      <style>{`
        .consent-screen {
          max-width: 800px;
          margin: 0 auto;
          padding: 2rem;
          text-align: center;
          background: #f9fafb;
          border-radius: 12px;
          box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
        }
        .status-overlay {
          margin: 1rem 0;
          padding: 1rem;
          background: #fff;
          border: 1px solid #e5e7eb;
          border-radius: 8px;
        }
        .loading-models {
          padding: 0.75rem;
          background: #eef2ff;
          border-radius: 8px;
          margin-bottom: 1rem;
          color: #4338ca;
          font-weight: 500;
        }
        .btn-approve {
          background: #10b981;
          color: white;
          padding: 0.75rem 2rem;
          border-radius: 6px;
          margin-right: 1rem;
          border: none;
          cursor: pointer;
          font-weight: 600;
        }
        .btn-approve:disabled {
          background: #9ca3af;
          cursor: not-allowed;
        }
        .btn-decline {
          background: #ef4444;
          color: white;
          padding: 0.75rem 2rem;
          border-radius: 6px;
          border: none;
          cursor: pointer;
          font-weight: 600;
        }
        .legal-footer {
          margin-top: 2rem;
          font-size: 0.875rem;
          color: #6b7280;
        }
      `}</style>
    </div>
  );
};

export default ConsentScreen;
