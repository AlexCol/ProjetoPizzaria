import { Link } from 'react-router-dom';
import type { MenuItemProps } from '../MenuItem';
import type { UseMenuItemType } from '../useMenuItem';
import MenuIcon from './MenuIcon';
import MenuLabel from './MenuLabel';

type MenuItemChildlessProps = {
  menuStates: MenuItemProps;
  menuItemStates: UseMenuItemType;
  baseClassName?: string;
};

function MenuItemChildless({ menuStates, menuItemStates, baseClassName }: MenuItemChildlessProps) {
  const { menu, isCollapsed, level = 0 } = menuStates;
  const { hasActiveChildren, hrefTratado } = menuItemStates;

  if (!hrefTratado) return null;

  return (
    <Link
      to={hrefTratado}
      className={`${baseClassName}`}
      title={menu.label}
      style={{ paddingLeft: isCollapsed ? undefined : `${12 + level * 16}px` }}
      tabIndex={-1}
    >
      <MenuIcon icon={menu.icon} hasActiveChildren={hasActiveChildren} />
      <MenuLabel label={menu.label} isCollapsed={isCollapsed} />
    </Link>
  );
}

export default MenuItemChildless;
