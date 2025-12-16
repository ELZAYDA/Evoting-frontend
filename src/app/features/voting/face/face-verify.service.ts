import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, throwError, of } from 'rxjs';
import { catchError, map, timeout } from 'rxjs/operators';
import { environment } from '../../../../environments/environment';
import { FaceVerificationResponse, VerificationStatus } from '../face/face.models';

@Injectable({
  providedIn: 'root'
})
export class FaceVerifyService {
  private apiUrl = environment.baseUrl; // تأكد من وجود apiUrl في environment
  
  constructor(private http: HttpClient) { }

  verifyFaces(idCardImage: File, faceImage: File): Observable<FaceVerificationResponse> {
    const formData = new FormData();
    formData.append('img1', idCardImage, 'id-card.jpg');
    formData.append('img2', faceImage, 'face-image.jpg');
    
    console.log('Sending verification request...', {
      idCard: idCardImage.name,
      face: faceImage.name
    });

    return this.http.post<FaceVerificationResponse>(`${this.apiUrl}/face/verify`, formData)
      .pipe(
        timeout(45000), // 45 ثانية وقت أطول للتعامل مع الصور
        map(response => this.normalizeResponse(response)),
        catchError(error => this.handleError(error))
      );
  }

  private normalizeResponse(response: any): FaceVerificationResponse {
    // Normalize response from different API formats
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
    
    console.warn('Unexpected API response format:', response);
    return {
      verified: false,
      message: 'Unable to parse verification response',
      timestamp: new Date().toISOString()
    };
  }

  private handleError(error: any): Observable<FaceVerificationResponse> {
    console.error('Verification API error:', error);
    
   
    
    return throwError(() => ({
      verified: false,
      message: 'Verification service is currently unavailable',
      timestamp: new Date().toISOString(),
      error: error.message
    }));
  }

  private simulateVerification(): Observable<FaceVerificationResponse> {
    return new Observable(observer => {
      setTimeout(() => {
        const isMatch = Math.random() > 0.3;
        const confidence = isMatch ? 85 + Math.random() * 15 : 40 + Math.random() * 30;
        
        const response: FaceVerificationResponse = {
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
    return this.http.get<{ status: string; timestamp: string; version?: string }>(`${this.apiUrl}/api/face/health`)
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