export const selectStyles = {
  host: 'block w-full',
  container: 'w-full',
  label: 'mb-2 block text-sm font-medium text-foreground',
  requiredMark: 'ml-1 text-danger',
  field: 'relative',
  select: [
    'w-full appearance-none rounded-md bg-background px-4 py-2 pr-10 text-foreground',
    'ring-2 ring-border outline-none transition-colors duration-75 focus:ring-foreground',
    'disabled:cursor-not-allowed disabled:bg-disabled/20 disabled:opacity-60',
  ].join(' '),
  icon: [
    'pointer-events-none absolute top-1/2 right-3 inline-flex size-5 -translate-y-1/2 items-center justify-center',
    'text-foreground [&>svg]:size-full',
  ].join(' '),
} as const;
