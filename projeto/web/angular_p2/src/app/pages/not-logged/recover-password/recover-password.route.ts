import { Route } from '@angular/router';

export const recoverPasswordRoute: Route = {
  path: 'recover-password',
  loadComponent: () => import('./recover-password').then((m) => m.RecoverPasswordComponent),
};
