import { Route } from '@angular/router';
import { loggedGuard } from '../../../guards/logged.guard';
import { notFoundWildcardRoute } from '../not-found/not-found.route';
import { homeRoute } from './home/home.route';
import { usuariosRoute } from './usuarios/usuarios.route';

export const loggedRoutes: Route = {
  path: '',
  canMatch: [loggedGuard],
  runGuardsAndResolvers: 'always',
  loadComponent: () => import('./logged.layout').then((m) => m.LoggedLayout),
  children: [
    { path: '', redirectTo: 'home', pathMatch: 'full' },
    homeRoute,
    usuariosRoute,
    { ...notFoundWildcardRoute },
  ],
};
