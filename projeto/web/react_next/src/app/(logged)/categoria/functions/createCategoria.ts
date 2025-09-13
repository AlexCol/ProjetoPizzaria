import api from "@/services/api";

export default async function createCategoria(name: string) {
  await api({ method: 'post', url: `category`, data: { name } });
}