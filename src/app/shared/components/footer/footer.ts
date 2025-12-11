import { Component, Input } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';

@Component({
  selector: 'app-footer',
  standalone: true,
  imports: [ReactiveFormsModule],
  templateUrl: './footer.html',
  styleUrls: ['./footer.css']
})
export class FooterComponent {
  currentYear: number = new Date().getFullYear();
    @Input() layout!: string;

}