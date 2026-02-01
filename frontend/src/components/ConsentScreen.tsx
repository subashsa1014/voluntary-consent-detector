import React, { useState, useEffect, useRef } from 'react';
import Capture from './Capture';
import { encryptConsent, generateHash, signConsent, checkDPDPACompliance } from '../utils/crypto';
import { modelService } from '../utils/tfjsModels';

interface ConsentScreenProps {
  documentType: string;
  jurisdiction?: string;
  onConsentComplete: (consentData: ConsentData) => void;
  onCancel: () => void;
}

interface ConsentData {
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
  const [isCapturing, setIsCapturing] = useState<boolean>(false);
  const [isModelReady, setIsModelReady] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  
  const videoRef = useRef<HTMLVideoElement>(null);

  // Initialize TensorFlow.js models
  useEffect(() => {
    const loadModels = async () => {
      try {
        await modelService.initialize();
        setIsModelReady(true);
      } catch (err) {
        setError('Failed to load AI models. Please ensure you have a stable internet connection.');
        console.error(err);
      }
    };
    loadModels();

    return () => {
      modelService.dispose();
    };
  }, []);

  const handleCapture = async (videoElement: HTMLVideoElement) => {
    if (!isModelReady) return;

    try {
      const result = await modelService.detectEmotion(videoElement);
      setCurrentEmotion(result.emotion);
      setEmotionConfidence(result.confidence);
    } catch (err) {
      console.error('Emotion detection error:', err);
    }
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
      jurisdiction
    };

    // 1. Check compliance
    const isCompliant = checkDPDPACompliance(rawData);
    if (!isCompliant && jurisdiction === 'India') {
      setError('Consent does not meet DPDPA requirements.');
      return;
    }

    // 2. Encrypt and Sign
    const encryptedData = encryptConsent(JSON.stringify(rawData));
    const dataHash = generateHash(encryptedData);
    const digitalSignature = signConsent(dataHash);

    const finalData: ConsentData = {
      ...rawData,
      encryptedData,
      digitalSignature
    };

    onConsentComplete(finalData);
  };

  if (error) {
    return (
      <div className=\"error-container\">
        <h2>Error</h2>
        <p>{error}</p>
        <button onClick={() => window.location.reload()}>Retry</button>
      </div>
    );
  }

  return (
    <div className=\"consent-screen\">
      <h1>Voluntary Consent Verification</h1>
      <p>Project: <strong>{documentType}</strong></p>
      
      {!isModelReady ? (
        <div className=\"loading-models\">
          <p>Loading AI models for secure verification...</p>
        </div>
      ) : (
        <div className=\"capture-section\">
          <Capture 
            onFrame={handleCapture}
            active={isCapturing}
          />
          
          <div className=\"status-overlay\">
            <p>Detected Emotion: <strong>{currentEmotion}</strong></p>
            <p>Confidence: <strong>{(emotionConfidence * 100).toFixed(2)}%</strong></p>
          </div>

          <div className=\"consent-controls\">
            <p>Do you voluntarily consent to the registration of this document?</p>
            <button 
              className=\"btn-approve\"
              onClick={() => handleConsentSubmit(true)}
              disabled={emotionConfidence < 0.6} // Requirement: 60% confidence
            >
              I Consent
            </button>
            <button 
              className=\"btn-decline\"
              onClick={() => handleConsentSubmit(false)}
            >
              Decline
            </button>
          </div>
        </div>
      )}

      <div className=\"legal-footer\">
        <p>This process is compliant with the Digital Personal Data Protection Act (DPDPA) 2023.</p>
      </div>

      <style jsx>{`
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
