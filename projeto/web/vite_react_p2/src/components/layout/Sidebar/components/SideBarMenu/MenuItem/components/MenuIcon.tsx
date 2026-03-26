import * as LucideIcons from 'lucide-react';
import { menuItemStyles } from '../menu-item.styles';

type MenuIconProps = {
  icon: string;
  hasActiveChildren?: boolean;
};

function MenuIcon({ icon, hasActiveChildren }: MenuIconProps) {
  const Icon = (LucideIcons as any)[icon] || LucideIcons.Circle;

  return (
    <div className={menuItemStyles.iconContainerTC}>
      <Icon size={20} className={menuItemStyles.menuIconTC} />
      {hasActiveChildren && <div className={menuItemStyles.activeChildDotTC} />}
    </div>
  );
}

export default MenuIcon;
