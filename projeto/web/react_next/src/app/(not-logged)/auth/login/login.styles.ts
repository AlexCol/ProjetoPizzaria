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
  rememberMeContainer: rememberMeContainerTailwindClass,
  rememberMeCheckBox: rememberMeCheckBoxTailwindClass
};