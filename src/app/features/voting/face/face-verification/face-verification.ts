import { Component, OnInit, ViewChild, ElementRef, OnDestroy, AfterViewInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { FaceVerifyService } from '../face-verify.service';
import { VerificationStateService } from '../verification-state.service';
import { CameraService } from '../camera.service';
import { Subscription, Observable, firstValueFrom } from 'rxjs';
import { VerificationStep } from '../face.models';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-face-verification',
  templateUrl: './face-verification.html',
  styleUrls: ['./face-verification.css'],
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule]
})
export class FaceVerificationComponent implements OnInit, AfterViewInit, OnDestroy {
  @ViewChild('videoElement') videoElement!: ElementRef<HTMLVideoElement>;
  @ViewChild('fileInput') fileInput!: ElementRef<HTMLInputElement>;
  
  // Steps
  steps: VerificationStep[] = [
    { step: 1, title: 'Upload ID Card', icon: 'id-card', description: 'Upload your national ID card', completed: false, active: true },
    { step: 2, title: 'Capture Selfie', icon: 'camera', description: 'Take a live photo with your camera', completed: false, active: false },
    { step: 3, title: 'Verify', icon: 'user-check', description: 'Face comparison and verification', completed: false, active: false }
  ];
  
  // State
  currentStep$: Observable<number>;
  idCardImage$: Observable<any>;
  faceImage$: Observable<any>;
  isVerified$: Observable<boolean>;
  
  // UI State
  loading = false;
  verifying = false;
  cameraActive = false;
  showCamera = false;
  isCapturing = false;
  countdown = 0;
  
  // Messages
  successMessage = '';
  errorMessage = '';
  warningMessage = '';
  
  // Results
  verificationResult: any = null;
  matchPercentage = 0;
  isMatch = false;
  
  // Camera
  cameraError = '';
  private stream: MediaStream | null = null;
  private subscriptions: Subscription[] = [];

  constructor(
    public faceVerifyService: FaceVerifyService,
    public stateService: VerificationStateService,
    private cameraService: CameraService
  ) {
    this.currentStep$ = this.stateService.currentStep$;
    this.idCardImage$ = this.stateService.idCardImage$;
    this.faceImage$ = this.stateService.faceImage$;
    this.isVerified$ = this.stateService.isVerified$;
  }

  ngOnInit(): void {
    this.loadInitialState();
  }

  ngAfterViewInit(): void {
    setTimeout(() => {
      if (this.stateService.getCurrentStep() === 2) {
        this.startCamera();
      }
    }, 300);
  }

  ngOnDestroy(): void {
    this.stopCamera();
    this.subscriptions.forEach(sub => sub.unsubscribe());
  }

  private loadInitialState(): void {
    const currentStep = this.stateService.getCurrentStep();
    
    if (currentStep > 1) {
      this.updateSteps(currentStep);
    }
    
    if (this.stateService.getIsVerified()) {
      this.verificationResult = this.stateService.getVerificationData();
      this.isMatch = this.verificationResult?.verified || false;
      this.matchPercentage = this.verificationResult?.confidence || 0;
      this.updateSteps(3);
    }
  }

  // Step 1: Upload ID Card
  onIdCardSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (!input.files || input.files.length === 0) return;

    const file = input.files[0];
    
    if (!this.validateImageFile(file)) {
      this.errorMessage = 'Invalid file. Please upload JPG/PNG image (max 5MB)';
      return;
    }

    this.loading = true;
    this.stateService.setIdCardImage(file);
    this.updateSteps(2);
    
