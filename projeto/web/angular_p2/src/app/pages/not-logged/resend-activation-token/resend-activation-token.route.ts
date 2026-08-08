import { Route } from '@angular/router';

export const resendActivationTokenRoute: Route = {
  path: 'resend-activation-token',
  loadComponent: () => import('./resend-activation-token').then((m) => m.ResendActivationTokenComponent),
};
