export const footerStyles = {
  host: 'block',
  footer: [
    'grid min-h-16 grid-cols-1 items-center gap-2',
    'bg-background-2 p-4 text-center',
    'transition-colors duration-300',
    'sm:grid-cols-[1fr_auto_1fr]',
  ].join(' '),

  left: 'flex justify-center sm:justify-self-start',

  text: 'm-0 text-sm sm:justify-self-center',

  userTrigger: [
    'inline-flex cursor-pointer items-center gap-2 rounded-md px-2 py-1',
    'text-sm text-foreground transition-colors duration-200',
    'hover:bg-background',
  ].join(' '),

  userName: 'font-medium',

  connectionDot: ['inline-block size-2.5 shrink-0 rounded-full', 'animate-pulse'].join(' '),

  connectionOnline: 'bg-success',
  connectionOffline: 'bg-danger',

  userPopover: 'min-w-64 p-3',

  userPopoverHeader: ['mb-3 flex items-start justify-between gap-4', 'border-b border-border pb-3'].join(' '),

  userPopoverName: 'font-semibold text-foreground',

  connectionStatus: ['inline-flex items-center gap-2 whitespace-nowrap', 'text-xs text-foreground/70'].join(' '),

  userDetails: 'grid gap-2 text-sm border-b border-border pb-3',

  userDetailRow: 'grid grid-cols-[4rem_1fr] gap-3 text-left',
  userDetailLabel: 'font-medium text-foreground/70',
  userDetailValue: 'm-0 min-w-0 wrap-break-word text-foreground',

  bottomDetails: 'mt-3 flex justify-end',
  logoutButton: 'text-sm text-foreground/70 hover:text-foreground',
} as const;
