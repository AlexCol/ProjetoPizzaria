import type { MenuItemDetails } from '../../../types/types';
import type { MenuItemProps } from './MenuItem';

function useMenuItem(menuStates: MenuItemProps) {
  const { menu, isMenuItemOpenChecker, toggleMenu, currentPath } = menuStates;

  const hasChildren = menu.children && menu.children.length > 0;
  const isMenuItemOpen = isMenuItemOpenChecker(menu.id);
  const isActive = menu.href === currentPath;

  // Verifica se algum filho está ativo
  const hasActiveChild = (items: MenuItemDetails[] | undefined): boolean => {
    if (!items) return false;
    return items.some((item) => {
      if (item.href === currentPath) return true;
      if (item.children && item.children.length > 0) {
        return hasActiveChild(item.children);
      }
      return false;
    });
  };

  const hasActiveChildren = hasChildren && hasActiveChild(menu.children);

  const handleToggle = () => toggleMenu(menu.id);

  const hrefTratado = menu.href;

  return {
    hasChildren,
    isMenuItemOpen,
    isActive,
    hasActiveChildren,
    handleToggle,
    hrefTratado,
  };
}
export default useMenuItem;
export type UseMenuItemType = ReturnType<typeof useMenuItem>;
