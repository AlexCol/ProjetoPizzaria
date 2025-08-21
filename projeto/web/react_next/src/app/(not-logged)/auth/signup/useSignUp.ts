import { signup, userReset } from "@/redux/slices/userSlice";
import { AppDispatch, RootState } from "@/redux/store";
import { FormEvent, RefObject, useEffect, useRef, useState } from "react";
import { useDispatch, useSelector } from "react-redux";

export default function useSignUp() {
  const dispatch = useDispatch<AppDispatch>();
  const { status, message } = useSelector((state: RootState) => state.user);
  const nameRef = useRef<HTMLInputElement>(null) as RefObject<HTMLInputElement>;
  const emailRef = useRef<HTMLInputElement>(null) as RefObject<HTMLInputElement>;
  const passwordRef = useRef<HTMLInputElement>(null) as RefObject<HTMLInputElement>;
  const confirmPasswordRef = useRef<HTMLInputElement>(null) as RefObject<HTMLInputElement>;
  const [validationMessage, setValidationMessage] = useState<string>("");
  const [permissions, setPermissions] = useState<string[]>([]);
  const possiblePermissions: Map<string, string> = new Map([["KITCHEN", "Cozinha"], ["WAITRESS", "Garçom"]]);

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
    const name = nameRef.current.value;
    const email = emailRef.current.value;
    const password = passwordRef.current.value;
    const confirmPassword = confirmPasswordRef.current.value;

    if (password !== confirmPassword) {
      setValidationMessage("As senhas não conferem");
      return;
    }

    if (permissions.length === 0) {
      setValidationMessage("Selecione pelo menos uma permissão");
      return;
    }

    dispatch(signup({ name, email, password, confirmPassword, permissions }));
  }

  useEffect(() => {
    if (validationMessage) {
      const timer = setTimeout(() => setValidationMessage(""), 3000);
      return () => clearTimeout(timer);
    }

    if (message) {
      const timer = setTimeout(() => dispatch(userReset()), 3000);
      return () => clearTimeout(timer);
    }
  }, [message, validationMessage]);

  useEffect(() => {
    if (status === 'succeeded') {
      nameRef.current.value = "";
      emailRef.current.value = "";
      passwordRef.current.value = "";
      confirmPasswordRef.current.value = "";
      setPermissions([]);
    }
  }, [status]);

  return {
    nameRef, emailRef, passwordRef, confirmPasswordRef, permissions, //relacionados aos inputs
    handlePermissionChange, signUpHandler, //relacionados aos eventos
    isLoading: status === 'loading', //relacionado ao estado de carregamento
    status, message, //relacionados ao estado da requisição (slice)
    validationMessage, //relacionado à mensagem de validação do formulário
    possiblePermissions
  }
}