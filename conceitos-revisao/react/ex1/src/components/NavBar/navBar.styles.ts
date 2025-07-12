
const containerTailwindClass = `
  flex
  flex-col
  items-center
  justify-center
  pt-2
  w-full
  h-16
  bg-orange-200
  dark:bg-orange-900
  border-b-2
  border-gray-300
  dark:border-gray-700
  transition-colors
  duration-300
  shadow-md
`;

const titleTailwindClass = `
  text-2xl
  font-bold
  text-gray-800
  dark:text-gray-200
  transition-colors
  duration-300
`;

const navTailwindClass = `
  w-full
`;

const navListTailwindClass = `
  flex
  space-x-4
`;

const navItemTailwindClass = `
  text-gray-600
  hover:text-gray-800
  dark:text-gray-300
  dark:hover:text-gray-200
  transition-colors
  duration-300
`;

const navBarStyles = {
  container: containerTailwindClass,
  title: titleTailwindClass,
  nav: navTailwindClass,
  navList: navListTailwindClass,
  navItem: navItemTailwindClass,
};

export default navBarStyles;
