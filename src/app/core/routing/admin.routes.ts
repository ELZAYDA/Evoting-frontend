import { Routes } from '@angular/router';
import { AdminLayoutComponent } from '../../admin/layouts/admin-layout/admin-layout';
import { ElectionsPage } from '../../admin/layouts/admin-layout/pages/elections-page/elections-page';
import { CandidatesPage } from '../../admin/layouts/admin-layout/pages/candidates-page/candidates-page';
import { UsersPage } from '../../admin/layouts/admin-layout/pages/users-page/users-page';
import { CreateElectionComponent } from '../../admin/layouts/admin-layout/pages/elections-page/election-Functions-Components/create-election/create-election';
import { ViewElectionComponent } from '../../admin/layouts/admin-layout/pages/elections-page/election-Functions-Components/view-election/view-election';
import { EditElectionComponent } from '../../admin/layouts/admin-layout/pages/elections-page/election-Functions-Components/edit-election/edit-election';
import { CreateCandidateComponent } from '../../admin/layouts/admin-layout/pages/candidates-page/Candidates-Functions-Components/create-candidate/create-candidate';
import { ViewCandidateComponent } from '../../admin/layouts/admin-layout/pages/candidates-page/Candidates-Functions-Components/view-candidate/view-candidate';
import { EditCandidateComponent } from '../../admin/layouts/admin-layout/pages/candidates-page/Candidates-Functions-Components/edit-candidate/edit-candidate';
import { ResultsPage } from '../../admin/layouts/admin-layout/pages/results-page/results-page/results-page';
import { SettingsPage } from '../../admin/layouts/admin-layout/pages/settings-page/settings-page/settings-page';
import { AdminGuard } from '../../admin/guards/admin.guard';

export const adminRoutes: Routes = [
  {
    path: 'admin',
    component: AdminLayoutComponent,
    canActivate:[AdminGuard],
    children: [
      { path: 'elections', component: ElectionsPage },
      { path: 'elections/create', component: CreateElectionComponent },
      { path: 'elections/:id', component: ViewElectionComponent },
      { path: 'elections/edit/:id', component: EditElectionComponent },
      { path: 'candidates', component: CandidatesPage },
      { path: 'candidates/create', component: CreateCandidateComponent },
      { path: 'candidates/:id', component: ViewCandidateComponent },
      { path: 'candidates/edit/:id', component: EditCandidateComponent },
      { path: 'results', component: ResultsPage },
      { path: 'results/:electionId', component: ResultsPage },
      { path: 'users', component: UsersPage },
      { path: 'settings', component: SettingsPage },
      { path: '', redirectTo: 'elections', pathMatch: 'full' }
    ]
  }
];