import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class VoterService {
  private apiUrl = environment.baseUrl;

  constructor(private httpClient: HttpClient) {}

  // التحقق من الرقم القومي الأساسي
  checkNationalId(data: any): Observable<any> {
    const headers = new HttpHeaders({ 'Content-Type': 'application/json' });
    return this.httpClient.post(`${this.apiUrl}/Voter/check-voter`, data, { headers });
  }

  // // ================ خدمات التحقق الممتدة ================

  // // رفع صورة البطاقة الشخصية
  // uploadIdCard(nationalId: string, idCardImage: File): Observable<any> {
  //   const formData = new FormData();
  //   formData.append('nationalId', nationalId);
  //   formData.append('idCardImage', idCardImage);
    
  //   return this.httpClient.post(`${this.apiUrl}/Verification/upload-id-card`, formData);
  // }

  // // التحقق من البطاقة باستخدام OCR
  // verifyIdCardWithOCR(nationalId: string, idCardImage: File): Observable<any> {
  //   const formData = new FormData();
  //   formData.append('nationalId', nationalId);
  //   formData.append('idCardImage', idCardImage);
    
  //   return this.httpClient.post(`${this.apiUrl}/Verification/verify-id-ocr`, formData);
  // }

  // // رفع صورة الوجه
  // uploadFaceImage(nationalId: string, faceImage: File): Observable<any> {
  //   const formData = new FormData();
  //   formData.append('nationalId', nationalId);
  //   formData.append('faceImage', faceImage);
    
  //   return this.httpClient.post(`${this.apiUrl}/Verification/upload-face`, formData);
  // }

  // // مطابقة الوجه
  // verifyFaceMatch(nationalId: string, liveFaceImage: File): Observable<any> {
  //   const formData = new FormData();
  //   formData.append('nationalId', nationalId);
  //   formData.append('liveFaceImage', liveFaceImage);
    
  //   return this.httpClient.post(`${this.apiUrl}/Verification/verify-face`, formData);
  // }

  // // الحصول على حالة التحقق
  // getVerificationStatus(nationalId: string): Observable<any> {
  //   return this.httpClient.get(`${this.apiUrl}/Verification/status/${nationalId}`);
  // }

  // // إنهاء عملية التحقق
  // completeVerification(nationalId: string): Observable<any> {
  //   return this.httpClient.post(`${this.apiUrl}/Verification/complete`, { nationalId });
  // }

  // // ================ خدمات التصويت ================

  // // التصويت
  // castVote(voterId: number, candidateId: number, electionId: number): Observable<any> {
  //   const payload = { voterId, candidateId, electionId };
  //   return this.httpClient.post(`${this.apiUrl}/Vote/cast`, payload);
  // }

  // // الحصول على الانتخابات المتاحة
  // getAvailableElections(): Observable<any> {
  //   return this.httpClient.get(`${this.apiUrl}/Election/available`);
  // }

  // // الحصول على معلومات الناخب
  // getVoterInfo(voterId: number): Observable<any> {
  //   return this.httpClient.get(`${this.apiUrl}/Voter/info/${voterId}`);
  // }

  // // التحقق من حالة التصويت
  // checkVotingStatus(voterId: number, electionId: number): Observable<any> {
  //   return this.httpClient.get(`${this.apiUrl}/Vote/status/${voterId}/${electionId}`);
  // }

  // // ================ أدوات مساعدة ================

  // // حفظ بيانات التحقق مؤقتاً
  // saveVerificationData(data: any): void {
  //   sessionStorage.setItem('verificationData', JSON.stringify(data));
  // }

  // // جلب بيانات التحقق
  // getVerificationData(): any {
  //   const data = sessionStorage.getItem('verificationData');
  //   return data ? JSON.parse(data) : null;
  // }

  // // مسح بيانات التحقق
  // clearVerificationData(): void {
  //   sessionStorage.removeItem('verificationData');
  //   sessionStorage.removeItem('voterId');
  // }

  // // التحقق من اكتمال عملية التحقق
  // isVerificationComplete(): boolean {
  //   const data = this.getVerificationData();
  //   return data && data.faceVerified === true;
  // }
}