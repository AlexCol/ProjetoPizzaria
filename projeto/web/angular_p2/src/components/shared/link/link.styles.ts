export type LinkVariant = 'default' | 'subtle' | 'unstyled';

const base = [
  'inline-flex cursor-pointer items-center transition-colors duration-200',
  'focus-visible:rounded-sm focus-visible:outline-none focus-visible:ring-2',
  'focus-visible:ring-foreground focus-visible:ring-offset-2 focus-visible:ring-offset-background',
].join(' ');

export const linkStyles: Record<LinkVariant, string> = {
  default: `${base} text-foreground hover:text-secondary`,
  subtle: `${base} text-foreground hover:text-secondary`,
  unstyled: `${base} text-inherit hover:opacity-80`,
};

export const disabledLinkStyles = 'pointer-events-none cursor-not-allowed opacity-60';
