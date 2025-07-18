const containerTailwindClass = `
  flex 
  flex-col 
  items-center
  mt-6
`;

const titleTailwindClass = `
  text-4xl 
  font-bold 
  mb-4
`;

const listTailwindClass = `
  list-none 
  p-0 
  m-0 
  w-[80%]
`;

const modalInnerTailwindClass = `
  rounded-lg
  shadow-lg
  dark:bg-white
  bg-gray-100
  p-4
  max-w-md
`;

const favoritosStyles = {
  container: containerTailwindClass,
  title: titleTailwindClass,
  list: listTailwindClass,
  modalInner: modalInnerTailwindClass,
};
export default favoritosStyles;