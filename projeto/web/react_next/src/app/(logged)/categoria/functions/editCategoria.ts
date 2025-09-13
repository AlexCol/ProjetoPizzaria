import api from "@/services/api";

export default async function editCategoria(id: number, name: string) {
  await api({ method: 'patch', url: `category/${id}`, data: { name } });
}