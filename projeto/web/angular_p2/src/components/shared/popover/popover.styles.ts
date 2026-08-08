export const popoverStyles = {
  host: 'inline-block',
  trigger: 'inline-flex',
  popover: [
    'fixed m-0 rounded-md border border-border bg-background p-2 text-foreground shadow-lg',
    'outline-none',
  ].join(' '),
} as const;
