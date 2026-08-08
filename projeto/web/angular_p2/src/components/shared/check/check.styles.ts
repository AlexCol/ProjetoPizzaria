export const checkStyles = {
  host: 'inline-block',
  container: 'inline-flex items-center gap-2',
  check: [
    'size-4 cursor-pointer rounded border border-border bg-background',
    'accent-primary outline-none transition-colors duration-75',
    'focus-visible:ring-2 focus-visible:ring-foreground focus-visible:ring-offset-2',
    'focus-visible:ring-offset-background',
    'disabled:cursor-not-allowed disabled:opacity-60',
  ].join(' '),
  label: 'cursor-pointer select-none text-sm text-foreground',
} as const;
