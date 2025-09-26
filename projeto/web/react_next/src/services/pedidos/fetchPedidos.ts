import { toast } from "react-toastify";
import api from "../api";

export default async function fetchPedidos() {
  try {
    const params = {
      status: false,
      draft: false,
      full_data: false,
      sort_field: 'criadoEm'
    }

    const data = await api({ method: 'get', url: 'order', params });
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