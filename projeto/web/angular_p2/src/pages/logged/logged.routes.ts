import { Route } from '@angular/router';
import { homeRoute } from './home/home.route';
import { loggedGuard } from './logged.guard';

export const loggedRoutes: Route = {
  path: '',
  canMatch: [loggedGuard],
  runGuardsAndResolvers: 'always',
  loadComponent: () => import('./logged.layout').then((m) => m.LoggedLayout),
  children: [
    homeRoute,
    {
      path: '**', //temporario até ter uma página de erro 404
      redirectTo: 'home',
    },
  ],
};
