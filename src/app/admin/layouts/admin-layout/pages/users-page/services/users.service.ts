// services/users.service.ts
import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../../../../../environments/environment';
import { UsersResponse, UserDetailDto, CreateUserDto, UpdateUserDto, ChangeUserRoleDto, UserStatsDto } from '../models/users';



@Injectable({
  providedIn: 'root'
})
export class UsersService {
  private apiUrl = `${environment.baseUrl}/User`;

  constructor(private http: HttpClient) {}

  getUsers(
    search: string = '',
    role: string = '',
    page: number = 1,
    pageSize: number = 20,
    sortBy: string = 'createdAt',
    sortOrder: string = 'desc'
  ): Observable<UsersResponse> {
    let params = new HttpParams()
      .set('page', page.toString())
      .set('pageSize', pageSize.toString())
      .set('sortBy', sortBy)
      .set('sortOrder', sortOrder);

    if (search) params = params.set('search', search);
    if (role) params = params.set('role', role);

    return this.http.get<UsersResponse>(this.apiUrl, { params });
  }

  getUserById(id: string): Observable<UserDetailDto> {
    return this.http.get<UserDetailDto>(`${this.apiUrl}/${id}`);
  }

  createUser(userData: CreateUserDto): Observable<any> {
    return this.http.post<any>(this.apiUrl, userData);
  }

  updateUser(id: string, userData: UpdateUserDto): Observable<any> {
    return this.http.put<any>(`${this.apiUrl}/${id}`, userData);
  }

  deleteUser(id: string): Observable<any> {
    return this.http.delete<any>(`${this.apiUrl}/${id}`);
  }

  changeUserRole(id: string, roleData: ChangeUserRoleDto): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/${id}/change-role`, roleData);
  }

  getUserStatistics(): Observable<UserStatsDto> {
    return this.http.get<UserStatsDto>(`${this.apiUrl}/statistics`);
  }

  toggleUserActive(id: string): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/${id}/toggle-active`, {});
  }

  resetUserPassword(id: string, newPassword: string): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/${id}/reset-password`, `"${newPassword}"`, {
      headers: { 'Content-Type': 'application/json' }
    });
  }
}