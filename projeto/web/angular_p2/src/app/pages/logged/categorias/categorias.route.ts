import { Route } from '@angular/router';

export const categoriasRoute: Route = {
  path: 'categorias',
  loadComponent: () => import('./categorias').then((m) => m.CategoriasComponent),
};
