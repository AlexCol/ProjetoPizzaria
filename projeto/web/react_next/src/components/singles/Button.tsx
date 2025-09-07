type buttonTypes = 'Red' | 'Green' | undefined;

type ButtonProps = {
  className?: string,
  label: string,
  disabled?: boolean | undefined,
  type?: "submit" | "reset" | "button" | undefined,
  onClick?: () => void,
  buttonType?: buttonTypes;
}
function Button(props: ButtonProps) {
  const compClassName = filtraButtonClassName(props.buttonType);
  return (
    <button
      className={compClassName}
      onClick={props.onClick}
      type={props.type}
      disabled={props.disabled}
    >
      {props.label}
    </button>
  )
}

export default Button;

const buttonTailwindClass = `
  w-full
  mt-2
  py-2
  rounded-md
  font-bold
  text-white
  transition
  duration-200
  active:scale-99
  disabled:opacity-60
  disabled:cursor-not-allowed
  disabled:active:scale-100
`;

const buttonRedTailwindClass = `
  ${buttonTailwindClass}
  bg-light-red-300-pizzaria
  hover:bg-dark-red-900-pizzaria
`;

const buttonGreemTailwindClass = `
  ${buttonTailwindClass}
  bg-light-green-300-pizzaria
  dark:text-dark-gray-700-pizzaria
  dark:bg-dark-green-900-pizzaria
  hover:brightness-120
  transition duration-300  
`;

function filtraButtonClassName(buttonType: buttonTypes) {
  switch (buttonType) {
    case 'Red':
      return buttonRedTailwindClass;
    case 'Green':
      return buttonGreemTailwindClass;
    default:
      return buttonRedTailwindClass;
  }
}