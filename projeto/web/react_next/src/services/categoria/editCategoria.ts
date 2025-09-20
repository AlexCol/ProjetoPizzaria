import api from "@/services/api";
import { toast } from "react-toastify";

export default async function editCategoria(id: number, name: string) {
  if (!id || !name) {
    toast.error('Erro ao processar registro, tente novamente mais tarde.')
    return false;
  }

  try {
    await api({ method: 'patch', url: `category/${id}`, data: { name } });
    toast.success('Registro alterado com sucesso!');
    return true;
  } catch (err) {
    if (err instanceof Error) {
      toast.error(err.message);
    } else {
      toast.error('Erro ao atualizar registro. Tente novamente mais tarde.')
    }
    return false;
  }
}

