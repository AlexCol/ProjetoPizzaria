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
  nav: 'flex items-center gap-[clamp(1rem,4vw,2rem)]',
  registrationsMenu: 'min-w-44 p-2!',
  registrationsTrigger:
    'rounded-sm font-normal text-foreground transition-colors duration-200 hover:text-secondary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-foreground',
  activeRegistrationsTrigger: 'text-tertiary!',
  registrationsLinks: 'flex flex-col gap-1',
  registrationsLink: 'w-full rounded-md px-3 py-2 text-sm hover:bg-primary/10 hover:text-primary',
  activeRegistrationsLink: 'bg-primary/10 text-tertiary!',
} as const;
