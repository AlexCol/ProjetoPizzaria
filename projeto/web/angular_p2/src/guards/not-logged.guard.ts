import { inject } from '@angular/core';
import { CanMatchFn, Router } from '@angular/router';
import { AuthService } from '../services/auth/auth.service';
import { LoggerService } from '../services/logger/logger.service';

export const notLoggedGuard: CanMatchFn = (
  // route: Route,
  // segments: UrlSegment[],
  // currentSnapshot?: PartialMatchRouteSnapshot,
) => {
  const router = inject(Router);
  const authService = inject(AuthService);
  const logger = inject(LoggerService);
  const isAuth = authService.isAuthenticated; // Getter que retorna o estado atual como boolean.

  logger.log(`[notLoggedGuard] isAuth: ${isAuth}`);

  return !isAuth ? true : router.createUrlTree(['/home']);
};
