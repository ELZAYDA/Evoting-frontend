import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { forgetPassword, LoginResponse, RegisterResponse, resetPassword } from '../models/base-response';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private baseUrl = environment.baseUrl;

  constructor(private http: HttpClient) {}

  register(data: any): Observable<RegisterResponse> {
    return this.http.post<RegisterResponse>(`${this.baseUrl}/accounts/register`, data);
  }

  login(data: any): Observable<LoginResponse> {
    return this.http.post<LoginResponse>(`${this.baseUrl}/Accounts/login`, data);
  }

  forgetPassword(data: any): Observable<forgetPassword> {
    return this.http.post<forgetPassword>(`${this.baseUrl}/Accounts/forgot-password`, data);
  }

  resetPassword(data: any): Observable<resetPassword> {
    return this.http.post<resetPassword>(`${this.baseUrl}/Accounts/reset-password`, data);
  }
}
