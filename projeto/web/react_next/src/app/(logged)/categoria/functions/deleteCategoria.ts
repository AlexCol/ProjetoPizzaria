import api from "@/services/api";

export default async function removeCategoria(id: number) {
  await api({ method: 'delete', url: `category/${id}` });
}