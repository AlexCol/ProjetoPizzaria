import api from "@/services/api";

export default async function fetchCategorias() {
  const data = await api({ method: 'get', url: 'category' });
  return data;
}