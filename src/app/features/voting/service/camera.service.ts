import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';

export interface CameraDevice {
  deviceId: string;
  label: string;
  kind: 'videoinput' | 'audioinput';
}

export interface CameraState {
  isActive: boolean;
  isStreaming: boolean;
  hasPermission: boolean;
  currentDevice?: CameraDevice;
  availableDevices: CameraDevice[];
  error?: string;
}

@Injectable({
  providedIn: 'root'
})
export class CameraService {
  private mediaStream: MediaStream | null = null;
  private cameraStateSubject = new BehaviorSubject<CameraState>({
    isActive: false,
    isStreaming: false,
    hasPermission: false,
    availableDevices: []
  });
  
  cameraState$ = this.cameraStateSubject.asObservable();

  constructor() {
    this.checkInitialPermission();
  }

  /**
   * التحقق من الإذن المبدئي
   */
  private async checkInitialPermission(): Promise<void> {
    try {
      const devices = await navigator.mediaDevices.enumerateDevices();
      const videoDevices = devices.filter(device => device.kind === 'videoinput');
      const hasPermission = videoDevices.some(device => device.label);
      
      this.cameraStateSubject.next({
        ...this.cameraStateSubject.value,
        hasPermission,
        availableDevices: videoDevices.map(device => ({
          deviceId: device.deviceId,
          label: device.label || `Camera ${device.deviceId.slice(0, 5)}`,
          kind: device.kind as 'videoinput'
        }))
      });
    } catch (error) {
      console.error('Error checking camera permission:', error);
    }
  }

  /**
   * تشغيل الكاميرا
   */
  async startCamera(deviceId?: string): Promise<MediaStream> {
    try {
      // إيقاف الكاميرا الحالية إذا كانت تعمل
      if (this.mediaStream) {
        this.stopCamera();
      }

      const constraints: MediaStreamConstraints = {
        video: deviceId ? { 
          deviceId: { exact: deviceId },
          width: { ideal: 1280 },
          height: { ideal: 720 },
          facingMode: 'user'
        } : {
          width: { ideal: 1280 },
          height: { ideal: 720 },
          facingMode: 'user'
        },
        audio: false
      };

      this.mediaStream = await navigator.mediaDevices.getUserMedia(constraints);
      
      // تحديث حالة الكاميرا
      const devices = await navigator.mediaDevices.enumerateDevices();
      const videoDevices = devices.filter(device => device.kind === 'videoinput');
      const currentDevice = videoDevices.find(device => 
        device.deviceId === this.mediaStream?.getVideoTracks()[0]?.getSettings().deviceId
      );

      this.cameraStateSubject.next({
        isActive: true,
        isStreaming: true,
        hasPermission: true,
        currentDevice: currentDevice ? {
          deviceId: currentDevice.deviceId,
          label: currentDevice.label || 'Front Camera',
          kind: currentDevice.kind as 'videoinput'
        } : undefined,
        availableDevices: videoDevices.map(device => ({
          deviceId: device.deviceId,
          label: device.label || `Camera ${device.deviceId.slice(0, 5)}`,
          kind: device.kind as 'videoinput'
        }))
      });

      return this.mediaStream;

    } catch (error: any) {
      const errorMessage = this.getCameraErrorMessage(error);
      this.cameraStateSubject.next({
        ...this.cameraStateSubject.value,
        error: errorMessage
      });
      throw error;
    }
  }

  /**
   * إيقاف الكاميرا
   */
  stopCamera(): void {
    if (this.mediaStream) {
      this.mediaStream.getTracks().forEach(track => {
        track.stop();
      });
      this.mediaStream = null;
    }

    this.cameraStateSubject.next({
      ...this.cameraStateSubject.value,
      isActive: false,
      isStreaming: false
    });
  }

  /**
   * التقاط صورة من الفيديو
   */
  captureImage(videoElement: HTMLVideoElement): Promise<Blob> {
    return new Promise((resolve, reject) => {
      const canvas = document.createElement('canvas');
      const context = canvas.getContext('2d');
      
      if (!context) {
        reject(new Error('Could not get canvas context'));
        return;
      }

      // تعيين أبعاد الكانفاس لتتناسب مع الفيديو
      canvas.width = videoElement.videoWidth;
      canvas.height = videoElement.videoHeight;

      // رسم الإطار الحالي على الكانفاس
      context.drawImage(videoElement, 0, 0, canvas.width, canvas.height);

      // تحويل الكانفاس إلى blob
      canvas.toBlob((blob) => {
        if (blob) {
          resolve(blob);
        } else {
          reject(new Error('Failed to capture image'));
        }
      }, 'image/jpeg', 0.95); // جودة 95%
    });
  }

  /**
   * تبديل الكاميرا
   */
  async switchCamera(): Promise<MediaStream> {
    const currentState = this.cameraStateSubject.value;
    if (!currentState.availableDevices.length) {
      throw new Error('No cameras available');
    }

    if (currentState.availableDevices.length === 1) {
      return this.startCamera(currentState.availableDevices[0].deviceId);
    }

    // إيجاد الكاميرا التالية
    const currentIndex = currentState.currentDevice 
      ? currentState.availableDevices.findIndex(
          device => device.deviceId === currentState.currentDevice?.deviceId
        )
      : -1;
    
    const nextIndex = (currentIndex + 1) % currentState.availableDevices.length;
    const nextDevice = currentState.availableDevices[nextIndex];

    return this.startCamera(nextDevice.deviceId);
  }

  /**
   * الحصول على أخطاء الكاميرا كرسائل مفهومة
   */
  private getCameraErrorMessage(error: any): string {
    if (error.name === 'NotAllowedError' || error.name === 'PermissionDeniedError') {
      return 'Camera access denied. Please allow camera permissions in your browser settings.';
    } else if (error.name === 'NotFoundError' || error.name === 'DevicesNotFoundError') {
      return 'No camera found. Please connect a camera to your device.';
    } else if (error.name === 'NotReadableError' || error.name === 'TrackStartError') {
      return 'Camera is already in use by another application.';
    } else if (error.name === 'OverconstrainedError') {
      return 'Unable to start camera with requested constraints.';
    } else if (error.name === 'AbortError') {
      return 'Camera operation was aborted.';
    } else if (error.name === 'SecurityError') {
      return 'Camera access is not allowed in this context.';
    } else if (error.name === 'TypeError') {
      return 'Invalid camera constraints specified.';
    } else {
      return `Unable to access camera: ${error.message || 'Unknown error'}`;
    }
  }

  /**
   * التحقق مما إذا كان المتصفح يدعم الكاميرا
   */
  isCameraSupported(): boolean {
    return !!navigator.mediaDevices && !!navigator.mediaDevices.getUserMedia;
  }

  /**
   * الحصول على حالة الكاميرا الحالية
   */
  getCameraState(): CameraState {
    return this.cameraStateSubject.value;
  }

  /**
   * تنظيف الموارد
   */
  ngOnDestroy(): void {
    this.stopCamera();
    this.cameraStateSubject.complete();
  }
}