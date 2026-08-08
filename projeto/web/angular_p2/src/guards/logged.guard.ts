import { inject } from '@angular/core';
import { CanMatchFn, Router } from '@angular/router';
import { AuthService } from '../services/auth/auth.service';
import { LoggerService } from '../services/logger/logger.service';

export const loggedGuard: CanMatchFn = (route, segments) => {
  const router = inject(Router);
  const authService = inject(AuthService);
  const logger = inject(LoggerService);
  const isAuth = authService.isAuthenticated; // Getter que retorna o estado atual como boolean.

  logger.log(`[loggedGuard] isAuth: ${isAuth}`);
  if (isAuth) {
    return true;
  }

  const requestedRootPath = segments[0]?.path ?? '';
  const isKnownProtectedRoute =
    requestedRootPath === '' ||
    route.children?.some((child) => child.path !== '**' && child.path === requestedRootPath);

  // Uma rota protegida conhecida leva o visitante ao login. Para caminhos
  // desconhecidos, false permite que o fallback global exiba a página 404.
  return isKnownProtectedRoute ? router.createUrlTree(['/auth/login']) : false;
};
