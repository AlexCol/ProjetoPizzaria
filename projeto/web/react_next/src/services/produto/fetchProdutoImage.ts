import api from "@/services/api";
import { toast } from "react-toastify";

export default async function fetchProdutoImage(id: number) {
  try {
    const data = await api({ method: 'get', url: `product/${id}` });
    return data.banner;
  } catch (err) {
    if (err instanceof Error) {
      toast.error(err.message);
    } else {
      toast.error('Erro. Tente novamente mais tarde.')
    }
    return {};
  }
}

