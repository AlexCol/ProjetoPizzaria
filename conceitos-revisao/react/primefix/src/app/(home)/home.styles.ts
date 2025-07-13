const containerTailwindClass = `
  pt-4
  px-10
  mx-auto
`;

const listaFilmesTailwindClass = `
  grid 
  grid-cols-1 
  sm:grid-cols-2 
  md:grid-cols-3 
  lg:grid-cols-4 
  gap-4
`;

const aticleTailwindClass = `
  w-full
  truncate
`

const filmeTituloTailwindClass = `
  max-w-full
  text-xl
  sm:text-2xl
  md:text-2xl
  lg:text-4xl
  font-semibold  
`;

const filmeImagemTailwindClass = `
  w-full
  h-auto
  rounded-tl-xl
  rounded-tr-xl
`;

const filmeLinkTailwindClass = `
  w-full  
  flex
  items-center
  justify-center
  p-2.5
  no-underline  
  rounded-bl-xl
  rounded-br-xl
  bg-amber-500
  text-white
  hover:bg-amber-600
  transition-colors duration-300
`;

export const homeStyles = {
  container: containerTailwindClass,
  listaFilmes: listaFilmesTailwindClass,
  aticle: aticleTailwindClass,
  filmeTitulo: filmeTituloTailwindClass,
  filmeImagem: filmeImagemTailwindClass,
  filmeLink: filmeLinkTailwindClass,
};

/*

*/