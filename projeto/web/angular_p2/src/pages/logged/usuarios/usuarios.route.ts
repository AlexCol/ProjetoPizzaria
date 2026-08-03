import { Route } from '@angular/router';
import { roleGuard } from '../../../guards/role.guard';

export const usuariosRoute: Route = {
  path: 'usuarios',
  canActivate: [roleGuard],
  data: { roles: ['Admin'] },
  loadComponent: () => import('./usuarios').then((m) => m.UsuariosComponent),
};

//! se decidir liberar acesso a leitura dos usuários, só remover o guard e a propriedade data
