import { Injectable } from '@angular/core';
import { CanActivate, Router, UrlTree } from '@angular/router';

export interface VerificationStatus {
  nationalId: string;
  voterId: number;
  verified: boolean;
  matchPercentage?: number;
  verificationResult?: any;
  verificationTime?: string;
  sessionId?: string;
}

@Injectable({
  providedIn: 'root'
})
export class VoterCheckGuard implements CanActivate {

  constructor(private router: Router) {}

  canActivate(): boolean | UrlTree {
    // 1. التحقق من وجود NID في localStorage
    const nationalId = localStorage.getItem('nationalId');
    
    // 2. التحقق من حالة التحقق
    const verificationStatus = this.getVerificationStatus();
    
    console.log('🔍 Guard Check:', { nationalId, verificationStatus });
    
    // 3. السيناريو الأول: لا يوجد NID على الإطلاق
    if (!nationalId) {
      console.log('❌ No NID found, redirecting to check');
      return this.router.createUrlTree(['/check']);
    }
    
    // 4. السيناريو الثاني: يوجد NID ولكن لم يتم التحقق بعد
    if (!verificationStatus || !verificationStatus.verified) {
      console.log('⚠️ NID found but not verified, redirecting to verification');
      
      // تمرير الـ NID للصفحة التالية
      return this.router.createUrlTree(['/verify'], {
        queryParams: { nationalId }
      });
    }
    
    // 5. السيناريو الثالث: NID لا يتطابق مع الـ NID المحقق
    if (verificationStatus.nationalId && verificationStatus.nationalId !== nationalId) {
      console.log('⚠️ NID mismatch, clearing and redirecting to check');
      
      // مسح البيانات القديمة لأنها لـ NID مختلف
      this.clearAllVerificationData();
      return this.router.createUrlTree(['/check']);
    }
    
    // 6. السيناريو الرابع: كل شيء صحيح - المستخدم محقق بهذا الـ NID
    console.log('✅ User verified with matching NID, allowing access');
    
    // يمكن تمرير البيانات للصفحة التالية
    return true;
  }

  /**
   * الحصول على حالة التحقق من localStorage
   */
  private getVerificationStatus(): VerificationStatus | null {
    try {
      const status = localStorage.getItem('user_verification_status');
      return status ? JSON.parse(status) : null;
    } catch (error) {
      console.error('Error parsing verification status:', error);
      return null;
    }
  }

  /**
   * التحقق من صلاحية حالة التحقق
   */
  private isValidVerification(status: VerificationStatus | null): boolean {
    if (!status) return false;
    
    // التحقق من أن الـ verified = true
    if (status.verified !== true) return false;
    
    // التحقق من تاريخ التحقق (صالح لمدة 24 ساعة)
    if (status.verificationTime) {
      const verificationDate = new Date(status.verificationTime);
      const now = new Date();
      const hoursDiff = (now.getTime() - verificationDate.getTime()) / (1000 * 60 * 60);
      
      if (hoursDiff > 24) {
        console.log('⚠️ Verification expired (older than 24 hours)');
        return false;
      }
    }
    
    return true;
  }

  /**
   * مسح جميع بيانات التحقق
   */
  private clearAllVerificationData(): void {
    // مسح من localStorage
    localStorage.removeItem('user_verification_status');
    localStorage.removeItem('nationalId');
    localStorage.removeItem('verification_session');
    
    // مسح من sessionStorage
    sessionStorage.removeItem('face_verification_data');
    sessionStorage.removeItem('verificationData');
    
    console.log('🧹 Cleared all verification data');
  }

  /**
   * دالة مساعدة للفحص السريع (للتطوير)
   */
  checkCurrentStatus(): void {
    const nationalId = localStorage.getItem('nationalId');
    const verificationStatus = this.getVerificationStatus();
    
    console.log('📊 Current Status Check:', {
      nationalId,
      verificationStatus,
      isValid: this.isValidVerification(verificationStatus),
      isMatching: verificationStatus?.nationalId === nationalId
    });
  }
}