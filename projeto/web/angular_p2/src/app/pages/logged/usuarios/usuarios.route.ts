import { Route } from '@angular/router';

export const usuariosRoute: Route = {
  path: 'usuarios',
  loadComponent: () => import('./usuarios').then((m) => m.UsuariosComponent),
};
