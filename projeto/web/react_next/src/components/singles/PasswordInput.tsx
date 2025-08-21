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
        placeholder={props.placeholder}
        ref={props.inputRef}
        autoComplete={props.autoComplete}
        disabled={props.isLoading}
        required
      />

      <button
        type="button"
        onClick={() => setShowPassword(!showPassword)}
        style={{
          position: "absolute",
          right: "8px",
          top: "50%",
          transform: "translateY(-50%)",
          cursor: "pointer",
        }}
      >
        {showPassword ? "👓" : "🕶️"}
      </button>
    </div>
  )
}

export default PasswordInput