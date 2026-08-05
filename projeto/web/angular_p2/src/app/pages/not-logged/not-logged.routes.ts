import { Route } from '@angular/router';
import { notLoggedGuard } from '../../../guards/not-logged.guard';
import { loginRoute } from './login/login.route';

export const notLoggedRoutes: Route = {
  path: 'auth',
  canMatch: [notLoggedGuard],
  runGuardsAndResolvers: 'always',
  loadComponent: () => import('./not-logged.layout').then((m) => m.NotLoggedLayoutComponent),
  children: [
    { path: '', redirectTo: 'login', pathMatch: 'full' },
    loginRoute,
    {
      path: '**', //temporario até ter uma página de erro 404
      redirectTo: 'login',
    },
  ],
};
