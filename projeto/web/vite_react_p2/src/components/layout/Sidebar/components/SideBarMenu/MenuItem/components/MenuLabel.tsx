import { menuItemStyles } from '../menu-item.styles';

type MenuLabelProps = {
  label: string;
  isCollapsed: boolean;
};

function MenuLabel({ label, isCollapsed }: MenuLabelProps) {
  if (isCollapsed) return null;
  return (
    <span className={`${menuItemStyles.menuLabelTC}`}>
      {label}
    </span>
  );
}
export default MenuLabel;
