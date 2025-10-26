import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class ElectionsService {
  constructor(private http: HttpClient) {}

  getElections(): Observable<any> {
    return this.http.get(`${environment.baseUrl}/elections`);
  }

  getElectionById(ElectionId:number): Observable<any> {
    return this.http.get(`${environment.baseUrl}/elections/${ElectionId}`);
  }

  createElection(data: any): Observable<any> {
    return this.http.post(`${environment.baseUrl}/elections`, data);
  }

  updateElection(id: number, data: any): Observable<any> {
    return this.http.put(`${environment.baseUrl}/elections/${id}`, data);
  }

  deleteElection(id: number): Observable<any> {
    return this.http.delete(`${environment.baseUrl}/elections/${id}`);
  }
}
