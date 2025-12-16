import { Injectable } from '@angular/core';
import { Observable, from, throwError, of } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { CameraConfig } from '../face/face.models';

@Injectable({
  providedIn: 'root'
})
export class CameraService {
  private stream: MediaStream | null = null;
  private defaultConfig: CameraConfig = {
    width: 1280,
    height: 720,
    facingMode: 'user',
    frameRate: 30
  };

  constructor() { }

  requestCameraAccess(config?: Partial<CameraConfig>): Observable<MediaStream> {
    this.stopCamera();
    
    const cameraConfig = { ...this.defaultConfig, ...config };
    
    const constraints: MediaStreamConstraints = {
      video: {
        width: { ideal: cameraConfig.width },
        height: { ideal: cameraConfig.height },
        facingMode: cameraConfig.facingMode,
        frameRate: { ideal: cameraConfig.frameRate }
      },
      audio: false
    };

    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      return throwError(() => new Error('Camera API is not supported by this browser'));
    }

    return from(navigator.mediaDevices.getUserMedia(constraints))
      .pipe(
        map(stream => {
          this.stream = stream;
          return stream;
        }),
        catchError(error => {
          const errorMessage = this.getErrorMessage(error);
          return throwError(() => new Error(errorMessage));
        })
      );
  }

  stopCamera(): void {
    if (this.stream) {
      this.stream.getTracks().forEach(track => {
        track.stop();
      });
      this.stream = null;
    }
  }

  capturePhoto(videoElement: HTMLVideoElement): Observable<Blob> {
    return new Observable<Blob>(observer => {
      if (!videoElement || !this.stream) {
        observer.error(new Error('Camera not active'));
        return;
      }

      const canvas = document.createElement('canvas');
      const context = canvas.getContext('2d');
      
      if (!context) {
        observer.error(new Error('Canvas context not available'));
        return;
      }

      // التحقق من جاهزية الفيديو
      const checkVideoReady = () => {
        if (videoElement.videoWidth > 0 && videoElement.videoHeight > 0) {
          canvas.width = videoElement.videoWidth;
          canvas.height = videoElement.videoHeight;

          context.drawImage(videoElement, 0, 0, canvas.width, canvas.height);

          canvas.toBlob(
            (blob) => {
              if (blob) {
                observer.next(blob);
                observer.complete();
              } else {
                observer.error(new Error('Failed to capture image'));
              }
            },
            'image/jpeg',
            0.95
          );
        } else {
          // الانتظار حتى يكون الفيديو جاهزاً
          setTimeout(checkVideoReady, 100);
        }
      };

      checkVideoReady();
    });
  }

  takePhotoWithCountdown(videoElement: HTMLVideoElement, countdownSeconds: number = 3): Observable<{ countdown: number, photo?: Blob }> {
    return new Observable(observer => {
      let countdown = countdownSeconds;
      
      const interval = setInterval(() => {
        observer.next({ countdown });
        countdown--;
        
        if (countdown < 0) {
          clearInterval(interval);
          
          this.capturePhoto(videoElement).subscribe({
            next: (photo) => {
              observer.next({ countdown: 0, photo });
              observer.complete();
            },
            error: (error) => {
              observer.error(error);
            }
          });
        }
      }, 1000);
    });
  }

  private getErrorMessage(error: any): string {
    switch (error.name) {
      case 'NotAllowedError':
      case 'PermissionDeniedError':
        return 'Camera access denied. Please allow camera permissions in your browser settings.';
      
      case 'NotFoundError':
      case 'DevicesNotFoundError':
        return 'No camera found. Please connect a camera or use photo upload.';
      
      case 'NotReadableError':
      case 'TrackStartError':
        return 'Camera is already in use by another application.';
      
      case 'OverconstrainedError':
        return 'Camera does not support the requested settings.';
      
      default:
        return 'Unable to access camera. Please try again or upload a photo.';
    }
  }

  getAvailableCameras(): Observable<MediaDeviceInfo[]> {
    if (!navigator.mediaDevices || !navigator.mediaDevices.enumerateDevices) {
      return throwError(() => new Error('Device enumeration not supported'));
    }

    return from(navigator.mediaDevices.enumerateDevices())
      .pipe(
        map(devices => devices.filter(device => device.kind === 'videoinput')),
        catchError(error => {
          console.error('Error enumerating devices:', error);
          return throwError(() => new Error('Cannot access camera devices'));
        })
      );
  }

  switchCamera(facingMode: 'user' | 'environment'): Observable<MediaStream> {
    return this.requestCameraAccess({ facingMode });
  }

  isCameraAvailable(): boolean {
    return !!navigator.mediaDevices && !!navigator.mediaDevices.getUserMedia;
  }

  setStream(stream: MediaStream | null): void {
    this.stream = stream;
  }

  getStream(): MediaStream | null {
    return this.stream;
  }

  // دالة مساعدة للتحقق من حالة الكاميرا
  checkCameraStatus(): Observable<boolean> {
    if (!this.isCameraAvailable()) {
      return of(false);
    }

    return this.requestCameraAccess({ width: 640, height: 480 })
      .pipe(
        map(stream => {
          this.stopCamera(); // إغلاق بعد التحقق
          return true;
        }),
        catchError(() => of(false))
      );
  }
}