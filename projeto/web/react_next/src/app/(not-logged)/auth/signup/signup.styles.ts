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

export const signUpStyles = {
  container: containerTailwindClass,
  signUp: signUpTailwindClass,
  title: titleTailwindClass,
  form: formTailwindClass,
  inputContainer: inputContainerTailwindClass,
};