import { Route } from '@angular/router';
import { notLoggedGuard } from '../../../guards/not-logged.guard';
import { activateAccountRoute } from './activate-account/activate-account.route';
import { loginRoute } from './login/login.route';
import { passwordChangeRoute } from './password-change/password-change.route';
import { recoverPasswordRoute } from './recover-password/recover-password.route';
import { resendActivationTokenRoute } from './resend-activation-token/resend-activation-token.route';

export const notLoggedRoutes: Route = {
  path: 'auth',
  canMatch: [notLoggedGuard],
  runGuardsAndResolvers: 'always',
  loadComponent: () => import('./not-logged.layout').then((m) => m.NotLoggedLayoutComponent),
  children: [
    { path: '', redirectTo: 'login', pathMatch: 'full' },
    loginRoute,
    recoverPasswordRoute,
    passwordChangeRoute,
    resendActivationTokenRoute,
    activateAccountRoute,
    {
      path: '**', //temporario até ter uma página de erro 404
      redirectTo: 'login',
    },
  ],
};
