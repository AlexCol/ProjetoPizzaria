import { ChangeEventHandler, HTMLInputAutoCompleteAttribute, HTMLInputTypeAttribute, Ref } from "react";

type inputProps = {
  type?: HTMLInputTypeAttribute | undefined,
  placeholder?: string,
  ref?: Ref<HTMLInputElement> | undefined,
  autoComplete?: HTMLInputAutoCompleteAttribute | undefined,
  disabled?: boolean | undefined,
  required?: boolean | undefined,
  maxLength?: number | undefined,
  name?: string | undefined,
  accept?: string | undefined,
  value?: string | number | readonly string[] | undefined,
  onChange?: ChangeEventHandler<HTMLInputElement> | undefined,
  className?: string,
  step?: string
}

function Input(props: inputProps) {
  return (
    <input
      className={`${inputTailwindClass} ${props.className}`}
      type={props.type}
      placeholder={props.placeholder}
      ref={props.ref}
      autoComplete={props.autoComplete}
      disabled={props.disabled}
      required={props.required}
      maxLength={props.maxLength}
      name={props.name}
      accept={props.accept}
      value={props.value}
      onChange={props.onChange}
      step={props.step}
    />
  )
}

export default Input;

const inputTailwindClass = `
  w-full
  px-4
  py-2
  rounded-md
  border-2
  focus:outline-none
  border-light-gray-900-pizzaria
  dark:border-dark-gray-100-pizzaria
  focus:border-light-green-300-pizzaria
  dark:focus:border-dark-green-900-pizzaria
  placeholder:text-light-gray-900-pizzaria
  dark:placeholder:text-dark-gray-100-pizzaria
  bg-light-gray-100-pizzaria
  dark:bg-dark-gray-700-pizzaria
  text-light-gray-900-pizzaria
  dark:text-dark-gray-100-pizzaria
  hover:border-light-red-300-pizzaria
  dark:hover:border-dark-red-900-pizzaria
`;