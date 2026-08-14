import { Routes } from '@angular/router';
import { loggedRoutes } from './pages/logged/logged.routes';
import { notFoundWildcardRoute } from './pages/not-found/not-found.route';
import { notLoggedRoutes } from './pages/not-logged/not-logged.routes';

export const routes: Routes = [notLoggedRoutes, loggedRoutes, notFoundWildcardRoute];

/*
 * Como expor rotas não autenticadas na raiz no futuro
 * Exemplo: /recover-password em vez de /auth/recover-password.
 *
 * 1. Em logged.routes.ts, remova o redirect de path: '' para home.
 * 2. Neste arquivo, coloque { path: '', redirectTo: 'home', pathMatch: 'full' }
 *    como a primeira rota. Assim, somente / redireciona para /home, fora dos
 *    layouts autenticado e público.
 * 3. Em not-logged.routes.ts, transforme notLoggedRoutes em um agrupador com
 *    path: '' e mantenha NotLoggedLayout no loadComponent desse agrupador.
 * 4. Não coloque notLoggedGuard no agrupador path: ''. Se o guard ficar no pai,
 *    ele também interceptará /home antes que o Router alcance loggedRoutes.
 * 5. Coloque diretamente nesse agrupador apenas as páginas que devem começar na
 *    raiz e aplique canMatch: [notLoggedGuard] em cada uma delas, por exemplo
 *    recoverPasswordRoute e resendActivationTokenRoute.
 * 6. Dentro do mesmo agrupador, crie uma rota filha path: 'auth', protegida por
 *    notLoggedGuard, e mantenha nela loginRoute e as demais páginas com /auth.
 *    Não carregue NotLoggedLayout novamente na filha auth: o layout do pai já
 *    fornece o router-outlet e repeti-lo criaria layouts aninhados.
 * 7. A ordem global deve ser: redirect de /, notLoggedRoutes, loggedRoutes e,
 *    por último, notFoundWildcardRoute. Não adicione wildcard ao agrupador
 *    público, pois ele impediria que loggedRoutes recebesse /home e similares.
 * 8. Atualize os links movidos para caminhos absolutos, como
 *    routerLink="/recover-password", e procure referências aos caminhos antigos.
 * 9. Valide os cenários anônimo e autenticado para /, /home, /auth/login, uma
 *    rota pública na raiz e uma URL inexistente, além de executar build e lint.
 */
