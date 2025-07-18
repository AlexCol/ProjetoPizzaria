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
  px-3
  py-1.5
  rounded-full
  bg-gradient-to-r
  from-purple-400
  to-purple-600
  dark:from-purple-800
  dark:to-purple-900
  text-white
  font-semibold
  shadow-md
  hover:scale-105
  hover:from-purple-500
  hover:to-purple-700
  dark:hover:from-purple-700
  dark:hover:to-purple-800
  transition-all
  duration-300
`;
const removeButtonTailwindClass = `
  px-3
  py-1.5
  rounded-full
  bg-gradient-to-r
  from-red-400
  to-red-600
  text-white
  font-semibold
  shadow-md
  hover:scale-105
  hover:from-red-500
  hover:to-red-700
  hover:text-white
  transition-all
  duration-300
`;
export const favMovieItemListStyles = {
  item: itemTailwindClass,
  title: titleTailwindClass,
  actions: actionsTailwindClass,
  detailsLink: detailsLinkTailwindClass,
  removeButton: removeButtonTailwindClass,
};