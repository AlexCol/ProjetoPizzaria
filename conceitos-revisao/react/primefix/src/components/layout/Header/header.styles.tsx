const headerTailwindClass = `
  h-16
  flex
  items-center
  justify-between
  px-4
  bg-purple-200
  dark:bg-purple-800
  transition-colors
  duration-300
`;

const cursoItensAreaTailwindClass = `
  flex-1
  flex
  flex-row
  items-center
  justify-around
`;

const itemMenuTailwindClass = `
  no-underline
  cursor-pointer
  transition-colors
  duration-300
`;

const logoTailwindClass = `
  ${itemMenuTailwindClass}
  text-3xl
  font-semibold
  text-purple-700
  dark:text-purple-300
  hover:text-purple-900
  dark:hover:text-white
`;

const favoritosTailwindClass = `
  ${itemMenuTailwindClass}
  py-1.5
  px-3.5
  rounded-sm
  text-purple-200
  bg-purple-700  
  hover:bg-purple-800
  dark:bg-purple-200
  dark:text-purple-700
  dark:hover:bg-purple-300
  active:translate-y-[1px]
`;

export const headerStyles = {
  header: headerTailwindClass,
  logo: logoTailwindClass,
  favoritos: favoritosTailwindClass,
  cursoItensArea: cursoItensAreaTailwindClass,
}