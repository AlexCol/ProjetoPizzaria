import api from "@/services/api";
import { toast } from "react-toastify";

export default async function removeCategoria(id: number) {
  try {
    await api({ method: 'delete', url: `category/${id}` });
    toast.success('Registro deletado com sucesso!');
    return true;
  } catch (err) {
    if (err instanceof Error) {
      toast.error(err.message);
    } else {
      toast.error('Erro ao excluir. Tente novamente mais tarde.')
    }
    return false;
  }
}

