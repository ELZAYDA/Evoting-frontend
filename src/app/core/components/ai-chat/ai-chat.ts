import { Component, ElementRef, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AiChatService } from '../../services/ai-chat.service';

@Component({
  selector: 'app-ai-chat',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './ai-chat.html',
  styleUrls: ['./ai-chat.css']
})
export class AiChatComponent {
  @ViewChild('chatMessages') chatMessages!: ElementRef;
  
  isOpen = false;
  messages: { text: string; isUser: boolean; timestamp: Date }[] = [];
  currentQuestion = '';
  isLoading = false;

  constructor(private aiChatService: AiChatService) {
    // رسالة ترحيب عند الفتح
    this.messages.push({
      text: '👋 مرحباً! أنا مساعد نظام التصويت. اسألني عن أي شيء',
      isUser: false,
      timestamp: new Date()
    });
  }

  toggleChat() {
    this.isOpen = !this.isOpen;
    if (this.isOpen) {
      setTimeout(() => this.scrollToBottom(), 100);
    }
  }

  closeChat() {
    this.isOpen = false;
  }

  sendMessage() {
    if (!this.currentQuestion.trim() || this.isLoading) return;

    // أضف سؤال المستخدم
    this.messages.push({
      text: this.currentQuestion,
      isUser: true,
      timestamp: new Date()
    });

    const question = this.currentQuestion;
    this.currentQuestion = '';
    this.isLoading = true;
    this.scrollToBottom();

    // أرسل للـ API
    this.aiChatService.ask(question).subscribe({
      next: (response) => {
        this.messages.push({
          text: response.answer,
          isUser: false,
          timestamp: new Date()
        });
        this.isLoading = false;
        this.scrollToBottom();
      },
      error: (error) => {
        console.error('Error:', error);
        this.messages.push({
          text: 'عذراً، حدث خطأ في الاتصال بالمساعد. حاول مرة أخرى.',
          isUser: false,
          timestamp: new Date()
        });
        this.isLoading = false;
        this.scrollToBottom();
      }
    });
  }

  private scrollToBottom() {
    if (this.chatMessages) {
      const element = this.chatMessages.nativeElement;
      element.scrollTop = element.scrollHeight;
    }
  }
}