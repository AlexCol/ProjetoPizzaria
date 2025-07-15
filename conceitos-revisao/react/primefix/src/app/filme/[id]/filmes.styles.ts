
const filmeInfoTailwindClass = `
  mt-4
  mx-auto
  flex 
  flex-col
  px-4
  max-w-[800px]
`;

const titleTailwindClass = `
  mt-2
  text-4xl
  font-bold
  my-3.5
`;

const imgTailwindClass = `
  rounded-lg
  w-3xl
  max-w-full
  max-h-96
  object-cover
`;

const overviewTitleTailwindClass = `
  text-2xl
  font-semibold
  mt-4
`;

const overviewTailwindClass = `
  text-lg
  my-2
  whitespace-pre-wrap
  break-words
  max-w-3xl
`;

const ratingTailwindClass = `
  text-xl
  font-semibold
`;

const buttonsAreaTailwindClass = `
  mt-4
  flex
  gap-4
`;

const buttonTailwindClass = `
  px-4
  py-2
  rounded-lg
  transition-colors
  duration-300
  cursor-pointer
`;

const buttonSalvarTailwindClass = `
  ${buttonTailwindClass}
  dark:bg-blue-700
  dark:hover:bg-blue-800
  bg-blue-400
  hover:bg-blue-600
`;

const buttonTrailerTailwindClass = `
  ${buttonTailwindClass}
  dark:bg-gray-300
  dark:text-gray-700
  dark:hover:bg-gray-400
  bg-gray-600
  text-gray-200
  hover:bg-gray-500
`;

export const filmesStyles = {
  filmeInfo: filmeInfoTailwindClass,
  title: titleTailwindClass,
  img: imgTailwindClass,
  overviewTitle: overviewTitleTailwindClass,
  overview: overviewTailwindClass,
  rating: ratingTailwindClass,
  buttonsArea: buttonsAreaTailwindClass,
  buttonSalvar: buttonSalvarTailwindClass,
  buttonTrailer: buttonTrailerTailwindClass
}