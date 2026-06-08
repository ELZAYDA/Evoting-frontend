import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

export interface ChatRequest {
  question: string;
}

export interface ChatResponse {
  answer: string;
  question: string;
}

@Injectable({
  providedIn: 'root'
})
export class AiChatService {
  // غير الرابط حسب port الـ API بتاعك
  private apiUrl = 'http://localhost:5284/api/AiChat';

  constructor(private http: HttpClient) { }

  ask(question: string): Observable<ChatResponse> {
    return this.http.post<ChatResponse>(`${this.apiUrl}/ask`, { question });
  }
}