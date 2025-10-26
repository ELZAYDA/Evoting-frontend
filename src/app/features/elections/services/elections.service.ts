import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class ElectionsService {
  constructor(private httpClient : HttpClient) {
  }

  getElections(): Observable<any> {
    return this.httpClient.get(`${environment.baseUrl}/elections`)
  }

  getElectionCandidates(id:number|null): Observable<any> {
    return this.httpClient.get(`${environment.baseUrl}/elections/${id}/candidates`)
  }

 
}
