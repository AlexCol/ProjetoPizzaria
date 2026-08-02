import { inject } from '@angular/core';
import { CanMatchFn, Router } from '@angular/router';
import { AuthService } from '../../services/auth/auth.service';

export const loggedGuard: CanMatchFn = (
  // route: Route,
  // segments: UrlSegment[],
  // currentSnapshot?: PartialMatchRouteSnapshot,
) => {
  const router = inject(Router);
  const authService = inject(AuthService);
  const isAuth = authService.isAuthenticated; // This returns a signal, not a boolean

  return isAuth ? true : router.createUrlTree(['/auth/login']);
};
