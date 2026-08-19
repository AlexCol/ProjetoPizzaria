import { inject } from '@angular/core';
import { CanMatchFn, Router } from '@angular/router';
import { LoggerService } from '../services/logger/logger.service';
import { AuthStore } from '../stores/auth/auth.store';

export const notLoggedGuard: CanMatchFn = (
  // route: Route,
  // segments: UrlSegment[],
  // currentSnapshot?: PartialMatchRouteSnapshot,
) => {
  const router = inject(Router);
  const authStore = inject(AuthStore);
  const logger = inject(LoggerService);
  const isAuth = authStore.isAuthenticated; // Getter que retorna o estado atual como boolean.

  logger.log(`[notLoggedGuard] isAuth: ${isAuth}`);

  return !isAuth ? true : router.createUrlTree(['/home']);
};
