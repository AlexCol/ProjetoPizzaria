import { toast } from "react-toastify";
import api from "../api";

export default async function fetchPedido(id: number) {
  try {
    const data = await api({ method: 'get', url: `order/${id}` });
    return data;
  } catch (err) {
    if (err instanceof Error) {
      toast.error(err.message);
    } else {
      toast.error('Erro. Tente novamente mais tarde.')
    }
    return {};
  }
}