export type MenuItemDetails = {
  id: string;
  label: string;
  icon: string;
  href: string;
  ordem: number;
  children?: MenuItemDetails[];
  closedMenu?: boolean;
};
