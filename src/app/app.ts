import { Component, Input, input, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { FooterComponent } from "./shared/components/footer/footer";
import { NgxSpinnerModule } from 'ngx-spinner'
import { NavbarComponent } from "./shared/components/navbar/navbar";



@Component({
  selector: 'app-root',
  imports: [RouterOutlet,
    NgxSpinnerModule],
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class App {
  protected readonly title = signal('Evoting.Platform');
}
