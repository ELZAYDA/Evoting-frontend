import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { environment } from '../../../../environments/environment';
import { Election } from '../models/election';

export interface AddContestantRequest {
  name: string;
  party: string;
  age: number;
  qualification: string;
}

export interface AddContestantResponse {
  success: boolean;
  transactionHash: string;
}

export interface ChangeStateRequest {
  newState: number; // 0,1,2
}

export interface ChangeStateResponse {
  success: boolean;
  transactionHash: string;
}


export interface Candidate {
  id: number;
  name: string;
  voteCount: number;
  party: string;
  age: number;
  qualification: string;
  percentage?: number;
  selected?: boolean;
}

export interface SystemInfo {
  admin: string;
  state: {
    state: number;
    stateName: string;
  };
  contestantsCount: number;
  contractAddress: string;
}

export interface ElectionResults {
  totalContestants: number;
  results: Candidate[];
  winner?: Candidate;
}

export interface VoteRequest {
  contestantId: number;
  privateKey: string;
}

@Injectable({
  providedIn: 'root'
})
export class ElectionsService {
  private baseUrl = environment.baseUrl || 'https://localhost:7185/api';

  constructor(private httpClient: HttpClient) { }

addContestant(candidateData: any): Observable<any> {
  return this.httpClient.post<any>(`${this.baseUrl}/Admin/add-contestant`, candidateData).pipe(
    map(response => {
      return {
        success: response?.success || false,
        message: response?.message || 'تمت إضافة المرشح',
        transactionHash: response?.transactionHash || '',
        ...response
      };
    })
  );
}

changeState(newState: number): Observable<any> {
  const request = {
    newState: newState,
  };
  
  return this.httpClient.post<any>(`${this.baseUrl}/Admin/change-state`, request).pipe(
    map(response => {
      return {
        success: response?.success || false,
        message: response?.message || 'تم تغيير الحالة',
        transactionHash: response?.transactionHash || '',
        ...response
      };
    })
  );
}
  
  // الحصول على النتائج
  getElections(): Observable<ElectionResults> {
    return this.httpClient.get<ElectionResults>(`${this.baseUrl}/Voting/results`);
  }

  // Get all candidates
  getContestants(): Observable<Candidate[]> {
    return this.httpClient.get<Candidate[]>(`${this.baseUrl}/Voting/contestants`);
  }

  // Vote for a candidate
  voteForCandidate(voteRequest: VoteRequest): Observable<any> {
    return this.httpClient.post(`${this.baseUrl}/Voting/vote`, voteRequest);
  }

  // Check voter status - Updated to expect proper response
checkVoterStatus(voterAddress: string): Observable<any> {
  return this.httpClient.post<any>(`${this.baseUrl}/Admin/check`, { 
    voterAddress: voterAddress 
  }).pipe(
    map(response => {
      // Ensure response has expected structure
      return {
        isRegistered: response?.isRegistered || false,
        hasVoted: response?.hasVoted || false,
        isValidAddress: response?.isValidAddress || false,
        ...response
      };
    })
  );
}

 // Register voter - Updated
registerVoter(voterAddress: string): Observable<any> {
  return this.httpClient.post<any>(`${this.baseUrl}/Admin/register-voter`, { 
    voterAddress: voterAddress 
  }).pipe(
    map(response => {
      // Ensure response has expected structure
      return {
        success: response?.success || false,
        message: response?.message || 'Registration completed',
        transactionHash: response?.transactionHash || '',
        ...response
      };
    })
  );
}
  // Get system info
  getSystemInfo(): Observable<SystemInfo> {
    return this.httpClient.get<SystemInfo>(`${this.baseUrl}/Admin/system-info`);
  }

 getElectionData(): Observable<Election> {
  return this.getSystemInfo().pipe(
    map((systemInfo: SystemInfo) => {
      const election: Election = {
        electionId: 1,
        electionName: 'Blockchain Election',
        description: 'Secure electronic voting using blockchain technology',
        startDate: new Date().toISOString(),
        endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
        status: systemInfo.state.state === 1, // Active only if state is 1
        candidatesCount: systemInfo.contestantsCount || 0,
        state: systemInfo.state.state, // 0, 1, or 2
        stateName: systemInfo.state.stateName
      };
      return election;
    })
  );
}
}