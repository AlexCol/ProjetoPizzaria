import { Route } from '@angular/router';

export const produtosRoute: Route = {
  path: 'produtos',
  loadComponent: () => import('./produtos').then((m) => m.ProdutosComponent),
};
