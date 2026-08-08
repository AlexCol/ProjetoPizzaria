export const inputStyles = {
  host: 'block w-full',
  container: 'w-full',
  label: 'mb-2 block text-sm font-medium text-foreground',
  requiredMark: 'ml-1 text-danger',
  field: 'relative',

  icon: [
    'absolute top-1/2 left-3 inline-flex size-5 -translate-y-1/2 items-center justify-center',
    'text-foreground [&>svg]:size-full',
  ].join(' '),

  input: [
    'w-full rounded-md bg-background px-4 py-2 text-foreground',
    'ring-2 ring-border outline-none placeholder:text-foreground/60',
    'transition-colors duration-75 focus:ring-foreground',
    'disabled:cursor-not-allowed disabled:bg-disabled/20 disabled:opacity-60',
  ].join(' '),

  invalid: 'ring-danger focus:ring-danger',
} as const;
