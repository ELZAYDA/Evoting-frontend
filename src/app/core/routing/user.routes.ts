import { Routes } from '@angular/router';
import { Home } from '../../features/home/home';
import { VoterCheckComponent } from '../../features/voting/voter-check/voter-check';
import { ErrorPage } from '../components/error-page/error-page';
import { UserComponent } from '../layouts/user/user';
import { VoterCheckGuard } from '../guards/VoterCheck.guard';
import { ElectionsListComponent } from '../../features/elections/elections-list/elections-list';
import { VoteComponent } from '../../features/vote/vote';
import { VerificationSuccessComponent } from '../../features/voting/verification-success/verification-success';
import { VerificationFailedComponent } from '../../features/voting/verification-failed/verification-failed';
import { FaceCaptureComponent } from '../../features/voting/id-card-upload/id-card-upload';
import { RegistrationComponent } from '../../features/registeration/registeration';
import { FaceVerificationComponent } from '../../features/voting/face/face-verification/face-verification';

export const userRoutes: Routes = [
  { 
    path: '', 
    component: UserComponent,
    children: [
      { path: '', redirectTo: 'home', pathMatch: 'full' },

      { path: 'home', component: Home },
      { path: 'check', component: VoterCheckComponent },
      { path: 'verify', component: FaceVerificationComponent },
      { path: 'success', component: VerificationSuccessComponent },
      { path: 'failed', component: VerificationFailedComponent },

      { path: 'elections', component: ElectionsListComponent, canActivate: [VoterCheckGuard] },
      { path: 'vote', component: VoteComponent, canActivate: [VoterCheckGuard] },

      { path: 'registeration', component: RegistrationComponent },

      { path: '**', component: ErrorPage }
    ]
  }
];
