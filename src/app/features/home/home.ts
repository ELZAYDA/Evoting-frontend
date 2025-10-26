import { Component } from '@angular/core';
import { Router, RouterLink } from '@angular/router';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [RouterLink],
  templateUrl: './home.html',
  styleUrls: ['./home.css']
})
export class Home {
  
  constructor(private router: Router) {}

  // الانتقال إلى صفحة الانتخابات
  navigateToElections(): void {
    this.router.navigate(['/elections']);
  }  

  // الانتقال إلى صفحة التصويت
  navigateToVote(): void {
    this.router.navigate(['/user/vote']);
  }

  // الانتقال إلى صفحة المرشحين
  navigateToCandidates(): void {
    this.router.navigate(['/user/candidate']);
  }
}