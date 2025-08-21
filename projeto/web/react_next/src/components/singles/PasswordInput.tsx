'use client'

import { useState } from "react";

type PasswordInputProps = {
  inputRef: React.RefObject<HTMLInputElement>;
  isLoading: boolean;
  inputClassName: string;
  placeholder: string;
  autoComplete?: string;
};

function PasswordInput(props: PasswordInputProps) {
  const [showPassword, setShowPassword] = useState(false);
  return (
    <div className="w-full relative">
      <input
        className={props.inputClassName}
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