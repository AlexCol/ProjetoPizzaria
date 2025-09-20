const labelImageTC = `
  w-full
  h-[280px]
  relative
  rounded-[8px]
  flex
  items-center
  justify-center
  cursor-pointer
  flex-col
  border-[1px]
  focus:border-light-green-300-pizzaria
  dark:focus:border-dark-green-900-pizzaria
  hover:border-light-red-300-pizzaria
  dark:hover:border-dark-red-900-pizzaria  
`;

const clearTC = `
  absolute 
  top-2 
  right-2 
  p-1
  rounded-full 
  transition
`;

const spanTC = `
  z-[99]
  opacity-80
  hover:opacity-100
  transition-all duration-500
`;

const previewTC = `
  w-full
  h-full
  rounded-[8px]
  object-fill
`;

const imageFormStyles = {
  labelImageTC,
  clearTC,
  spanTC,
  previewTC,
}
export default imageFormStyles;