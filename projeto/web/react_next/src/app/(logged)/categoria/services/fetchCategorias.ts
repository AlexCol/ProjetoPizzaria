import api from "@/services/api";
import { toast } from "react-toastify";

export default async function fetchCategorias() {
  try {
    const data = await api({ method: 'get', url: 'category' });
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

