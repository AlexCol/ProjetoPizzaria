import { Route } from '@angular/router';

export const homeRoute: Route = {
  path: 'home',
  loadComponent: () => import('./home').then((m) => m.HomeComponent),
};
