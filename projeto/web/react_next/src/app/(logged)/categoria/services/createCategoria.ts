import api from "@/services/api";
import { toast } from "react-toastify";

export default async function createCategoria(name: string) {
  if (!name) {
    toast.error('Nome não informado.')
    return false;
  }

  try {
    await api({ method: 'post', url: `category`, data: { name } });
    toast.success('Registro criado com sucesso!');
    return true;
  } catch (err) {
    if (err instanceof Error) {
      toast.error(err.message);
    } else {
      toast.error('Erro. Tente novamente mais tarde.')
    }
    return false;
  }

}