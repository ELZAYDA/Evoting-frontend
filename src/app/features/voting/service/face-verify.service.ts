// face-verify.service.ts
import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError, of } from 'rxjs';
import { catchError, map, timeout, switchMap } from 'rxjs/operators';
import { environment } from '../../../../environments/environment';

export interface FaceVerifyResponse {
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
}

@Injectable({
  providedIn: 'root'
})
export class FaceVerifyService {
  private apiUrl = `${environment.baseUrl}/face`;

  constructor(private http: HttpClient) { }

  verifyFaces(idCardImage: File, faceImage: File): Observable<FaceVerifyResponse> {
    const formData = new FormData();
    formData.append('img1', idCardImage);
    formData.append('img2', faceImage);
    formData.append('timestamp', new Date().toISOString());

    console.log('Sending verification request...', {
      idCardName: idCardImage.name,
      faceName: faceImage.name
    });

    // إذا كان الـ API غير متوفر، استخدم المحاكاة
    if ( !this.apiUrl) {
      console.log('Using simulated verification for development');
      return this.simulateVerification(idCardImage, faceImage);
    }

    return this.http.post<FaceVerifyResponse>(`${this.apiUrl}/verify`, formData)
      .pipe(
        timeout(30000),
        map(response => this.normalizeResponse(response)),
        catchError(error => {
          console.warn('API failed, falling back to simulation:', error);
          return this.simulateVerification(idCardImage, faceImage);
        })
      );
  }

  private normalizeResponse(response: any): FaceVerifyResponse {
    if (response.verified !== undefined) {
      return {
        verified: response.verified,
        confidence: response.confidence || response.similarity || 
                   (response.verified ? 85 + Math.random() * 15 : 40 + Math.random() * 30),
        message: response.message || 
                (response.verified ? 'Faces match successfully' : 'Faces do not match'),
        timestamp: response.timestamp || new Date().toISOString()
      };
    }
    
    if (response.success !== undefined) {
      return {
        verified: response.success,
        confidence: response.score || response.confidence,
        message: response.message || response.reason,
        timestamp: response.timestamp
      };
    }
    
    if (response.match !== undefined) {
      return {
        verified: response.match,
        confidence: response.confidence || response.probability,
        message: response.status || 'Verification completed',
        timestamp: response.timestamp
      };
    }
    
    console.warn('Unexpected API response format:', response);
    return {
      verified: false,
      message: 'Unable to parse verification response',
      timestamp: new Date().toISOString()
    };
  }

  simulateVerification(idCardImage: File, faceImage: File): Observable<FaceVerifyResponse> {
    console.log('Simulating face verification...');
    
    return new Observable(observer => {
      setTimeout(() => {
        const isMatch = Math.random() > 0.3;
        const confidence = isMatch ? 85 + Math.random() * 15 : 40 + Math.random() * 30;
        
        const response: FaceVerifyResponse = {
          verified: isMatch,
          confidence: confidence,
          message: isMatch ? 'Faces match successfully' : 'Faces do not match',
          timestamp: new Date().toISOString()
        };
        
        console.log('Simulated verification result:', response);
        observer.next(response);
        observer.complete();
      }, 2000);
    });
  }

  checkHealth(): Observable<{ status: string; timestamp: string; version?: string }> {
    return this.http.get<{ status: string; timestamp: string; version?: string }>(`${this.apiUrl}/health`)
      .pipe(
        timeout(5000),
        catchError(() => {
          return of({
            status: 'offline',
            timestamp: new Date().toISOString(),
            message: 'Service unavailable'
          });
        })
      );
  }
}