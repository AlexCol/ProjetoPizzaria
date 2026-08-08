import { Route } from '@angular/router';

export const passwordChangeRoute: Route = {
  path: 'password-change',
  loadComponent: () => import('./password-change').then((m) => m.PasswordChangeComponent),
};
