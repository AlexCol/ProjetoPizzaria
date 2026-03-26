import { menuItemStyles } from '../menu-item.styles';
import { MenuItem } from '../MenuItem';
import type { MenuItemDetails } from '@/components/layout/Sidebar/types/types';

type ChildrenListProps = {
  children: MenuItemDetails[];
  isCollapsed: boolean;
  isMenuItemOpenChecker: (id: string) => boolean;
  toggleMenu: (id: string) => void;
  level: number;
  currentPath: string;
  isMenuItemOpen: boolean;
};

function ChildrenList(props: ChildrenListProps) {
  const { children, isCollapsed, isMenuItemOpenChecker, toggleMenu, level, currentPath, isMenuItemOpen } = props;
  const { divClassName, ulClassName } = buildClassNames(isMenuItemOpen);

  return (
    <div className={divClassName}>
      <ul className={ulClassName}>
        {children.map((child) => (
          <MenuItem
            key={child.id}
            menu={child}
            isCollapsed={isCollapsed}
            isMenuItemOpenChecker={isMenuItemOpenChecker}
            toggleMenu={toggleMenu}
            level={level + 1}
            currentPath={currentPath}
          />
        ))}
      </ul>
    </div>
  );
}

function buildClassNames(isMenuItemOpen: boolean) {
  const divClassName = `${menuItemStyles.childrenContainerTC} 
                        ${isMenuItemOpen ? menuItemStyles.childrenContainerOpenTC : menuItemStyles.childrenContainerClosedTC}`;

  const ulClassName = `${menuItemStyles.childrenListTC}
                        ${isMenuItemOpen ? menuItemStyles.childrenListOpenTC : menuItemStyles.childrenListClosedTC}`;

  return { divClassName, ulClassName };
}

export default ChildrenList;
