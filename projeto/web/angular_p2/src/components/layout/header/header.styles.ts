export const headerStyles = {
  host: 'block',
  header: [
    'flex min-h-16 items-center justify-between gap-4',
    'bg-background-2 px-[clamp(1rem,4vw,3rem)] py-2',
    'transition-colors duration-300',
  ].join(' '),
  brand: 'flex items-center gap-[0.6rem] font-bold',
  brandMark: [
    'grid size-11 place-items-center rounded-full bg-primary',
    'text-xl text-white italic transition-colors duration-300',
  ].join(' '),
  brandLabel: 'max-[480px]:hidden',
  userInfo: 'text-sm',
  userName: 'font-semibold',
  userRole: 'text-secondary transition-colors duration-150',
  nav: 'flex items-center gap-[clamp(1rem,4vw,2rem)]',
} as const;
