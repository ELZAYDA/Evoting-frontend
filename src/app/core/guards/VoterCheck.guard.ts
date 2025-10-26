import { Injectable } from '@angular/core';
import { CanActivate, Router, UrlTree } from '@angular/router';

@Injectable({
  providedIn: 'root'
})
export class VoterCheckGuard implements CanActivate {

  constructor(private router: Router) {}

  canActivate(): boolean | UrlTree {
    // 1. نجيب الـ voterId من localStorage
    const voterId = sessionStorage.getItem('voterId');

    // 2. لو موجود → يسمح بالدخول
    if (voterId) {
      return true;
    }

    // 3. لو مش موجود → يرجع المستخدم لصفحة التحقق
    return this.router.createUrlTree(['/check']);
  }
}
