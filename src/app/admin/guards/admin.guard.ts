import { Injectable } from '@angular/core';
import { CanActivate, Router, UrlTree } from '@angular/router';

@Injectable({
  providedIn: 'root'
})
export class AdminGuard implements CanActivate {

  constructor(private router: Router) {}

  canActivate(): boolean | UrlTree {
    // 1. نجيب الـ role من sessionStorage
    const role = sessionStorage.getItem('role');

    // 2. لو موجودة ومتساوية مع "Admin" → يسمح بالدخول
    if (role === 'Admin') {
      return true;
    }

    // 3. لو مش Admin → يرجع المستخدم لصفحة تسجيل الدخول
    return this.router.createUrlTree(['/auth/login']);
  }
}
