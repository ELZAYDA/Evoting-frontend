import { Injectable } from '@angular/core';
import { CanActivate, Router, UrlTree } from '@angular/router';

export interface VerificationStatus {
  nationalId: string;
  verified: boolean;
  matchPercentage?: number;
  verificationResult?: any;
  verificationTime?: string;
  sessionId?: string;
  idCardImage?: any;
  faceImage?: any;
  verificationData?: {
    verified: boolean;
    confidence: number;
    message: string;
    timestamp: string;
  };
}

@Injectable({
  providedIn: 'root'
})
export class VoterCheckGuard implements CanActivate {

  constructor(private router: Router) {}

  canActivate(): boolean | UrlTree {
    console.log('🔍 [Guard] Starting verification check...');
    
    // 1. الحصول على بيانات التحقق من session storage
    const verificationData = this.getVerificationDataFromSession();
    console.log('📦 [Guard] Session verification data:', verificationData);
    
    // 2. الحصول على NID من sessionStorage
    const nationalId = sessionStorage.getItem('nationalId');
    console.log('🆔 [Guard] National ID from sessionStorage:', nationalId);
    
    // 3. السيناريو الأول: لا يوجد NID على الإطلاق
    if (!nationalId) {
      console.log('❌ [Guard] No NID found, redirecting to check');
      return this.router.createUrlTree(['/check']);
    }
    
    // 4. التحقق من وجود بيانات التحقق
    if (!verificationData) {
      console.log('⚠️ [Guard] No verification data found, redirecting to verification');
      return this.router.createUrlTree(['/verify'], {
        queryParams: { nationalId }
      });
    }
    
    // 5. التحقق من حالة verified
    const isVerified = this.isVerified(verificationData);
    console.log('✅ [Guard] Is user verified?', isVerified);
    
    if (!isVerified) {
      console.log('⚠️ [Guard] User not verified, redirecting to verification');
      return this.router.createUrlTree(['/verify'], {
        queryParams: { 
          nationalId,
          reason: 'not_verified'
        }
      });
    }
    
    // 6. التحقق من صلاحية الجلسة
    const isSessionValid = this.isSessionValid(verificationData);
    if (!isSessionValid) {
      console.log('⚠️ [Guard] Session expired, redirecting to check');
      this.clearSessionData();
      return this.router.createUrlTree(['/check'], {
        queryParams: { sessionExpired: true }
      });
    }
    
    // 7. كل شيء صحيح - السماح بالوصول
    console.log('🎉 [Guard] User fully verified, allowing access to elections');
    return true;
  }

  /**
   * الحصول على بيانات التحقق من session storage
   */
  private getVerificationDataFromSession(): any {
    try {
      // محاولة الحصول من face_verification_data أولاً
      const faceVerificationData = sessionStorage.getItem('face_verification_data');
      
      if (faceVerificationData) {
        const parsedData = JSON.parse(faceVerificationData);
        console.log('📥 [Guard] Loaded from face_verification_data:', parsedData);
        return parsedData;
      }
      
      // إذا لم يكن موجودًا، جرب مفتاح آخر
      const verificationData = sessionStorage.getItem('verificationData');
      if (verificationData) {
        console.log('📥 [Guard] Loaded from verificationData');
        return JSON.parse(verificationData);
      }
      
      return null;
    } catch (error) {
      console.error('❌ [Guard] Error loading verification data:', error);
      return null;
    }
  }

  /**
   * التحقق إذا كان المستخدم محققًا
   */
  private isVerified(verificationData: any): boolean {
    // التحقق من عدة أماكن محتملة
    if (!verificationData) return false;
    
    // 1. التحقق من verificationData.verified
    if (verificationData.verificationData?.verified === true) {
      console.log('✅ [Guard] Verified via verificationData.verified');
      return true;
    }
    
    // 2. التحقق من isVerified مباشرة
    if (verificationData.isVerified === true) {
      console.log('✅ [Guard] Verified via isVerified');
      return true;
    }
    
    // 3. التحقق من verified مباشرة
    if (verificationData.verified === true) {
      console.log('✅ [Guard] Verified via verified');
      return true;
    }
    
    return false;
  }

  /**
   * التحقق من صلاحية الجلسة
   */
  private isSessionValid(verificationData: any): boolean {
    if (!verificationData) return false;
    
    try {
      // الحصول على timestamp من أي مكان محتمل
      let timestamp = verificationData.timestamp || 
                     verificationData.verificationData?.timestamp || 
                     verificationData.verificationTime;
      
      if (!timestamp) {
        console.log('⚠️ [Guard] No timestamp found');
        return true; // إذا لم يكن هناك timestamp، افترض أنها صالحة
      }
      
      const verificationDate = new Date(timestamp);
      const now = new Date();
      const hoursDiff = (now.getTime() - verificationDate.getTime()) / (1000 * 60 * 60);
      
      console.log(`⏰ [Guard] Session age: ${hoursDiff.toFixed(2)} hours`);
      
      // الجلسة صالحة لمدة 8 ساعات
      return hoursDiff < 8;
    } catch (error) {
      console.error('❌ [Guard] Error checking session validity:', error);
      return true; // في حالة الخطأ، اسمح بالمرور
    }
  }

  /**
   * مسح بيانات الجلسة
   */
  private clearSessionData(): void {
    console.log('🧹 [Guard] Clearing session data...');
    
    // مسح من sessionStorage
    sessionStorage.removeItem('face_verification_data');
    sessionStorage.removeItem('verificationData');
    sessionStorage.removeItem('verification_session');
    
    // مسح من sessionStorage
    sessionStorage.removeItem('user_verification_status');
    sessionStorage.removeItem('verificationData');
    
    console.log('✅ [Guard] Session data cleared');
  }

  /**
   * حفظ حالة التحقق بشكل صحيح
   */
  public saveVerificationStatus(nationalId: string, verificationResult: any): void {
    try {
      const status: VerificationStatus = {
        nationalId,
        verified: verificationResult.verified === true,
        matchPercentage: verificationResult.confidence,
        verificationResult,
        verificationTime: new Date().toISOString(),
        sessionId: this.generateSessionId()
      };
      
      // حفظ في session storage
      sessionStorage.setItem('face_verification_data', JSON.stringify({
        ...status,
        timestamp: new Date().toISOString(),
        isVerified: status.verified
      }));
      
      // حفظ في sessionStorage أيضًا للديمومة
      sessionStorage.setItem('user_verification_status', JSON.stringify(status));
      
      console.log('💾 [Guard] Verification status saved:', status);
    } catch (error) {
      console.error('❌ [Guard] Error saving verification status:', error);
    }
  }

  /**
   * إنشاء ID للجلسة
   */
  private generateSessionId(): string {
    return 'session_' + Math.random().toString(36).substr(2, 9);
  }

  /**
   * دالة مساعدة للفحص السريع
   */
  public checkCurrentStatus(): void {
    const nationalId = sessionStorage.getItem('nationalId');
    const verificationData = this.getVerificationDataFromSession();
    const isVerified = this.isVerified(verificationData);
    const isSessionValid = this.isSessionValid(verificationData);
    
    console.log('📊 [Guard] Current Status Check:', {
      nationalId,
      verificationData: verificationData ? 'Available' : 'Not available',
      isVerified,
      isSessionValid,
      verificationDetails: verificationData?.verificationData || 'No details'
    });
  }
}