import { Routes } from '@angular/router';
import { ErrorPage } from './core/components/error-page/error-page';
import { authRoutes, adminRoutes, userRoutes } from './core/routing';

export const routes: Routes = [
  ...authRoutes,      // Authentication routes
  ...adminRoutes,     // Admin routes
  ...userRoutes,      // User routes
  { path: '**', component: ErrorPage } // 404 page
];