export const loaderStyles = {
  host: 'block',
  screen: [
    'grid min-h-dvh place-items-center bg-background text-foreground',
    'transition-colors duration-300',
  ].join(' '),
  loader: [
    'w-fit overflow-hidden font-mono text-[30px] font-bold text-transparent',
    'before:content-["Loading..."]',
    'animate-[loader-text_5s_infinite_cubic-bezier(0.3,1,0,1)]',
    'motion-reduce:animate-none motion-reduce:text-foreground',
  ].join(' '),
} as const;
