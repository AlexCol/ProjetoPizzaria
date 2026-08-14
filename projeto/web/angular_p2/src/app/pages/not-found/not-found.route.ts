import { Route } from '@angular/router';

export const notFoundWildcardRoute: Route = {
  path: '**',
  loadComponent: () => import('./not-found').then((m) => m.NotFoundComponent),
};

/*
 * O wildcard é usado no final das rotas globais e, separadamente, no final das
 * rotas autenticadas. Assim, URLs desconhecidas de usuários autenticados mantêm
 * o LoggedLayout, enquanto os demais casos usam a página 404 fora dos layouts.
 * Ao reutilizá-lo em outra árvore, crie uma cópia com spread para que cada árvore
 * receba seu próprio objeto Route.
 */
