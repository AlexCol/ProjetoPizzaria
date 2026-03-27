import type { MenuItemDetails } from '../../../types/types';
import MenuItemChildless from './components/MenuItemChildless';
import MenuItemWithChildren from './components/MenuItemWithChildren';
import { menuItemStyles } from './menu-item.styles';
import useMenuItem from './useMenuItem';

export type MenuItemProps = {
  menu: MenuItemDetails;
  isCollapsed: boolean;
  isMenuItemOpenChecker: (id: string) => boolean;
  toggleMenu: (id: string) => void;
  level?: number;
  currentPath: string;
};

export function MenuItem(menuStates: MenuItemProps) {
  const menuItemStates = useMenuItem(menuStates);
  const { hasChildren } = menuItemStates;
  const { baseClassName } = buildClassNames(menuStates.isCollapsed, menuItemStates.isActive);

  return (
    <li className='relative'>
      {hasChildren ? (
        <MenuItemWithChildren //! Menu com filho, não é link, mas sim um div clicável para expandir/recolher e lista seus filhos
          menuStates={menuStates}
          menuItemStates={menuItemStates}
          baseClassName={baseClassName}
        />
      ) : (
        <MenuItemChildless // ! Menu sem filho, vai ser um link normal
          menuStates={menuStates}
          menuItemStates={menuItemStates}
          baseClassName={baseClassName}
        />
      )}
    </li>
  );
}

function buildClassNames(isCollapsed: boolean, isActive: boolean) {
  const baseClassName = [
    menuItemStyles.menuItemTC,
    isCollapsed ? menuItemStyles.menuItemCollapsedTC : '',
    isActive ? menuItemStyles.menuItemActiveTC : menuItemStyles.menuItemInactiveTC,
  ]
    .filter(Boolean)
    .join(' ');
  return { baseClassName };
}
