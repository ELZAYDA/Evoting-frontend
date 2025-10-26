import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class VoterService {

  constructor(private httpClient: HttpClient) {}

  checkNationalId(data: any): Observable<any> {
    const headers = new HttpHeaders({ 'Content-Type': 'application/json' });
    return this.httpClient.post(`${environment.baseUrl}/Voter/check-voter`, data, { headers });
  }

   castVote(voterId: number, candidateId: number, electionId: number): Observable<any> {
    const payload = { voterId, candidateId, electionId };
    return this.httpClient.post(`${environment.baseUrl}/Vote/cast`, payload);
  }

}
