// TensorFlow.js Emotion Detection Model
import * as tf from '@tensorflow/tfjs';
import * as facemesh from '@tensorflow-models/facemesh';

let model: facemesh.FaceMesh | null = null;

// Load the FaceMesh model
export async function loadModel(): Promise<void> {
  try {
    model = await facemesh.load();
    console.log('FaceMesh model loaded successfully');
  } catch (error) {
    console.error('Failed to load FaceMesh model:', error);
    throw error;
  }
}

// Detect emotions based on facial landmarks
export async function detectEmotion(video: HTMLVideoElement): Promise<{
  emotion: string;
  confidence: number;
  landmarks: number[][];
}> {
  if (!model) {
    throw new Error('Model not loaded. Call loadModel() first.');
  }

  const predictions = await model.estimateFaces(video, false);

  if (predictions.length === 0) {
    return {
      emotion: 'neutral',
      confidence: 0,
      landmarks: []
    };
  }

  const landmarks = predictions[0].scaledMesh as number[][];
  const emotion = analyzeEmotionFromLandmarks(landmarks);

  return {
    emotion: emotion.type,
    confidence: emotion.confidence,
    landmarks: landmarks
  };
}

// Analyze emotion based on facial landmarks
function analyzeEmotionFromLandmarks(landmarks: number[][]): {
  type: string;
  confidence: number;
} {
  // Key landmark indices
  const eyebrowLeft = landmarks[21];
  const eyebrowRight = landmarks[251];
  const eyeLeft = landmarks[33];
  const eyeRight = landmarks[263];
  const mouthLeft = landmarks[61];
  const mouthRight = landmarks[291];
  const mouthTop = landmarks[13];
  const mouthBottom = landmarks[14];

  // Calculate facial measurements
  const eyebrowHeight = Math.abs(eyebrowLeft[1] - landmarks[0][1]);
  const mouthWidth = Math.abs(mouthRight[0] - mouthLeft[0]);
  const mouthHeight = Math.abs(mouthBottom[1] - mouthTop[1]);
  const eyeOpenness = Math.abs(eyeLeft[1] - eyeRight[1]);

  // Emotion detection logic
  let emotion = 'neutral';
  let confidence = 0.5;

  // Happy: mouth open, eyebrows up
  if (mouthHeight > 15 && eyebrowHeight > 8) {
    emotion = 'happy';
    confidence = 0.8 + (Math.min(mouthHeight / 30, 0.2));
  }
  // Sad: mouth down, eyebrows down
  else if (mouthHeight < 5 && eyebrowHeight < 5) {
    emotion = 'sad';
    confidence = 0.75 + (Math.min(Math.abs(5 - mouthHeight) / 20, 0.25));
  }
  // Surprised: mouth open, eyes wide
  else if (mouthHeight > 20 && eyeOpenness > 15) {
    emotion = 'surprised';
    confidence = 0.85;
  }
  // Angry: eyebrows down and close, mouth tight
  else if (eyebrowHeight < 3 && mouthHeight < 8) {
    emotion = 'angry';
    confidence = 0.7;
  }

  return { type: emotion, confidence: Math.min(confidence, 1) };
}

// Get emotion confidence scores
export function getEmotionScores(landmarks: number[][]): Record<string, number> {
  const emotion = analyzeEmotionFromLandmarks(landmarks);
  
  return {
    neutral: emotion.type === 'neutral' ? emotion.confidence : 0.1,
    happy: emotion.type === 'happy' ? emotion.confidence : 0.1,
    sad: emotion.type === 'sad' ? emotion.confidence : 0.1,
    angry: emotion.type === 'angry' ? emotion.confidence : 0.1,
    surprised: emotion.type === 'surprised' ? emotion.confidence : 0.1
  };
}

// Cleanup
export function disposeModel(): void {
  if (model) {
    model.dispose();
    model = null;
  }
}
