export const usuarioModalStyles = {
  host: 'block',
  form: 'flex flex-col gap-6 p-6',
  title: 'text-xl font-bold text-primary-text',
  closeButton: [
    'min-h-11 self-end rounded-md border border-border bg-background px-4 py-2',
    'font-semibold text-foreground transition-colors',
    'hover:bg-background-2 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary',
  ].join(' '),
} as const;
