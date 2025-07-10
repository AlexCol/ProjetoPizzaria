const containerTailwindClass = `
  
  flex 
  flex-col
  items-center
  justify-center
  pt-5
`;

const counterTailwindClass = `
  text-5xl
  font-bold
`;

const buttonAreaTailwindClass = `
  items-center
  justify-center
  mt-5
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
`;

const resetButtonTailwindClass = `
  ${baseButtonTailwindClass}
  hover:bg-yellow-600
  hover:shadow-yellow-500/50
  border-yellow-500
`;

const decreaseButtonTailwindClass = `
  ${baseButtonTailwindClass}
  hover:bg-red-600
  hover:shadow-red-500/50
  border-red-500
`;

const homeStyles = {
  container: containerTailwindClass,
  counter: counterTailwindClass,
  buttonArea: buttonAreaTailwindClass,
  increaseButton: increaseButtonTailwindClass,
  resetButton: resetButtonTailwindClass,
  decreaseButton: decreaseButtonTailwindClass,
}
export default homeStyles;