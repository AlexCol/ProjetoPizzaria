const itemTailwindClass = `
  p-2
  mb-2
  rounded
  flex
  justify-between
  align-items-center
`;

const titleTailwindClass = `
  text-xl
  font-bold
`;
const actionsTailwindClass = `
  flex
  justify-center
  items-center
  gap-2
`;
const detailsLinkTailwindClass = `
  cursor-pointer
  p-1
  rounded
  bg-purple-200
  dark:bg-purple-800
  text-purple-700
  dark:text-purple-300
  hover:bg-purple-300
  dark:hover:bg-purple-600
  transition-colors
  duration-300
`;
const removeButtonTailwindClass = `
  bg-red-500
  hover:bg-white
  text-white
  hover:text-red-500
  transition-colors
  duration-300
  p-1
  rounded
`;
export const favMovieItemListStyles = {
  item: itemTailwindClass,
  title: titleTailwindClass,
  actions: actionsTailwindClass,
  detailsLink: detailsLinkTailwindClass,
  removeButton: removeButtonTailwindClass,
};