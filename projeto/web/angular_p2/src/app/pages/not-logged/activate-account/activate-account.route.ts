import { Route } from '@angular/router';

export const activateAccountRoute: Route = {
  path: 'activate-account',
  loadComponent: () => import('./activate-account').then((m) => m.ActivateAccountComponent),
};
