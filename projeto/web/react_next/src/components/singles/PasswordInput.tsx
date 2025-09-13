'use client'

import { useState } from "react";

type PasswordInputProps = {
  inputRef: React.RefObject<HTMLInputElement>;
  isLoading: boolean;
  placeholder: string;
  autoComplete?: string;
};

function PasswordInput(props: PasswordInputProps) {
  const [showPassword, setShowPassword] = useState(false);
  return (
    <div className="w-full relative">
      <input
        className={inputTailwindClass}
        type={showPassword ? "text" : "password"}
        maxLength={30}
        placeholder={props.placeholder}
        ref={props.inputRef}
        autoComplete={props.autoComplete}
        disabled={props.isLoading}
        required
      />

      <button
        type="button"
        onClick={() => setShowPassword(!showPassword)}
        className={buttonTailwindClass}
      >
        {showPassword ? "👓" : "🕶️"}
      </button>
    </div>
  )
}

export default PasswordInput;

const buttonTailwindClass = `
  absolute
  right-2
  top-1/2
  -translate-y-1/2
  cursor-pointer
`;

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
`;