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
  gap-6
  w-full
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
  disabled:opacity-60
  active:scale-99
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

const rememberMeContainerTailwindClass = `
  flex
  items-center
  gap-2
  text-sm
`;

const rememberMeCheckBoxTailwindClass = `
  accent-dark-green-900-pizzaria
`;

export const loginStyles = {
  container: containerTailwindClass,
  login: loginTailwindClass,
  form: formTailwindClass,
  input: inputTailwindClass,
  button: buttonTailwindClass,
  link: linkTailwindClass,
  logo: logoTailwindClass,
  rememberMeContainer: rememberMeContainerTailwindClass,
  rememberMeCheckBox: rememberMeCheckBoxTailwindClass
};