import { Component } from '@angular/core';
import { NavbarComponent } from "../../../shared/components/navbar/navbar";
import { RouterOutlet } from '@angular/router';
import { FooterComponent } from "../../../shared/components/footer/footer";

@Component({
  selector: 'app-user',
  imports: [NavbarComponent, RouterOutlet, FooterComponent],
  templateUrl: './user.html',
  styleUrl: './user.css'
})
export class UserComponent {

}
