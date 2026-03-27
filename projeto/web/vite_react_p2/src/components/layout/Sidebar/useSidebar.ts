import { useCallback, useEffect, useMemo, useState } from 'react';
import { useLocation } from 'react-router-dom';
import type { MenuItemDetails } from './types/types';
import { useAuthContext } from '@/components/contexts/auth/AuthContext';
import GetMenuTree from '@/router/data/menu-itens';

export default function useSidebar() {
  const { userData } = useAuthContext();
  const [isCollapsed, setIsCollapsed] = useState<boolean>(false);
  const [menuTree, setMenuTree] = useState<MenuItemDetails[]>([]);
  const [openMenus, setOpenMenus] = useState<Record<string, boolean>>({});
  const [openMenusBeforeCollapse, setOpenMenusBeforeCollapse] = useState<Record<string, boolean>>({});
  const { pathname } = useLocation();

  const sortMenus = useCallback((menus: MenuItemDetails[]): MenuItemDetails[] => {
    return menus
      .slice()
      .sort((a, b) => Number(a.ordem) - Number(b.ordem))
      .map((menu) => ({
        ...menu,
        children: sortMenus(menu.children || []),
      }));
  }, []);

  const toggleMenu = useCallback((id: string) => {
    setOpenMenus((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));
  }, []);

  const menus = useMemo(() => sortMenus(menuTree), [menuTree, sortMenus]);
  const isMenuItemOpenChecker = useCallback((id: string) => !!openMenus[id], [openMenus]);

  const toggleSidebar = useCallback(() => {
    setIsCollapsed((prev) => {
      if (!prev) {
        setOpenMenusBeforeCollapse(openMenus);
        setOpenMenus({});
      } else {
        setOpenMenus(openMenusBeforeCollapse);
      }
      return !prev;
    });
  }, [openMenus, openMenusBeforeCollapse]);

  function fetchMenuTree() {
    if (!userData) return;
    setMenuTree(GetMenuTree(userData));
  }

  useEffect(() => {
    if (!userData) return;
    fetchMenuTree();
  }, [userData]);

  return {
    menus,
    isMenuItemOpenChecker,
    toggleMenu,
    isCollapsed,
    toggleSidebar,
    pathname,
  };
}

export type useSidebarType = ReturnType<typeof useSidebar>;
