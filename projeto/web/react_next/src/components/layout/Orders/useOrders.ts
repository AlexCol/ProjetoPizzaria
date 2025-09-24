import Pedido from "@/models/Pedido";
import editPedido from "@/services/pedidos/editPedido";
import fetchPedido from "@/services/pedidos/fetchPedido";
import fetchPedidos from "@/services/pedidos/fetchPedidos";
import { useEffect, useState } from "react";

export default function useOrders() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [pedidos, setPedidos] = useState<Pedido[]>([]);
  const [pedido, setPedido] = useState<Pedido>({} as Pedido);

  /*********************************************************************/
  /* METODOS PARA ABSTRAIR USE STATES                                  */
  /*********************************************************************/
  const closeModal = () => {
    setIsModalOpen(false);
  };

  const openModalForEdit = async (id: number) => {
    setIsLoading(true);
    //await new Promise<void>((resolve) => { setTimeout(resolve, 1000); });
    const editPedido = await fetchPedido(id);
    setPedido(editPedido);
    setIsLoading(false);
    setIsModalOpen(true);
  }

  const fecharPedido = async (pedido: Pedido) => {
    pedido.status = true;
    const closed = await editPedido(pedido);
    if (closed)
      getPedidos();
    closeModal();
  }

  const getPedidos = async () => {
    setIsLoading(true);
    const data = await fetchPedidos();
    setPedidos(data.orders);
    setIsLoading(false);
  };

  /*********************************************************************/
  /* USE EFFECTS                                                       */
  /*********************************************************************/
  useEffect(() => {
    getPedidos();
  }, []);

  return {
    isModalOpen, openModalForEdit, closeModal,
    isLoading,
    pedidos, pedido,
    getPedidos, fecharPedido,
  }
}
export type useOrdersType = ReturnType<typeof useOrders>;