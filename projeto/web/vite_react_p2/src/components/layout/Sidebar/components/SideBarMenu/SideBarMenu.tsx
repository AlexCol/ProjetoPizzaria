import type { useSidebarType } from '../../useSidebar';
import { MenuItem } from './MenuItem/MenuItem';
import { sidebarMenuStyles } from './sidebar-menu.styles';

export type MenuProps = {
  menuStates: useSidebarType;
};

function SidebarMenu({ menuStates }: MenuProps) {
  const { menus } = menuStates;

  return (
    <nav className={sidebarMenuStyles.navTC}>
      <ul className={sidebarMenuStyles.menuListTC}>
        {menus.map((menu) => (
          <div key={menu.id}>
            <MenuItem
              menu={menu}
              isCollapsed={menuStates.isCollapsed}
              isMenuItemOpenChecker={menuStates.isMenuItemOpenChecker}
              toggleMenu={menuStates.toggleMenu}
              level={0}
              currentPath={menuStates.pathname}
            />
          </div>
        ))}
      </ul>
    </nav>
  );
}

export default SidebarMenu;
