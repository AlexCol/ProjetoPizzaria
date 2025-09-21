const headerTailwindClass = `
  h-16
  flex
  items-center
  justify-between
  px-4
  bg-gray-200
  dark:bg-gray-800
`;

const menuItensTailwindClass = `
  flex-1  
  h-full
  w-full
  flex
  justify-end
  items-center
`;

const logoLinkTailwindClass = `
`;

const linkTailwindClass = `
  m-4
  hover:text-light-green-300-pizzaria
  dark:hover:text-dark-green-900-pizzaria
  cursor-pointer
`;

const logoutIconTailwindClass = `
  text-xl
  hover:scale-110
  transition-transform duration-500
`;

export const headerStyles = {
  header: headerTailwindClass,
  menuItens: menuItensTailwindClass,
  logoLink: logoLinkTailwindClass,
  link: linkTailwindClass,
  logoutIcon: logoutIconTailwindClass
}