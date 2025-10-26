import { Component } from '@angular/core';
import { NavbarComponent } from "../../../shared/components/navbar/navbar";
import { RouterModule } from "@angular/router";

@Component({
  selector: 'app-admin',
  imports: [NavbarComponent, RouterModule],
  templateUrl: './admin.html',
  styleUrl: './admin.css'
})
export class Admin {

}
