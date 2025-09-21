import Produto from "@/models/Produto";
import api from "@/services/api";
import { toast } from "react-toastify";

export default async function createProduto(produto: Produto) {

  const formData = new FormData();
  if (produto.banner)
    formData.append("banner", produto.banner);
  formData.append("name", produto.name);
  formData.append("price", produto.price);
  formData.append("description", produto.description);
  formData.append("categoryId", produto.categoryId.toString());

  try {
    await api({ method: 'post', url: `product`, data: formData });
    toast.success('Registro criado com sucesso!');
    return true;
  } catch (err) {
    if (err instanceof Error) {
      toast.error(err.message);
    } else {
      toast.error('Erro. Tente novamente mais tarde.')
    }
    return false;
  }

}