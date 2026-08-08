import { Route } from '@angular/router';
import { notLoggedGuard } from '../../../guards/not-logged.guard';
import { loginRoute } from './login/login.route';
import { recoverPasswordRoute } from './recover-password/recover-password.route';

export const notLoggedRoutes: Route = {
  path: 'auth',
  canMatch: [notLoggedGuard],
  runGuardsAndResolvers: 'always',
  loadComponent: () => import('./not-logged.layout').then((m) => m.NotLoggedLayoutComponent),
  children: [
    { path: '', redirectTo: 'login', pathMatch: 'full' },
    loginRoute,
    recoverPasswordRoute,
    {
      path: '**', //temporario até ter uma página de erro 404
      redirectTo: 'login',
    },
  ],
};
