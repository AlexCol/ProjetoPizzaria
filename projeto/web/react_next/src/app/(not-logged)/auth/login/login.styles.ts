const containerTailwindClass = `
  flex 
  flex-col
  items-center 
  justify-center 
  min-h-screen
`;

const loginTailwindClass = `
  mt-6
  flex
  flex-col
  items-center
  justify-center
  gap-4
  w-full
`;

const formTailwindClass = `
  flex
  flex-col
  items-center
  justify-center
  gap-4
  pb-4
  placeholder:text-light-gray-900-pizzaria
  dark:placeholder:text-dark-gray-100-pizzaria
  text-[18px]
  w-10/12
`;

const inputTailwindClass = `
  bg-light-gray-900-pizzaria
  
  placeholder:text-light-gray-900-pizzaria
  dark:placeholder:text-dark-gray-100-pizzaria
  text-light-gray-100-pizzaria
  dark:text-dark-gray-900-pizzaria
  rounded-md
`;

export const loginStyles = {
  container: containerTailwindClass,
  login: loginTailwindClass,
  form: formTailwindClass,
  input: inputTailwindClass
};
