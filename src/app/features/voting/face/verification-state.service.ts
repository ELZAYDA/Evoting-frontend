import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { ImageFile } from '../face/face.models';

@Injectable({
  providedIn: 'root'
})
export class VerificationStateService {
  private readonly STORAGE_KEY = 'face_verification_data';
  
  private verificationData = new BehaviorSubject<any>(null);
  verificationData$ = this.verificationData.asObservable();
  
  private idCardImage = new BehaviorSubject<ImageFile | null>(null);
  idCardImage$ = this.idCardImage.asObservable();
  
  private faceImage = new BehaviorSubject<ImageFile | null>(null);
  faceImage$ = this.faceImage.asObservable();
  
  private currentStep = new BehaviorSubject<number>(1);
  currentStep$ = this.currentStep.asObservable();
  
  private isVerified = new BehaviorSubject<boolean>(false);
  isVerified$ = this.isVerified.asObservable();

  constructor() {
    this.loadFromStorage();
  }

  // ID Card Methods
  setIdCardImage(file: File): void {
    const imageFile: ImageFile = {
      file,
      previewUrl: URL.createObjectURL(file),
      name: file.name,
      size: file.size,
      uploadedAt: new Date()
    };
    
    this.idCardImage.next(imageFile);
    this.currentStep.next(2);
    this.saveToStorage();
  }

  clearIdCardImage(): void {
    this.idCardImage.next(null);
    this.saveToStorage();
  }

  // Face Image Methods
  setFaceImage(file: File): void {
    const imageFile: ImageFile = {
      file,
      previewUrl: URL.createObjectURL(file),
      name: file.name,
      size: file.size,
      uploadedAt: new Date()
    };
    
    this.faceImage.next(imageFile);
    this.currentStep.next(3);
    this.saveToStorage();
  }

  clearFaceImage(): void {
    this.faceImage.next(null);
    this.saveToStorage();
  }

  // Verification Methods
  setVerificationResult(result: any): void {
    this.verificationData.next(result);
    this.isVerified.next(result?.verified || false);
    this.saveToStorage();
  }

  // Step Management
  goToStep(step: number): void {
    this.currentStep.next(step);
  }

  resetVerification(): void {
    this.idCardImage.next(null);
    this.faceImage.next(null);
    this.verificationData.next(null);
    this.currentStep.next(1);
    this.isVerified.next(false);
    sessionStorage.removeItem(this.STORAGE_KEY);
  }

  // Storage Methods
  private saveToStorage(): void {
    const data = {
      idCardImage: this.idCardImage.value,
      faceImage: this.faceImage.value,
      verificationData: this.verificationData.value,
      currentStep: this.currentStep.value,
      isVerified: this.isVerified.value,
      timestamp: new Date().toISOString()
    };
    
    sessionStorage.setItem(this.STORAGE_KEY, JSON.stringify(data));
  }

  private loadFromStorage(): void {
    const storedData = sessionStorage.getItem(this.STORAGE_KEY);
    
    if (storedData) {
      try {
        const data = JSON.parse(storedData);
        
        if (data.idCardImage) {
          this.idCardImage.next(data.idCardImage);
        }
        
        if (data.faceImage) {
          this.faceImage.next(data.faceImage);
        }
        
        if (data.verificationData) {
          this.verificationData.next(data.verificationData);
          this.isVerified.next(data.verificationData.verified || false);
        }
        
        if (data.currentStep) {
          this.currentStep.next(data.currentStep);
        }
      } catch (error) {
        console.error('Error loading from storage:', error);
        sessionStorage.removeItem(this.STORAGE_KEY);
      }
    }
  }

  // Getters
  getIdCardImage(): ImageFile | null {
    return this.idCardImage.value;
  }

  getFaceImage(): ImageFile | null {
    return this.faceImage.value;
  }

  getCurrentStep(): number {
    return this.currentStep.value;
  }

  getIsVerified(): boolean {
    return this.isVerified.value;
  }

  getVerificationData(): any {
    return this.verificationData.value;
  }

  // Validation
  canProceedToVerification(): boolean {
    return !!this.idCardImage.value && !!this.faceImage.value;
  }
}