const arrowTailwindClass = `
  cursor-pointer
  text-2xl
  text-purple-800
  dark:text-purple-200
  hover:text-purple-900
  dark:hover:text-white
  transition-colors
  select-none
  flex
  items-center
`;

const disabledArrowTailwindClass = `
  text-2xl
  text-gray-400
  cursor-not-allowed
  select-none
  flex
  items-center
`;

const textTailwindClass = `
  text-lg
  font-semibold
  mx-3
`;

export const pageComandsStyles = {
  arrow: arrowTailwindClass,
  disabledArrow: disabledArrowTailwindClass,
  text: textTailwindClass,
}