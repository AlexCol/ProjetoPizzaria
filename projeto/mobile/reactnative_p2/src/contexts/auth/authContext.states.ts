import { useState } from "react";

export default function useAuthContextStates() {
  const [id, setId] = useState<string>("");
  const [name, setName] = useState<string>("");
  const [token, setToken] = useState<string>("");
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [startupLoading, setStartupLoading] = useState<boolean>(false);

  return {
    id, setId,
    name, setName,
    token, setToken,
    isLoading, setIsLoading,
    startupLoading, setStartupLoading
  };
}

export type AuthContextStatesType = ReturnType<typeof useAuthContextStates>;