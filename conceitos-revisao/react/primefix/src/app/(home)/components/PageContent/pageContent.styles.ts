const containerTailwindClass = `
  pt-4
  px-10
  mx-auto
`;

const listaFilmesTailwindClass = `
  grid 
  grid-cols-1 
  sm:grid-cols-2 
  md:grid-cols-4 
  lg:grid-cols-5 
  gap-4
`;

const aticleTailwindClass = `
  w-full
  truncate
  transition
  duration-300
  hover:scale-105
  select-none
  cursor-pointer  
`

const filmeTituloTailwindClass = `
  max-w-full
  text-xl
  sm:text-2xl
  md:text-2xl
  lg:text-2xl
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

const baseStarTailwindClass = `
  absolute 
  top-1 
  right-1 
  z-10
  transition-all
  duration-300
  md:text-3xl
  text-4xl
`;

const starFavoredTailwindClass = `
  ${baseStarTailwindClass}
  text-yellow-400 
  opacity-100
`;

const starNotFavoredTailwindClass = `
  ${baseStarTailwindClass}
  text-gray-400 
  opacity-100
`;

export const pageContentStyles = {
  container: containerTailwindClass,
  listaFilmes: listaFilmesTailwindClass,
  aticle: aticleTailwindClass,
  filmeTitulo: filmeTituloTailwindClass,
  filmeImagem: filmeImagemTailwindClass,
  filmeLink: filmeLinkTailwindClass,
  starFavored: starFavoredTailwindClass,
  starNotFavored: starNotFavoredTailwindClass,
};