import Pedido from "@/models/Pedido";
import { toast } from "react-toastify";
import api from "../api";

export default async function editPedido(pedido: Pedido) {
  const { id, itens, user, criadoEm, ...dataPedido } = pedido; //removendo itens e user do pedido, pois eles serão barrados pelo backend se forem enviados
  try {
    await api({ method: 'patch', url: `order/${pedido.id}`, data: { ...dataPedido } });
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