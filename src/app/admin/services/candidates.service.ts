import { Injectable } from '@angular/core';
import { environment } from '../../../environments/environment';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class CandidatesService {
  constructor(private http: HttpClient) {}

  getCandidates(): Observable<any> {
    return this.http.get(`${environment.baseUrl}/Candidate`);
  }

  getCandidateById(candidateId:number): Observable<any> {
    return this.http.get(`${environment.baseUrl}/Candidate/${candidateId}`);
  }

  createCandidate(data: any): Observable<any> {
    return this.http.post(`${environment.baseUrl}/Candidate`, data);
  }

  updateCandidate(id: number, data: any): Observable<any> {
    return this.http.put(`${environment.baseUrl}/Candidate/${id}`, data);
  }

  deleteCandidate(id: number): Observable<any> {
    return this.http.delete(`${environment.baseUrl}/Candidate/${id}`);
  }
}
