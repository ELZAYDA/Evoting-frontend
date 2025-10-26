// settings.service.ts
import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { 
  UserProfile, 
  UpdatePersonalInfoDto, 
  ChangePasswordDto, 
  ApiResponse,
  AssignRoleDto,
  RemoveRoleDto,
  UserRoles,
  UserSearchResult 
} from '../models/settings';

@Injectable({
  providedIn: 'root'
})
export class SettingsService {
  private baseUrl = 'https://localhost:7185/api/accounts';
  private readonly TOKEN_KEY = 'jwtToken';

  constructor(private http: HttpClient) {}

  private getAuthHeaders(): HttpHeaders {
    const token = sessionStorage.getItem(this.TOKEN_KEY);
    if (!token) {
      console.error('No token found in sessionStorage');
    }
    return new HttpHeaders({
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    });
  }

  private handleError(error: HttpErrorResponse) {
    let errorMessage = 'حدث خطأ غير متوقع';
    
    if (error.error instanceof ErrorEvent) {
      errorMessage = `خطأ: ${error.error.message}`;
    } else {
      if (error.status === 401) {
        errorMessage = 'غير مصرح بالوصول. يرجى تسجيل الدخول مرة أخرى';
      } else if (error.status === 403) {
        errorMessage = 'ليس لديك صلاحية للقيام بهذا الإجراء';
      } else if (error.status === 404) {
        errorMessage = 'لم يتم العثور على المورد المطلوب';
      } else if (error.status >= 500) {
        errorMessage = 'خطأ في الخادم. يرجى المحاولة لاحقاً';
      } else {
        errorMessage = `خطأ: ${error.status} - ${error.message}`;
      }
    }
    
    console.error('API Error:', error);
    return throwError(() => new Error(errorMessage));
  }

  // الدوال الحالية
  getCurrentUser(): Observable<UserProfile> {
    return this.http.get<UserProfile>(`${this.baseUrl}/current-user`, {
      headers: this.getAuthHeaders()
    }).pipe(
      catchError(this.handleError)
    );
  }

  updatePersonalInfo(dto: UpdatePersonalInfoDto): Observable<UserProfile> {
    return this.http.put<UserProfile>(`${this.baseUrl}/update-personal-info`, dto, {
      headers: this.getAuthHeaders()
    }).pipe(
      catchError(this.handleError)
    );
  }

  changePassword(dto: ChangePasswordDto): Observable<ApiResponse> {
    return this.http.post<ApiResponse>(`${this.baseUrl}/change-password`, dto, {
      headers: this.getAuthHeaders()
    }).pipe(
      catchError(this.handleError)
    );
  }

  checkEmailExists(email: string): Observable<boolean> {
    return this.http.get<boolean>(`${this.baseUrl}/check-email?email=${email}`, {
      headers: this.getAuthHeaders()
    }).pipe(
      catchError(this.handleError)
    );
  }

  checkUsernameExists(username: string): Observable<boolean> {
    return this.http.get<boolean>(`${this.baseUrl}/check-username?username=${username}`, {
      headers: this.getAuthHeaders()
    }).pipe(
      catchError(this.handleError)
    );
  }

  isAuthenticated(): boolean {
    const token = sessionStorage.getItem(this.TOKEN_KEY);
    return !!token;
  }

  redirectToLogin(): void {
    console.warn('No token found, redirecting to login...');
  }

  // الدوال الجديدة لإدارة الصلاحيات
  assignRole(dto: AssignRoleDto): Observable<ApiResponse> {
    return this.http.post<ApiResponse>(`${this.baseUrl}/assign-role`, dto, {
      headers: this.getAuthHeaders()
    }).pipe(
      catchError(this.handleError)
    );
  }

  removeRole(dto: RemoveRoleDto): Observable<ApiResponse> {
    return this.http.post<ApiResponse>(`${this.baseUrl}/remove-role`, dto, {
      headers: this.getAuthHeaders()
    }).pipe(
      catchError(this.handleError)
    );
  }

  getUserRoles(email: string): Observable<string[]> {
    return this.http.get<string[]>(`${this.baseUrl}/user-roles/${email}`, {
      headers: this.getAuthHeaders()
    }).pipe(
      catchError(this.handleError)
    );
  }

  // دالة مساعدة للتحقق إذا المستخدم الحالي عنده صلاحية Admin
  isAdmin(): boolean {
    // دي بتكون مؤقتة لحد ما نعرف نحدد من الـ API
    // أو ممكن نعمل API endpoint يخبرنا إذا المستخدم admin ولا لا
    return this.userProfile?.roles?.includes('Admin') || false;
  }

  // متغير لتخزين بيانات المستخدم الحالي
  private userProfile: UserProfile | null = null;

  setUserProfile(profile: UserProfile): void {
    this.userProfile = profile;
  }

  getUserProfile(): UserProfile | null {
    return this.userProfile;
  }
}