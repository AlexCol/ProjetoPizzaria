const loginStyles = {
  containerTC: `
    w-full
    min-h-screen
    flex
    items-center
    justify-center
    p-4
    bg-linear-to-br
    from-background
    via-accent/30
    to-secondary/40
  `,

  cardTC: `
    w-full
    max-w-md
    backdrop-blur-md
    bg-card/80
    border border-border/60
    rounded-2xl
    shadow-2xl
    p-8
    relative
    z-10
    transition-colors duration-300
  `,

  titleContainerTC: `
    text-center
    mb-8
  `,

  titleH1TC: `
    text-3xl
    font-bold
    mb-2
  `,

  titlePTC: `
    text-sm
    text-muted-foreground
  `,

  formTC: `
    space-y-4
  `,

  fieldTC: `
    space-y-2
  `,

  inputTC: `
    h-9
  `,

  lembrarAndEsqueciContainerTC: `
    flex
    items-center
    justify-between
    text-sm
    pb-1
  `,

  lembrarContainerTC: `
    flex
    items-center
    cursor-pointer
    select-none
  `,

  lembrarCheckboxTC: `
    w-4
    h-4
    rounded
    mr-2
    accent-primary
  `,

  forgotButtonTC: `
    text-primary
    hover:underline
    hover:opacity-90
    transition-opacity
    cursor-pointer
  `,

  submitButtonTC: `
    w-full
    mt-1
  `,

  registrarContainerTC: `
    mt-6
    text-center 
    text-sm
    text-muted-foreground
  `,

  registrarLabelTC: `
    font-normal
  `,

  registerLinkTC: `
    text-primary
    font-medium
    hover:underline
  `,
};
export default loginStyles;