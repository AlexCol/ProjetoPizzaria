import { FormEvent, RefObject, useRef, useState } from "react";

export default function useSignUp() {
  const nameRef = useRef<HTMLInputElement>(null) as RefObject<HTMLInputElement>;
  const emailRef = useRef<HTMLInputElement>(null) as RefObject<HTMLInputElement>;
  const passwordRef = useRef<HTMLInputElement>(null) as RefObject<HTMLInputElement>;
  const confirmPasswordRef = useRef<HTMLInputElement>(null) as RefObject<HTMLInputElement>;
  const [errMessage, setErrMessage] = useState<string>("");
  const [isLoading, setIsLoading] = useState<boolean>(false);
  //const permissionsRef = useRef<HTMLSelectElement>(null) as RefObject<HTMLSelectElement>;
  const [permissions, setPermissions] = useState<string[]>([]);

  function handlePermissionChange(e: React.ChangeEvent<HTMLInputElement>) {
    const value = e.target.value;
    setPermissions(prev =>
      prev.includes(value)
        ? prev.filter(p => p !== value)
        : [...prev, value]
    );
  }

  const signUpHandler = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsLoading(true);
    const name = nameRef.current.value;
    const email = emailRef.current.value;
    const password = passwordRef.current.value;
    const confirmPassword = confirmPasswordRef.current.value;
    //const permissions = Array.from(permissionsRef.current.selectedOptions).map(option => option.value);

    await new Promise((resolve) => setTimeout(resolve, 2000));

    if (password !== confirmPassword) {
      setErrMessage("As senhas não conferem");
      setIsLoading(false); //!remover quando for pra chamar o dispatch
      return;
    }

    if (permissions.length === 0) {
      setErrMessage("Selecione pelo menos uma permissão");
      setIsLoading(false); //!remover quando for pra chamar o dispatch
      return;
    }

    //dispatch(signUp({ name, email, password, confirmPassword, permissions }));
    alert(`Nome: ${name}, Email: ${email}, Senha: ${password}, Permissões: ${permissions.join(", ")}`);
    setIsLoading(false); //!remover quando for pra chamar o dispatch
  }

  return {
    nameRef,
    emailRef,
    passwordRef,
    confirmPasswordRef,
    //permissionsRef,
    permissions,
    handlePermissionChange,
    signUpHandler,
    isLoading,
    errMessage

  }
}