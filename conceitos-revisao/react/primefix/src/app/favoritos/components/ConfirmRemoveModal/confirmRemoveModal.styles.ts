const modalTextTailwindClass = `
  text-gray-700
  dark:text-gray-900  
  text-center
`;

const modalCancelButtonTailwindClass = `
  px-4
  py-2
  rounded
  bg-gray-300
  text-gray-800
  hover:bg-gray-400
  dark:bg-gray-600
  dark:text-gray-200
  transition-colors
  duration-200
`;

const modalRemoveButtonTailwindClass = `
  px-4
  py-2
  rounded
  bg-red-500
  text-white
  hover:bg-red-600
  dark:bg-red-700
  dark:text-red-200
  transition-colors
  duration-200
`;

export const confirmModalStyles = {
  modalText: modalTextTailwindClass,
  modalCancelButton: modalCancelButtonTailwindClass,
  modalRemoveButton: modalRemoveButtonTailwindClass
}