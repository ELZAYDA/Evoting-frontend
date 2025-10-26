import { Routes } from '@angular/router';
import { Home } from '../../features/home/home';
import { ElectionsList } from '../../features/elections/elections-list/elections-list';
import { CandidateListComponent } from '../../features/elections/candidates-list/candidates-list';
import { VoterCheckComponent } from '../../features/voting/voter-check/voter-check';
import { ErrorPage } from '../components/error-page/error-page';
import { UserComponent } from '../layouts/user/user';
import { VoterCheckGuard } from '../guards/VoterCheck.guard';

export const userRoutes: Routes = [
  { 
    path: '', 
    component: UserComponent,
    children: [
      { path: '', redirectTo: 'home', pathMatch: 'full' },
      { path: 'home', component: Home },
      { path: 'check', component: VoterCheckComponent },
      { path: 'elections', component: ElectionsList, canActivate: [VoterCheckGuard] },
      { path: 'elections/:id/candidates-list', component: CandidateListComponent },
      { path: '**', component: ErrorPage }
    ]
  }
];