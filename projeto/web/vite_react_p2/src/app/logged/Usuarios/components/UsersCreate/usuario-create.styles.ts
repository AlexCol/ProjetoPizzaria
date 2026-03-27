const usuarioCreateStyles = {
  containerTC: `
    w-full
    min-h-full
    flex 
    items-center 
    justify-center 
    p-4
  `,

  usuarioCreateCardTC: `
    w-full 
    backdrop-blur-md 
    bg-background-2/70
    border border-white/20
    rounded-2xl
    shadow-2xl 
    max-w-4xl
    p-8 
    relative 
    z-10
  `,

  titleContainerTC: `
    text-center 
    mb-2
  `,

  titleH1TC: `
    text-3xl 
    font-bold 
    animate-pulse
    text-secondary
  `,

  titlePTC: `
    text-sm
  `,

  inputTC: `
    py-3  
    bg-background-2
  `,

  selectTC: `
    w-full
    px-4
    py-3
    bg-background-2
    rounded-md
    text-primary-text
    appearance-none
    ring-2 ring-border
    focus:outline-none focus:ring-foreground!
    cursor-pointer
  `,

  formGridTC: `
    grid
    grid-cols-1
    md:grid-cols-2
    gap-5
    mb-6
  `,

  fullWidthFieldTC: `
    md:col-span-2
  `,
};
export default usuarioCreateStyles;

/*     */
