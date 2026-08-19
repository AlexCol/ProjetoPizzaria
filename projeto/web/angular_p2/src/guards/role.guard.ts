import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthStore } from '../stores/auth/auth.store';

export const roleGuard: CanActivateFn = (route) => {
  const authStore = inject(AuthStore);
  const router = inject(Router);

  const allowedRoles = route.data['roles'] as readonly string[] | undefined;
  if (allowedRoles && authStore.hasAnyRole(allowedRoles)) {
    return true;
  }

  return router.createUrlTree(['/home']);
};
