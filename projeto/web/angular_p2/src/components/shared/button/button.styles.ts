export type ButtonVariant = 'default' | 'primary' | 'success' | 'danger' | 'warning' | 'info' | 'link' | 'unstyled';

const base = [
  'inline-flex cursor-pointer items-center justify-center gap-2 rounded-md px-4 py-2',
  'font-bold text-white transition duration-300',
  'hover:brightness-112 active:scale-99',
  'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-foreground focus-visible:ring-offset-2',
  'focus-visible:ring-offset-background',
  'disabled:cursor-not-allowed disabled:opacity-60 disabled:active:scale-100',
].join(' ');

export const buttonStyles: Record<ButtonVariant, string> = {
  default: `${base} bg-linear-to-r from-primary to-secondary hover:from-secondary hover:to-primary`,
  primary: `${base} bg-primary`,
  success: `${base} bg-success`,
  danger: `${base} bg-danger`,
  warning: `${base} bg-warning`,
  info: `${base} bg-info`,
  link: [
    'inline-flex cursor-pointer items-center justify-center gap-2 font-medium text-primary',
    'transition-colors duration-300 hover:text-tertiary',
    'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-foreground',
    'disabled:cursor-not-allowed disabled:text-disabled',
  ].join(' '),
  unstyled: [
    'inline-flex cursor-pointer items-center justify-center',
    'disabled:cursor-not-allowed disabled:opacity-60',
  ].join(' '),
};

export const disabledButtonStyles = `${base} bg-disabled hover:brightness-100`;
