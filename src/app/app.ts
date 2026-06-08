import { Component, Input, input, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { FooterComponent } from "./shared/components/footer/footer";
import { NgxSpinnerModule } from 'ngx-spinner'
import { NavbarComponent } from "./shared/components/navbar/navbar";
import { AiChatComponent } from './core/components/ai-chat/ai-chat';



@Component({
  selector: 'app-root',
  imports: [RouterOutlet,
    NgxSpinnerModule,AiChatComponent],
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class App {
  protected readonly title = signal('Evoting.Platform');
}
