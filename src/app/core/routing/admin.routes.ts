import { Routes } from '@angular/router';
import { AdminGuard } from '../../admin/guards/admin.guard';
import { AddCandidateComponent } from '../../admin/layouts/admin-layout/pages/add-candidate-component/add-candidate-component';
import { ChangeStateComponent } from '../../admin/layouts/admin-layout/pages/change-state-component/change-state-component';
import { AdminDashboardComponent } from '../../admin/layouts/admin-layout/pages/admin-dashboard/admin-dashboard';
import { UsersPage } from '../../admin/layouts/admin-layout/pages/users-page/users-page';
import { SettingsPage } from '../../admin/layouts/admin-layout/pages/settings-page/settings-page/settings-page';

export const adminRoutes: Routes = [
  {
    path: 'admin',
    canActivate: [AdminGuard],
    children: [
      { 
        path: '', 
        component: AdminDashboardComponent,
        pathMatch: 'full'
      },
      { 
        path: 'add-candidate', 
        component: AddCandidateComponent 
      },
      { 
        path: 'change-state', 
        component: ChangeStateComponent 
      },
      { 
        path: 'users', 
        component: UsersPage 
      },
      { 
        path: 'settings', 
        component: SettingsPage 
      }
    ]
  }
];