export const gradientBackgroundStyles = {
  host: 'pointer-events-none fixed inset-0 block overflow-hidden',
  contrastLayer: 'absolute inset-0 bg-background',
  gradientLayer: [
    'absolute inset-0',
    'animate-gradient motion-reduce:animate-none',
    'bg-linear-to-br from-primary via-secondary to-tertiary',
  ].join(' '),
  radialLayer: [
    'absolute inset-0',
    'bg-[radial-gradient(circle_at_50%_120%,rgba(59,130,246,0.25),rgba(15,23,42,0.05))]',
  ].join(' '),
} as const;
