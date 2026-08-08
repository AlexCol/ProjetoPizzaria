export const notFoundStyles = {
  host: 'block',
  page: [
    'grid place-items-center bg-background px-4 py-12 text-foreground',
    'transition-colors duration-300',
  ].join(' '),
  anonymousPage: 'min-h-dvh',
  authenticatedPage: 'min-h-[70dvh]',
  card: [
    'flex w-full max-w-160 flex-col items-center rounded-2xl border border-border/25',
    'bg-background-2/60 px-6 py-12 text-center shadow-xl shadow-primary/5',
    'backdrop-blur-sm sm:px-12',
  ].join(' '),
  brand: 'inline-flex items-center gap-3 text-xl font-bold text-primary-text',
  brandMark: [
    'grid size-14 place-items-center rounded-full bg-primary text-2xl text-white italic',
    'shadow-[inset_-0.3rem_-0.3rem_0_rgb(0_0_0/10%)]',
  ].join(' '),
  code: [
    'mt-8 bg-linear-to-r from-primary via-secondary to-tertiary bg-clip-text',
    'text-[clamp(4.5rem,18vw,8rem)] leading-none font-black tracking-tight text-transparent',
  ].join(' '),
  title: 'mt-4 text-[clamp(1.5rem,5vw,2.25rem)] font-bold text-primary-text',
  description: 'mt-3 max-w-115 text-sm leading-6 text-foreground sm:text-base',
  action: [
    'mt-8 justify-center rounded-md bg-linear-to-r from-primary to-secondary px-5 py-3',
    'font-bold text-white hover:from-secondary hover:to-primary hover:text-white',
    'active:scale-99',
  ].join(' '),
} as const;
