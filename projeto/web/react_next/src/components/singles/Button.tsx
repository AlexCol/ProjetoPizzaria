type ButtonProps = {
  label: string,
  disabled?: boolean | undefined,
  type?: "submit" | "reset" | "button" | undefined,
  onClick?: () => void,
}
function Button(props: ButtonProps) {
  return (
    <button
      className={buttonTailwindClass}
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
  bg-light-red-300-pizzaria
  text-white
  hover:bg-dark-red-900-pizzaria
  transition
  duration-200
  active:scale-99
  disabled:opacity-60
  disabled:cursor-not-allowed
  disabled:active:scale-100
`;