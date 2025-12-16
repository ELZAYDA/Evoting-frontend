export interface FaceVerificationRequest {
  img1: File;
  img2: File;
}

export interface FaceVerificationResponse {
  verified: boolean;
  confidence?: number;
  similarity?: number;
  message?: string;
  timestamp?: string;
  error?: string;
}

export interface VerificationStatus {
  status: 'pending' | 'processing' | 'completed' | 'failed';
  message?: string;
  progress?: number;
  step?: number;
}

export interface VerificationStep {
  step: number;
  title: string;
  icon: string;
  description: string;
  completed: boolean;
  active: boolean;
}

export interface CameraConfig {
  width: number;
  height: number;
  facingMode: 'user' | 'environment';
  frameRate: number;
}

export interface ImageFile {
  file: File;
  previewUrl: string;
  name: string;
  size: number;
  uploadedAt: Date;
}