import React, { useEffect, useRef, useState } from 'react';
import { loadModel, detectEmotion } from '../utils/model';

interface CaptureProps {
  onEmotionDetected: (emotion: string, confidence: number) => void;
  onError?: (error: string) => void;
}

const Capture: React.FC<CaptureProps> = ({ onEmotionDetected, onError }) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isCapturing, setIsCapturing] = useState(false);
  const [modelLoaded, setModelLoaded] = useState(false);
  const animationFrameRef = useRef<number | null>(null);

  // Initialize video stream
  useEffect(() => {
    const initializeVideo = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: { width: 640, height: 480 }
        });
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
        }
      } catch (error) {
        const errorMsg = error instanceof Error ? error.message : 'Failed to access camera';
        onError?.(errorMsg);
      }
    };

    initializeVideo();

    return () => {
      if (videoRef.current?.srcObject) {
        const tracks = (videoRef.current.srcObject as MediaStream).getTracks();
        tracks.forEach(track => track.stop());
      }
    };
  }, [onError]);

  // Load emotion detection model
  useEffect(() => {
    const loadEmotionModel = async () => {
      try {
        await loadModel();
        setModelLoaded(true);
      } catch (error) {
        const errorMsg = error instanceof Error ? error.message : 'Failed to load model';
        onError?.(errorMsg);
      }
    };

    loadEmotionModel();
  }, [onError]);

  // Detect emotion from video
  const detectEmotionFrame = async () => {
    if (!videoRef.current || !modelLoaded || !isCapturing) return;

    try {
      const result = await detectEmotion(videoRef.current);
      onEmotionDetected(result.emotion, result.confidence);
    } catch (error) {
      console.error('Emotion detection error:', error);
    }

    if (isCapturing) {
      animationFrameRef.current = requestAnimationFrame(detectEmotionFrame);
    }
  };

  // Start/Stop capturing
  const toggleCapture = () => {
    setIsCapturing(!isCapturing);
    if (!isCapturing) {
      detectEmotionFrame();
    } else {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    }
  };

  return (
    <div className="capture-container">
      <h2>Emotion Detection Capture</h2>
      
      <div className="video-wrapper">
        <video
          ref={videoRef}
          autoPlay
          playsInline
          width={640}
          height={480}
          className="capture-video"
        />
        <canvas
          ref={canvasRef}
          width={640}
          height={480}
          className="capture-canvas"
          style={{ display: 'none' }}
        />
      </div>

      <div className="controls">
        <button
          onClick={toggleCapture}
          disabled={!modelLoaded}
          className={`capture-btn ${isCapturing ? 'active' : ''}`}
        >
          {isCapturing ? 'Stop Detection' : 'Start Detection'}
        </button>
        <span className="status">
          {modelLoaded ? '✓ Model Ready' : '⏳ Loading Model...'}
        </span>
      </div>

      <style jsx>{`
        .capture-container {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 20px;
          padding: 20px;
        }

        .video-wrapper {
          position: relative;
          border: 2px solid #2c3e50;
          border-radius: 8px;
          overflow: hidden;
        }

        .capture-video {
          display: block;
          width: 100%;
          max-width: 640px;
          height: auto;
        }

        .controls {
          display: flex;
          gap: 10px;
          align-items: center;
        }

        .capture-btn {
          padding: 10px 20px;
          font-size: 16px;
          border: none;
          border-radius: 4px;
          background-color: #27ae60;
          color: white;
          cursor: pointer;
          transition: background-color 0.3s;
        }

        .capture-btn:hover:not(:disabled) {
          background-color: #229954;
        }

        .capture-btn.active {
          background-color: #e74c3c;
        }

        .capture-btn:disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }

        .status {
          padding: 8px 12px;
          background-color: #ecf0f1;
          border-radius: 4px;
          font-size: 14px;
        }
      `}</style>
    </div>
  );
};

export default Capture;
