const containerTailwindClass = `
  flex-6
  self-start
  flex 
  flex-col
  items-center
  justify-center
  pt-2
  bg-gray-100
`;

const counterTailwindClass = `
  text-5xl
  font-bold
`;

const buttonAreaTailwindClass = `
  py-1
  w-full
  flex
  justify-center
  items-center
  border
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
  overflow-hidden
`;

const listaTailwindClass = `
  w-full
  max-w-[80%]
  h-80
  bg-white
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
  border-b
  border-gray-200
  py-2
  hover:bg-gray-200
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
}
export default homeMainStyles;