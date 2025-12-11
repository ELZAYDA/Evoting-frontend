// verification-data.service.ts
import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

export interface VerificationData {
  nationalId: string;
  voterId: number;
  fullName?: string;
  
  // ID Card
  idCardUploaded?: boolean;
  idCardVerified?: boolean;
  idCardImage?: string;
  idCardFileName?: string;
  idCardUploadTime?: Date;
  
  // Face Verification
  faceCaptured?: boolean;
  faceVerified?: boolean;
  faceImage?: string;
  faceFileName?: string;
  faceCaptureTime?: Date;
  
  // Results
  verificationResult?: any;
  faceMatchPercentage?: number;
  verificationTime?: Date;
  
  // Verification Status
  overallVerified?: boolean;
  verificationStatus?: 'pending' | 'verified' | 'failed';
  
  // Progress
  currentStep: 'id-card' | 'face-capture' | 'verification' | 'complete';
  stepsCompleted: string[];
  
  // Metadata
  sessionId: string;
  startedAt: Date;
  lastUpdated: Date;
  deviceInfo?: {
    userAgent: string;
    platform: string;
    isMobile: boolean;
  };
}

export interface VerificationProgress {
  currentStep: number;
  totalSteps: number;
  percentage: number;
  stepName: string;
  stepDescription: string;
}

@Injectable({
  providedIn: 'root'
})
export class VerificationDataService {
  private storageKey = 'face_verification_data';
  private sessionStorageKey = 'verification_session';
  private verificationStatusKey = 'user_verification_status';
  
  private verificationDataSubject = new BehaviorSubject<VerificationData | null>(null);
  verificationData$ = this.verificationDataSubject.asObservable();
  
  private progressSubject = new BehaviorSubject<VerificationProgress>({
    currentStep: 1,
    totalSteps: 3,
    percentage: 33,
    stepName: 'ID Card Upload',
    stepDescription: 'Upload your national ID card'
  });
  progress$ = this.progressSubject.asObservable();

  constructor() {
    this.initializeVerificationData();
  }

  private initializeVerificationData(): void {
    const existingData = this.getData();
    if (existingData) {
      this.verificationDataSubject.next(existingData);
      this.updateProgress(existingData.currentStep);
    } else {
      this.createNewSession();
    }
  }

  createNewSession(nationalId?: string, voterId?: number): VerificationData {
    const sessionId = this.generateSessionId();
    
    const newData: VerificationData = {
      nationalId: nationalId || '',
      voterId: voterId || 0,
      currentStep: 'id-card',
      stepsCompleted: [],
      sessionId: sessionId,
      startedAt: new Date(),
      lastUpdated: new Date(),
      deviceInfo: this.getDeviceInfo(),
      verificationStatus: 'pending'
    };
    
    this.saveData(newData);
    this.verificationDataSubject.next(newData);
    this.updateProgress('id-card');
    
    return newData;
  }

  saveData(data: VerificationData): void {
    data.lastUpdated = new Date();
    
    // حفظ في session storage للجلسة الحالية
    sessionStorage.setItem(this.storageKey, JSON.stringify(data));
    
    // حفظ في localStorage للحالة العامة (بدون صور)
    const { idCardImage, faceImage, ...dataWithoutImages } = data;
    localStorage.setItem(this.sessionStorageKey, JSON.stringify({
      ...dataWithoutImages,
      hasIdCardImage: !!idCardImage,
      hasFaceImage: !!faceImage
    }));
    
    this.verificationDataSubject.next(data);
  }

  getData(): VerificationData | null {
    try {
      const data = sessionStorage.getItem(this.storageKey);
      return data ? JSON.parse(data) : null;
    } catch (error) {
      console.error('Error reading verification data:', error);
      return null;
    }
  }

