const formTC = `
  flex
  flex-col
  mt-2
  gap-4
`;

const titleTC = `
  mt-2
  text-2xl
  font-bold
`;

const baseInputTC = `
  w-full
  rounded-md
  border-2
  focus:outline-none
  border-light-gray-900-pizzaria
  dark:border-dark-gray-100-pizzaria
  focus:border-light-green-300-pizzaria
  dark:focus:border-dark-green-900-pizzaria
  placeholder:text-light-gray-900-pizzaria
  dark:placeholder:text-dark-gray-100-pizzaria
  bg-light-gray-100-pizzaria
  dark:bg-dark-gray-700-pizzaria
  text-light-gray-900-pizzaria
  dark:text-dark-gray-100-pizzaria
  hover:border-light-red-300-pizzaria
  dark:hover:border-dark-red-900-pizzaria  
`;

const selectTC = `
  ${baseInputTC}
  px-3
  h-[40px]
`;

const textAreaTC = `
  ${baseInputTC}
  px-4
  py-2
  min-h-32
  resize-none
`;

const buttonGroupTC = `
  flex
  justify-around
`;

const productModalStyles = {
  formTC,
  titleTC,
  selectTC,
  textAreaTC,
  buttonGroupTC
};
export default productModalStyles;