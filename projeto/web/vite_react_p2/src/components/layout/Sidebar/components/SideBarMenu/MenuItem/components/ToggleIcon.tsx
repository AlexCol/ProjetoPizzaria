import { ChevronRight as ChevronArrow, ChevronDown } from 'lucide-react';
import { menuItemStyles } from '../menu-item.styles';

type ToggleButtonProps = {
  isMenuItemOpen: boolean;
  isCollapsed: boolean;
};

function ToggleIcon({ isMenuItemOpen, isCollapsed }: ToggleButtonProps) {
  const btnClassName = `${menuItemStyles.toggleButtonTC} ${isCollapsed ? menuItemStyles.toggleButtonCollapsedTC : ''}`;
  const IconContainerClassName = isMenuItemOpen ? menuItemStyles.chevronContainerOpenTC : '';
  const Icon = isMenuItemOpen ? ChevronDown : ChevronArrow;
  const IconClassName = isMenuItemOpen ? menuItemStyles.chevronOpenTC : menuItemStyles.chevronClosedTC;

  return (
    <div className={btnClassName}>
      <div className={IconContainerClassName}>
        <Icon size={16} className={IconClassName} />
      </div>
    </div>
  );
}

export default ToggleIcon;
