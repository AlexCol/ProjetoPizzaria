import { inject } from '@angular/core';
import { CanMatchFn, Router } from '@angular/router';
import { LoggerService } from '../services/logger/logger.service';
import { AuthStore } from '../stores/auth/auth.store';

export const loggedGuard: CanMatchFn = (route, segments) => {
  const router = inject(Router);
  const authStore = inject(AuthStore);
  const logger = inject(LoggerService);
  const isAuth = authStore.isAuthenticated; // Getter que retorna o estado atual como boolean.

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
  if (!isKnownProtectedRoute) {
    return false;
  }

  const requestedPath = `/${segments
    .map((segment) => segment.path)
    .filter(Boolean)
    .join('/')}`;
  const returnUrl = requestedPath === '/' ? '/home' : requestedPath;

  // se tentar acessar uma rota protegida, redireciona para o login com a url de retorno como query param
  return router.createUrlTree(['/auth/login'], { queryParams: { returnUrl } });
};
