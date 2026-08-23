import { Route } from '@angular/router';
import { loggedGuard } from '../../../guards/logged.guard';
import { notFoundWildcardRoute } from '../not-found/not-found.route';
import { categoriasRoute } from './categorias/categorias.route';
import { homeRoute } from './home/home.route';
import { produtosRoute } from './produtos/produtos.route';
import { usuariosRoute } from './usuarios/usuarios.route';

export const loggedRoutes: Route = {
  path: '',
  canMatch: [loggedGuard],
  runGuardsAndResolvers: 'always',
  loadComponent: () => import('./logged.layout').then((m) => m.LoggedLayout),
  children: [
    { path: '', redirectTo: 'home', pathMatch: 'full' },
    homeRoute,
    usuariosRoute,
    produtosRoute,
    categoriasRoute,
    notFoundWildcardRoute, //com ela aqui dentro o notfound quando logado continua com rodapé e cabeçalho
  ],
};
