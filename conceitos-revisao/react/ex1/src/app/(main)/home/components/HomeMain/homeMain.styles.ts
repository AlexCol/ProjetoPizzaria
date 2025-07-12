const containerTailwindClass = `
  flex-6
  self-start
  flex 
  flex-col
  items-center
  justify-center
  pt-2
  bg-gray-100
  dark:bg-gray-800
  duration-300
`;

const counterTailwindClass = `
  text-5xl
  font-bold
  text-gray-800
  dark:text-gray-200
  duration-300
`;

const buttonAreaTailwindClass = `
  py-1
  w-full
  flex
  justify-center
  items-center
  border
  border-gray-300
  dark:border-gray-600
  duration-300
`;

const baseButtonTailwindClass = `
  bg-white
  text-black
  px-4
  py-2
  rounded
  border-2
  w-32
  mx-2
  cursor-pointer
  hover:text-white
  hover:shadow-lg
  hover:border-gray-300
  duration-300
  dark:bg-gray-700
  dark:text-gray-200
  `;

const increaseButtonTailwindClass = `
  ${baseButtonTailwindClass}
  hover:bg-blue-600
  hover:shadow-blue-500/50
  border-blue-500
  active:bg-blue-300
`;

const resetButtonTailwindClass = `
  ${baseButtonTailwindClass}
  hover:bg-yellow-600
  hover:shadow-yellow-500/50
  border-yellow-500
  active:bg-yellow-300
`;

const decreaseButtonTailwindClass = `
  ${baseButtonTailwindClass}
  hover:bg-red-600
  hover:shadow-red-500/50
  border-red-500
  active:bg-red-300
`;

const listaAreaTailwindClass = `
  w-full
  flex
  justify-center
  items-start
  bg-blue-100
  dark:bg-blue-900
  duration-300
  overflow-hidden
`;

const listaTailwindClass = `
  w-full
  max-w-[80%]
  h-80
  bg-white
  dark:bg-gray-700
  duration-300
  p-5
  pl-8
  rounded-lg
  shadow-md
  my-5
  list-disc
  overflow-y-auto
`;

const listaItemTailwindClass = `
  text-lg
  text-gray-700
  dark:text-gray-300
  duration-300
  border-b
  border-gray-200
  dark:border-gray-600
  py-2
  hover:bg-gray-200
  dark:hover:bg-gray-600
  transition-colors
`;

const menuButtonTailwindClass = `
  ${baseButtonTailwindClass}
  hover:bg-gray-600
  hover:shadow-gray-500/50
  border-gray-500
  active:bg-gray-300
  self-end
`;

const autoScrollButtonTailwindClass = `
  ${baseButtonTailwindClass}
  hover:bg-green-600
  hover:shadow-green-500/50
  border-green-500
  active:bg-green-300
`;

const homeMainStyles = {
  container: containerTailwindClass,
  counter: counterTailwindClass,
  buttonArea: buttonAreaTailwindClass,
  increaseButton: increaseButtonTailwindClass,
  resetButton: resetButtonTailwindClass,
  decreaseButton: decreaseButtonTailwindClass,
  listaArea: listaAreaTailwindClass,
  lista: listaTailwindClass,
  listaItem: listaItemTailwindClass,
  menuButton: menuButtonTailwindClass,
  autoScrollButton: autoScrollButtonTailwindClass,
}
export default homeMainStyles;