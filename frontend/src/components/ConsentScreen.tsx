import React, { useState, useEffect } from 'react';
import Capture from './Capture';
import { encryptConsent, generateHash, signConsent, checkDPDPACompliance } from '../utils/crypto';

interface ConsentScreenProps {
  documentType: string;
  jurisdiction?: string;
  onConsentComplete: (consentData: ConsentData) => void;
  onCancel?: () => void;
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
  const [isCapturing, setIsCapturing] = useState(false);
  const [agreedToTerms, setAgreedToTerms] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [startTime, setStartTime] = useState<number>(0);

  useEffect(() => {
    setStartTime(Date.now());
  }, []);

  const handleEmotionDetected = (emotion: string, confidence: number) => {
    setCurrentEmotion(emotion);
    setEmotionConfidence(confidence);
  };

  const handleConsentGiven = async (userConsent: boolean) => {
    setIsProcessing(true);
    const consentTimestamp = new Date().toISOString();
    const consentDuration = Math.floor((Date.now() - startTime) / 1000);

    const consentData: any = {
      userId: 'user_' + Math.random().toString(36).substr(2, 9),
      documentType,
      detectedEmotion: currentEmotion,
      emotionConfidence,
      userConsent,
      consentTimestamp,
      consentDuration,
      jurisdiction,
      dataUsagePurpose: `Consent for ${documentType} document registration`,
      dataRetentionPeriod: '7 years',
      rightToWithdraw: true
    };

    // Check DPDPA compliance
    const complianceCheck = checkDPDPACompliance(consentData);
    if (!complianceCheck.compliant) {
      alert(`Compliance issues: ${complianceCheck.issues.join(', ')}`);
      setIsProcessing(false);
      return;
    }

    try {
      // Encrypt consent data
      const encryptionKey = 'secure_key_' + Date.now();
      const encryptedData = await encryptConsent(JSON.stringify(consentData), encryptionKey);
      
      // Generate hash and digital signature
      const dataHash = await generateHash(JSON.stringify(consentData));
      const digitalSignature = await signConsent(JSON.stringify(consentData), encryptionKey);

      const finalConsentData: ConsentData = {
        userId: consentData.userId,
        documentType,
        detectedEmotion: currentEmotion,
        emotionConfidence,
        userConsent,
        consentTimestamp,
        encryptedData,
        digitalSignature,
        jurisdiction
      };

      onConsentComplete(finalConsentData);
    } catch (error) {
      console.error('Error processing consent:', error);
      alert('Failed to process consent. Please try again.');
    } finally {
      setIsProcessing(false);
    }
  };

  const getEmotionColor = (emotion: string) => {
    const colors: Record<string, string> = {
      happy: '#27ae60',
      sad: '#3498db',
      angry: '#e74c3c',
      surprised: '#f39c12',
      neutral: '#95a5a6'
    };
    return colors[emotion] || '#95a5a6';
  };

