import Produto from "@/models/Produto";
import api from "@/services/api";
import { toast } from "react-toastify";

export default async function editProduto(produto: Produto) {
  if (!produto.id) {
    toast.error('Erro ao processar registro, tente novamente mais tarde.')
    return false;
  }

  const formData = new FormData();
  if (produto.banner)
    formData.append("banner", produto.banner);
  formData.append("name", produto.name);
  formData.append("price", produto.price);
  formData.append("description", produto.description);
  formData.append("categoryId", produto.categoryId.toString());

  try {
    await api({ method: 'patch', url: `product/${produto.id}`, data: formData });
    toast.success('Registro alterado com sucesso!');
    return true;
  } catch (err) {
    if (err instanceof Error) {
      toast.error(err.message);
    } else {
      toast.error('Erro ao atualizar registro. Tente novamente mais tarde.')
    }
    return false;
  }
}