  updateData(updates: Partial<VerificationData>): void {
    const currentData = this.getData();
    
    if (!currentData) {
      this.createNewSession();
      return;
    }
    
    const updatedData = { 
      ...currentData, 
      ...updates,
      lastUpdated: new Date()
    };
    
    if (updates.currentStep) {
      if (!updatedData.stepsCompleted.includes(updates.currentStep)) {
        updatedData.stepsCompleted.push(updates.currentStep);
      }
      this.updateProgress(updates.currentStep);
    }
    
    this.saveData(updatedData);
  }

  private updateProgress(currentStep: VerificationData['currentStep']): void {
    const stepMap = {
      'id-card': 1,
      'face-capture': 2,
      'verification': 3,
      'complete': 4
    };
    
    const currentStepNumber = stepMap[currentStep];
    const totalSteps = 4;
    const percentage = Math.round((currentStepNumber / totalSteps) * 100);
    
    const stepInfo = {
      'id-card': {
        name: 'ID Card Upload',
        description: 'Upload your national ID card'
      },
      'face-capture': {
        name: 'Face Capture',
        description: 'Take a selfie for verification'
      },
      'verification': {
        name: 'Verification',
        description: 'Comparing your face with ID card'
      },
      'complete': {
        name: 'Complete',
        description: 'Verification completed'
      }
    };
    
    const progress: VerificationProgress = {
      currentStep: currentStepNumber,
      totalSteps: totalSteps,
      percentage: percentage,
      stepName: stepInfo[currentStep].name,
      stepDescription: stepInfo[currentStep].description
    };
    
    this.progressSubject.next(progress);
  }

  // ✅ NEW: حفظ حالة التحقق النهائية في localStorage
  saveVerificationStatus(
    verified: boolean, 
    matchPercentage?: number, 
    verificationResult?: any
  ): void {
    const userData = this.getData();
    const nationalId = userData?.nationalId || '';
    const voterId = userData?.voterId || 0;
    
    // حفظ في localStorage للحالة العامة
    const verificationStatus = {
      nationalId,
      voterId,
      verified,
      matchPercentage: matchPercentage || verificationResult?.confidence || 0,
      verificationResult,
      verificationTime: new Date().toISOString(),
      sessionId: userData?.sessionId || this.generateSessionId()
    };
    
    localStorage.setItem(this.verificationStatusKey, JSON.stringify(verificationStatus));
    
    // تحديث البيانات الحالية
    this.updateData({
      overallVerified: verified,
      verificationStatus: verified ? 'verified' : 'failed',
      faceMatchPercentage: matchPercentage,
      verificationResult: verificationResult,
      verificationTime: new Date(),
      currentStep: 'complete'
    });
    
    console.log('✅ Verification status saved to localStorage:', verificationStatus);
  }

  // ✅ NEW: الحصول على حالة التحقق السابقة
  getVerificationStatus(): any {
    try {
      const status = localStorage.getItem(this.verificationStatusKey);
      return status ? JSON.parse(status) : null;
    } catch (error) {
      console.error('Error reading verification status:', error);
      return null;
    }
  }

  // ✅ NEW: التحقق مما إذا كان المستخدم قد تحقق مسبقاً
  isUserVerified(nationalId?: string): boolean {
    const status = this.getVerificationStatus();
    if (!status) return false;
    
    if (nationalId) {
      return status.verified === true && status.nationalId === nationalId;
    }
    
    return status.verified === true;
  }

  resetSession(): void {
    sessionStorage.removeItem(this.storageKey);
    this.verificationDataSubject.next(null);
    
    const progress: VerificationProgress = {
      currentStep: 1,
      totalSteps: 3,
      percentage: 33,
      stepName: 'ID Card Upload',
      stepDescription: 'Upload your national ID card'
    };
    
    this.progressSubject.next(progress);
  }

  private generateSessionId(): string {
    return 'session_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
  }

  private getDeviceInfo(): VerificationData['deviceInfo'] {
    return {
      userAgent: navigator.userAgent,
      platform: navigator.platform,
      isMobile: /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)
    };
  }
}