import { Route } from '@angular/router';

export const notFoundRoute: Route = {
  path: 'not-found',
  loadComponent: () => import('./not-found').then((m) => m.NotFoundComponent),
};

export const notFoundWildcardRoute: Route = {
  ...notFoundRoute,
  path: '**',
};

/*
 * Existem duas configurações para a mesma página:
 *
 * 1. notFoundRoute cria uma rota canônica chamada "not-found".
 *    Dentro do layout não autenticado, por exemplo, seu endereço é
 *    /auth/not-found. O fallback global redireciona URLs desconhecidas para
 *    esse endereço explícito.
 *
 * 2. notFoundWildcardRoute troca o path por "**" e funciona como uma rede de
 *    segurança dentro de cada layout. Por ficar no final da lista de children,
 *    ela captura somente os caminhos que nenhuma rota anterior reconheceu.
 *
 * Ao adicionar o wildcard aos layouts autenticado e não autenticado, usamos
 * { ...notFoundWildcardRoute } para criar objetos de configuração independentes,
 * evitando compartilhar a mesma instância de Route entre duas árvores do Router.
 * Adicionar somente notFoundWildcardRoute também tende a funcionar, mas faz as
 * duas árvores apontarem para o mesmo objeto. O clone é uma precaução útil para
 * configurações reutilizadas, especialmente quando possuem lazy loading, pois o
 * Router pode associar estado interno ao objeto durante o processamento.
 *
 * Lembrete para casos semelhantes: quando uma configuração precisar ser usada
 * em vários lugares, pode ser ainda mais explícito expor uma factory:
 *
 * function createNotFoundWildcardRoute(): Route {
 *   return { ...notFoundRoute, path: '**' };
 * }
 *
 * Assim, cada chamada cria uma rota independente e a intenção fica mais clara
 * do que um spread isolado dentro do array de rotas.
 *
 * Resumo:
 * notFoundRoute = endereço oficial da página 404
 * notFoundWildcardRoute = captura qualquer rota desconhecida restante
 */
