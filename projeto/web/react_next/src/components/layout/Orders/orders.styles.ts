
const containerTailwindClass = `
  flex
  justify-between
  flex-col
  max-w-[720px]
  mx-auto 
  mb-[20px]
  px-4
`;

const containerHeaderTailwindClass = `
  flex
  items-center
  mt-6
  mb-4
  gap-3.5
`;

const tittleTailwindClass = `
  font-bold
  text-2xl
`;

const listOrdersTailwindClass = `
  flex
  flex-col
  gap-4
`;

const orderItemTailwindClass = `
  flex
  items-center
  border-0
  text-lg
  rounded-lg
  text-light-gray-100-pizzaria
  bg-light-gray-900-pizzaria
  dark:bg-dark-gray-900-pizzaria
  hover:brightness-120
  transition duration-300  
`;

const tagTailwindClass = `
  w-2.5
  h-[60px]
  rounded-l-lg
  mr-4
  dark:bg-dark-green-900-pizzaria
  bg-light-green-300-pizzaria
`;

const iconTailwindClass = `
  text-light-green-300-pizzaria
  dark:text-dark-green-900-pizzaria
`;

const iconAnimatedTailwindClass = `
  ${iconTailwindClass}  
  transition-transform 
  duration-100 
  active:rotate-180
`;

const ordersStyles = {
  container: containerTailwindClass,
  containerHeader: containerHeaderTailwindClass,
  tittle: tittleTailwindClass,
  listOrders: listOrdersTailwindClass,
  orderItem: orderItemTailwindClass,
  tag: tagTailwindClass,
  icon: iconTailwindClass,
  iconAnimated: iconAnimatedTailwindClass,
}
export default ordersStyles;