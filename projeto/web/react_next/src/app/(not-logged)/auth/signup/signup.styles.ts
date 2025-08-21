const containerTailwindClass = `
  flex
  flex-col
  items-center
  justify-center
  min-h-screen
`;

const signUpTailwindClass = `
  mt-6
  flex
  flex-col
  items-center
  justify-center
  gap-6
  w-full
`;

const titleTailwindClass = `
  text-2xl
  font-bold
  text-center
`;

const formTailwindClass = `
  flex
  flex-col
  items-center
  justify-center
  gap-4
  w-8/12
  md:w-lg
`;

const inputContainerTailwindClass = `
  w-full
  relative
`;

const inputTailwindClass = `
  w-full
  px-4
  py-2
  rounded-md
  border-2
  focus:outline-none
  border-light-gray-900-pizzaria
  dark:border-dark-gray-100-pizzaria
  focus:border-light-green-300-pizzaria
  dark:focus:border-dark-green-900-pizzaria
  placeholder:text-light-gray-900-pizzaria
  dark:placeholder:text-dark-gray-100-pizzaria
`;

const buttonTailwindClass = `
  w-full
  mt-2
  py-2
  rounded-md
  font-bold
  bg-light-red-300-pizzaria
  text-white
  hover:bg-dark-red-900-pizzaria
  transition
  duration-200
  active:scale-99
  disabled:opacity-60
  disabled:cursor-not-allowed
  disabled:active:scale-100
`;

const linkTailwindClass = `
  mt-2
  text-sm
  dark:hover:text-dark-green-900-pizzaria
  hover:text-light-green-300-pizzaria
  transition
`;

const logoTailwindClass = `
  w-auto
  h-auto
`;

const checkboxGroupTailwindClass = `
  flex
  flex-row
  gap-6
  w-full
  justify-center
  items-center
  mt-2
  accent-dark-green-900-pizzaria
`;

export const signUpStyles = {
  container: containerTailwindClass,
  signUp: signUpTailwindClass,
  title: titleTailwindClass,
  form: formTailwindClass,
  inputContainer: inputContainerTailwindClass,
  input: inputTailwindClass,
  button: buttonTailwindClass,
  link: linkTailwindClass,
  logo: logoTailwindClass,
  checkboxGroup: checkboxGroupTailwindClass
};