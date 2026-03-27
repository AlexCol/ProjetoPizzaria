import type { MenuItemDetails } from '../types/types';
import type { UserSessionPayload } from '@/services/generated/models';

export default function GetMenuTree(userData: UserSessionPayload): MenuItemDetails[] {
  const isAdmin = userData?.user?.role?.name === 'Admin';

  const menusItens: MenuItemDetails[] = [
    { id: '1', label: 'Dashboard', ordem: 1, children: [], href: '/', icon: 'LayoutDashboard' },
    ...(isAdmin
      ? [
          {
            id: '2',
            label: 'Cadastros',
            ordem: 2,
            children: [
              { id: '2-1', label: 'Categorias', ordem: 1, children: [], href: '/categorias', icon: 'SmallCircle' },
              { id: '2-2', label: 'Produtos', ordem: 2, children: [], href: '/produtos', icon: 'SmallCircle' },
              {
                id: '2-3',
                label: 'Cadastro de Usuários',
                ordem: 3,
                children: [],
                href: '/cadastro/usuarios',
                icon: 'SmallCircle',
              },
            ],
            href: '',
            icon: 'Book',
          },
        ]
      : []),
  ] satisfies MenuItemDetails[];

  return menusItens;
}
