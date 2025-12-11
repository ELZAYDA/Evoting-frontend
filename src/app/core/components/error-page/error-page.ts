import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-error-page',
  imports:[RouterLink],
  templateUrl: './error-page.html',
  styleUrls: ['./error-page.css']
})
export class ErrorPage {}
