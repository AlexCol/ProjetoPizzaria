import api from "@/services/api";
import { toast } from "react-toastify";

export default async function fetchProdutos() {
  try {
    const data = await api({ method: 'get', url: 'product' });
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

