const loginStyles = {
  containerTC: `
    w-full
    min-h-full
    flex 
    items-center 
    justify-center 
    p-4
  `,

  cardTC: `
    w-full 
    backdrop-blur-md 
    bg-background-2/70
    border border-border/20
    rounded-2xl
    shadow-2xl 
    max-w-md
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
  `,

  lembrarAndEsqueciContainerTC: `
    flex 
    items-center 
    justify-between 
    text-sm
    pb-3
  `,

  lembrarContainerTC: `
    flex 
    items-center 
    cursor-pointer
  `,

  lembrarCheckboxTC: `
    w-4 
    h-4 
    rounded 
    mr-2 
    accent-primary
  `,

  registrarContainerTC: `
    mt-6 
    text-center 
    text-sm
  `,

  registrarLabelTC: `
    font-normal
  `
};
export default loginStyles;