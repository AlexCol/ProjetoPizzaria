import { toast } from "react-toastify";
import api from "../api";

export default async function deleteProduto(id: number) {
  try {
    await api({ method: 'delete', url: `product/${id}` });
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