  return (
    <div className="consent-screen">
      <div className="consent-header">
        <h1>Voluntary Consent Verification</h1>
        <p className="document-type">Document Type: <strong>{documentType}</strong></p>
        <p className="jurisdiction">Jurisdiction: <strong>{jurisdiction}</strong></p>
      </div>

      <div className="consent-content">
        {/* Video Capture Section */}
        <div className="capture-section">
          <h2>Emotion Detection</h2>
          <Capture
            onEmotionDetected={handleEmotionDetected}
            onError={(error) => console.error('Capture error:', error)}
          />
          
          <div className="emotion-status" style={{ backgroundColor: getEmotionColor(currentEmotion) }}>
            <span className="emotion-label">Current Emotion: <strong>{currentEmotion}</strong></span>
            <span className="confidence-label">Confidence: <strong>{(emotionConfidence * 100).toFixed(1)}%</strong></span>
          </div>
        </div>

        {/* Consent Information */}
        <div className="consent-info">
          <h2>Consent Information</h2>
          <div className="info-box">
            <h3>Data Usage Purpose</h3>
            <p>Your consent will be used for verifying voluntary agreement in the {documentType} document registration process.</p>
            
            <h3>Data Retention</h3>
            <p>Consent records will be stored for <strong>7 years</strong> as per legal requirements.</p>
            
            <h3>Your Rights (DPDPA 2023)</h3>
            <ul>
              <li>✓ Right to access your consent records</li>
              <li>✓ Right to correct inaccurate data</li>
              <li>✓ Right to withdraw consent at any time</li>
              <li>✓ Right to data portability</li>
              <li>✓ Right to be forgotten</li>
            </ul>

            <h3>Security Measures</h3>
            <ul>
              <li>✓ AES-256 encryption for data at rest</li>
              <li>✓ Digital signatures for integrity verification</li>
              <li>✓ On-device emotion processing (privacy-first)</li>
              <li>✓ No third-party data sharing</li>
            </ul>
          </div>

          <div className="terms-checkbox">
            <label>
              <input
                type="checkbox"
                checked={agreedToTerms}
                onChange={(e) => setAgreedToTerms(e.target.checked)}
              />
              I have read and understood the consent information above. I voluntarily agree to provide my consent for the stated purpose.
            </label>
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="consent-actions">
        <button
          className="btn-cancel"
          onClick={onCancel}
          disabled={isProcessing}
        >
          Cancel
        </button>
        <button
          className="btn-deny"
          onClick={() => handleConsentGiven(false)}
          disabled={!agreedToTerms || isProcessing}
        >
          Deny Consent
        </button>
        <button
          className="btn-accept"
          onClick={() => handleConsentGiven(true)}
          disabled={!agreedToTerms || isProcessing}
        >
          {isProcessing ? 'Processing...' : 'Grant Consent'}
        </button>
      </div>

      <style jsx>{`
        .consent-screen {
          max-width: 1200px;
          margin: 0 auto;
          padding: 20px;
          font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
        }

        .consent-header {
          text-align: center;
          margin-bottom: 30px;
          padding-bottom: 20px;
          border-bottom: 2px solid #e0e0e0;
        }

        .consent-header h1 {
          color: #2c3e50;
          margin-bottom: 10px;
        }

        .document-type, .jurisdiction {
          font-size: 16px;
          color: #555;
          margin: 5px 0;
        }

        .consent-content {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 30px;
          margin-bottom: 30px;
        }

        .capture-section, .consent-info {
          background: #f9f9f9;
          padding: 20px;
          border-radius: 8px;
          box-shadow: 0 2px 4px rgba(0,0,0,0.1);
        }

        .emotion-status {
          margin-top: 15px;
          padding: 15px;
          border-radius: 8px;
          color: white;
          display: flex;
          justify-content: space-between;
          align-items: center;
        }

        .info-box {
          background: white;
          padding: 20px;
          border-radius: 8px;
          margin-bottom: 20px;
        }

        .info-box h3 {
          color: #2c3e50;
          margin-top: 15px;
          margin-bottom: 10px;
        }

        .info-box ul {
          list-style: none;
          padding: 0;
        }

        .info-box ul li {
          padding: 5px 0;
          color: #555;
        }

        .terms-checkbox {
          background: #fff3cd;
          padding: 15px;
          border-radius: 8px;
          border: 1px solid #ffc107;
        }

        .terms-checkbox label {
          display: flex;
          align-items: flex-start;
          gap: 10px;
          cursor: pointer;
        }

        .terms-checkbox input[type="checkbox"] {
          margin-top: 4px;
          width: 18px;
          height: 18px;
          cursor: pointer;
        }

        .consent-actions {
          display: flex;
          justify-content: center;
          gap: 15px;
          padding: 20px;
        }

        .consent-actions button {
          padding: 12px 30px;
          font-size: 16px;
          border: none;
          border-radius: 6px;
          cursor: pointer;
          transition: all 0.3s;
          font-weight: 600;
        }

        .btn-cancel {
          background-color: #95a5a6;
          color: white;
        }

        .btn-cancel:hover:not(:disabled) {
          background-color: #7f8c8d;
        }

        .btn-deny {
          background-color: #e74c3c;
          color: white;
        }

        .btn-deny:hover:not(:disabled) {
          background-color: #c0392b;
        }

        .btn-accept {
          background-color: #27ae60;
          color: white;
        }

        .btn-accept:hover:not(:disabled) {
          background-color: #229954;
        }

        .consent-actions button:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }

        @media (max-width: 768px) {
          .consent-content {
            grid-template-columns: 1fr;
          }

          .consent-actions {
            flex-direction: column;
          }

          .consent-actions button {
            width: 100%;
          }
        }
      `}</style>
    </div>
  );
};

export default ConsentScreen;
