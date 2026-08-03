import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../services/auth/auth.service';

export const roleGuard: CanActivateFn = (route) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  const allowedRoles = route.data['roles'] as readonly string[] | undefined;
  if (allowedRoles && authService.hasAnyRole(allowedRoles)) {
    return true;
  }

  return router.createUrlTree(['/home']);
};
