import type { MenuItemProps } from '../MenuItem';
import type { UseMenuItemType } from '../useMenuItem';
import ChildrenList from './ChildrenList';
import MenuIcon from './MenuIcon';
import MenuLabel from './MenuLabel';
import ToggleIcon from './ToggleIcon';

type WithChildrenMenuProps = {
  menuStates: MenuItemProps;
  menuItemStates: UseMenuItemType;
  baseClassName?: string;
};

function MenuItemWithChildren({ menuStates, menuItemStates, baseClassName }: WithChildrenMenuProps) {
  const { menu, isCollapsed, isMenuItemOpenChecker, toggleMenu, level = 0, currentPath } = menuStates;
  const { isMenuItemOpen, hasActiveChildren, handleToggle } = menuItemStates;

  return (
    <>
      <div
        className={`${baseClassName}`}
        onClick={handleToggle}
        title={menu.label}
        style={{ paddingLeft: isCollapsed ? undefined : `${12 + level * 16}px` }}
        tabIndex={-1}
      >
        <MenuIcon icon={menu.icon} hasActiveChildren={hasActiveChildren} />
        <MenuLabel label={menu.label} isCollapsed={isCollapsed} />
        <ToggleIcon isCollapsed={isCollapsed} isMenuItemOpen={isMenuItemOpen} />
      </div>

      {/* Renderiza filhos recursivamente - somente quando o item do menu está aberto */}
      {/* {isMenuItemOpen && ( */}
      <ChildrenList
        children={menu.children!}
        isCollapsed={isCollapsed}
        isMenuItemOpenChecker={isMenuItemOpenChecker}
        toggleMenu={toggleMenu}
        level={level}
        currentPath={currentPath}
        isMenuItemOpen={isMenuItemOpen}
      />
      {/* )} */}
    </>
  );
}

export default MenuItemWithChildren;
