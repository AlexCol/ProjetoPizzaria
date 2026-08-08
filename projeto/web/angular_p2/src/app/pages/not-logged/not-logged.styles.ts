export const notLoggedStyles = {
  host: 'block',
  page: 'grid min-h-dvh place-items-center bg-background px-4 py-8 text-foreground',
  card: 'flex w-full max-w-136 flex-col items-center',
  brand: 'inline-flex items-center gap-3 text-2xl font-bold text-primary-text',
  brandMark: [
    'grid size-17 place-items-center rounded-full',
    'bg-primary text-[2rem] text-white italic',
    'shadow-[inset_-0.35rem_-0.35rem_0_rgb(0_0_0/10%)]',
  ].join(' '),
  title: 'mt-8 mb-6 text-[clamp(1.5rem,4vw,2rem)] font-bold text-primary-text',
  form: 'flex w-full flex-col gap-4',
  field: 'grid gap-[0.4rem]',
  validationError: 'text-sm text-danger',
  rememberOption: 'self-center',
  rememberInput: 'accent-secondary',
  rememberLabel: 'text-foreground',
  signupLink: 'mt-6 text-[0.9rem]',

  links: 'flex flex-row gap-4 text-[0.9rem] text-primary-text',

  message: 'text-center text-[0.9rem] bg-secondary/50 p-4 rounded-md m-4',
  errorMessage: 'text-center text-[0.9rem] bg-danger/50 p-4 rounded-md m-4',
} as const;
