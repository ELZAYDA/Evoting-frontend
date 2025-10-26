// services/results.service.ts
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../../../../../environments/environment';
import { ResultsSummary, Winner, ElectionStatistics } from '../models/results';


@Injectable({
  providedIn: 'root'
})
export class ResultsService {
  private apiUrl = `${environment.baseUrl}/results`;

  constructor(private http: HttpClient) {}

  getResults(electionId: number): Observable<ResultsSummary> {
    return this.http.get<ResultsSummary>(`${this.apiUrl}/${electionId}`);
  }

  getWinner(electionId: number): Observable<Winner> {
    return this.http.get<Winner>(`${this.apiUrl}/${electionId}/winner`);
  }

  getStatistics(electionId: number): Observable<ElectionStatistics> {
    return this.http.get<ElectionStatistics>(`${this.apiUrl}/${electionId}/statistics`);
  }
}