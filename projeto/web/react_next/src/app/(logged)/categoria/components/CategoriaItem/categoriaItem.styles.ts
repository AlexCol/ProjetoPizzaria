const containerTC = `
  flex 
  items-center 
  justify-between 
  gap-4 
  p-3 
  border-b-2
`;

const labelBoxTC = `
  flex-1
`;

const labelTC = `
  font-semibold 
  text-lg 
  text-light-gray-900-pizzaria 
  dark:text-light-gray-100-pizzaria
`;

const buttonGroupTC = `
  flex 
  items-center 
  gap-2
`;

const defaultButtonTC = `
  px-3 
  py-1 
  rounded-md 
  border-2
  border-transparent
  hover:border-light-gray-900-pizzaria
  dark:hover:border-dark-gray-100-pizzaria
  active:translate-[1px]
`;

const editButtonTC = `
  ${defaultButtonTC}
  bg-light-green-300-pizzaria
  dark:text-dark-gray-700-pizzaria
  dark:bg-dark-green-900-pizzaria  
`;

const deleteButtonTC = `
  ${defaultButtonTC}
  bg-light-red-300-pizzaria
  dark:text-dark-gray-700-pizzaria
  dark:bg-dark-red-900-pizzaria
`;

const categoriaItemStyles = {
  containerTC,
  labelBoxTC,
  labelTC,
  buttonGroupTC,
  editButtonTC,
  deleteButtonTC,
}
export default categoriaItemStyles;