    setTimeout(() => {
      this.startCamera();
      this.loading = false;
    }, 500);
  }

  // Step 2: Camera Operations
  async startCamera(): Promise<void> {
    if (this.cameraActive || this.stateService.getIsVerified()) return;

    try {
      this.cameraError = '';
      this.showCamera = true;
      
      // استخدام firstValueFrom بدلاً من toPromise
      const stream = await firstValueFrom(this.cameraService.requestCameraAccess());
      
      if (stream) {
        this.stream = stream;
        
        if (this.videoElement?.nativeElement) {
          this.videoElement.nativeElement.srcObject = this.stream;
          
          // استخدام promise لضمان التشغيل
          try {
            await this.videoElement.nativeElement.play();
            this.cameraActive = true;
            this.cameraService.setStream(stream);
            
            this.warningMessage = 'Position your face in the center and click "Capture Selfie"';
          } catch (playError) {
            console.error('Error playing video:', playError);
            this.cameraError = 'Failed to start camera preview';
            this.cameraActive = false;
            this.showCamera = false;
          }
        }
      }
    } catch (error: any) {
      console.error('Camera error:', error);
      this.cameraError = error.message;
      this.errorMessage = this.cameraError;
      this.showCamera = false;
      this.cameraActive = false;
    }
  }

  stopCamera(): void {
    this.cameraService.stopCamera();
    this.cameraActive = false;
    this.showCamera = false;
    this.stream = null;
  }

  captureSelfie(): void {
    if (!this.cameraActive || !this.videoElement?.nativeElement || this.isCapturing) {
      this.errorMessage = 'Camera not ready';
      return;
    }

    this.isCapturing = true;
    this.errorMessage = '';
    this.warningMessage = '';

    const countdownSub = this.cameraService.takePhotoWithCountdown(
      this.videoElement.nativeElement,
      3
    ).subscribe({
      next: (data) => {
        if (data.countdown !== undefined) {
          this.countdown = data.countdown;
        }
        
        if (data.photo) {
          this.handleCapturedPhoto(data.photo);
        }
      },
      error: (error) => {
        this.errorMessage = error.message;
        this.isCapturing = false;
        this.countdown = 0;
      }
    });

    this.subscriptions.push(countdownSub);
  }

  private handleCapturedPhoto(blob: Blob): void {
    const file = new File([blob], `selfie_${Date.now()}.jpg`, { type: 'image/jpeg' });
    
    this.stateService.setFaceImage(file);
    this.updateSteps(3);
    
    this.stopCamera();
    this.isCapturing = false;
    this.countdown = 0;
    
    this.warningMessage = 'Selfie captured! Ready for verification.';
  }

  uploadSelfie(): void {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';
    
    input.onchange = (event: Event) => {
      const target = event.target as HTMLInputElement;
      if (target.files && target.files[0]) {
        const file = target.files[0];
        
        if (!this.validateImageFile(file)) return;

        this.stateService.setFaceImage(file);
        this.updateSteps(3);
        this.errorMessage = '';
        this.warningMessage = 'Selfie uploaded! Ready for verification.';
      }
    };
    
    input.click();
  }

  // Step 3: Verification
  verifyFaces(): void {
    const idCardImage = this.stateService.getIdCardImage();
    const faceImage = this.stateService.getFaceImage();
    
    if (!idCardImage || !faceImage) {
      this.errorMessage = 'Both ID card and selfie are required';
      return;
    }

    this.verifying = true;
    this.errorMessage = '';
    this.successMessage = '';

    const verifySub = this.faceVerifyService.verifyFaces(idCardImage.file, faceImage.file)
      .subscribe({
        next: (response) => {
          this.handleVerificationResponse(response);
        },
        error: (error) => {
          this.handleVerificationError(error);
        },
        complete: () => {
          this.verifying = false;
        }
      });

    this.subscriptions.push(verifySub);
  }

  private handleVerificationResponse(response: any): void {
    this.verificationResult = response;
    this.isMatch = response.verified === true;
    this.matchPercentage = response.confidence || 0;
    
    this.stateService.setVerificationResult(response);
    this.updateSteps(3);
    
    if (this.isMatch) {
      this.successMessage = `✅ Verification Successful! Match: ${this.matchPercentage.toFixed(1)}%`;
    } else {
      this.errorMessage = `❌ Verification Failed. Similarity: ${this.matchPercentage.toFixed(1)}%`;
      if (response.message) {
        this.errorMessage += ` - ${response.message}`;
      }
    }
  }

  private handleVerificationError(error: any): void {
    console.error('Verification error:', error);
    this.errorMessage = 'Verification service is temporarily unavailable. Please try again later.';
    this.verifying = false;
  }

  // Navigation
  goToStep(step: number): void {
    if (this.stateService.getIsVerified() && step < 3) {
      this.errorMessage = 'You are already verified. Cannot go back.';
      return;
    }

    if (step < 1 || step > 3) return;
    
    this.stateService.goToStep(step);
    this.updateSteps(step);
    
    if (step === 2 && !this.cameraActive) {
      setTimeout(() => this.startCamera(), 300);
    }
  }

  retryCapture(): void {
    if (this.stateService.getIsVerified()) {
      this.errorMessage = 'You are already verified. Cannot retake photo.';
      return;
    }

    this.stateService.clearFaceImage();
    this.updateSteps(2);
    this.startCamera();
  }

  restartProcess(): void {
    this.stateService.resetVerification();
    this.resetUI();
    this.updateSteps(1);
  }

  // Helpers
  private updateSteps(currentStep: number): void {
    this.steps.forEach(step => {
      step.completed = step.step < currentStep;
      step.active = step.step === currentStep;
    });
  }

  private validateImageFile(file: File): boolean {
    const validTypes = ['image/jpeg', 'image/png', 'image/jpg', 'image/webp'];
    const maxSize = 5 * 1024 * 1024; // 5MB
    
    if (!validTypes.includes(file.type)) {
      return false;
    }
    
    if (file.size > maxSize) {
      return false;
    }
    
    return true;
  }

  private resetUI(): void {
    this.loading = false;
    this.verifying = false;
    this.cameraActive = false;
    this.showCamera = false;
    this.isCapturing = false;
    this.countdown = 0;
    
    this.successMessage = '';
    this.errorMessage = '';
    this.warningMessage = '';
    
    this.verificationResult = null;
    this.matchPercentage = 0;
    this.isMatch = false;
    this.cameraError = '';
  }

  // Getters for template
  getStepTitle(): string {
    return this.steps.find(s => s.active)?.title || 'Face Verification';
  }

  isStepComplete(step: number): boolean {
    return this.steps.find(s => s.step === step)?.completed || false;
  }

  canProceedToVerification(): boolean {
    return this.stateService.canProceedToVerification();
  }

  formatFileSize(bytes: number): string {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }

  // دالة مساعدة للحصول على الـ stream الحالي
  getCurrentStream(): MediaStream | null {
    return this.stream;
  }
}