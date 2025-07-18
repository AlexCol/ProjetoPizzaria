const modalTextTailwindClass = `
  text-gray-700
  dark:text-gray-900  
  text-center
`;

const modalOkButtonTailwindClass = `
    px-4
    py-2
    rounded
    bg-gradient-to-r
    from-green-400
    to-green-600
  dark:from-green-800
    dark:to-green-900    
    text-white
    font-semibold
    shadow-md    
    transition-colors
    duration-200
`;

export const confirmModalStyles = {
  modalText: modalTextTailwindClass,
  modalOkButton: modalOkButtonTailwindClass
};
