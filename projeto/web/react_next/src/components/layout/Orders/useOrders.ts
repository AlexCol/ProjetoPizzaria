import Pedido from "@/models/Pedido";
import fetchPedidos from "@/services/pedidos/fetchPedidos";
import { useEffect, useState } from "react";

export default function useOrders() {
  const [isLoading, setIsLoading] = useState(false);
  const [pedidos, setPedidos] = useState<Pedido[]>([]);

  /*********************************************************************/
  /* METODOS PARA ABSTRAIR USE STATES                                  */
  /*********************************************************************/
  const getPedidos = async () => {
    setIsLoading(true);
    const data = await fetchPedidos();
    setPedidos(data.orders);
    setIsLoading(false);
  }

  /*********************************************************************/
  /* USE EFFECTS                                                       */
  /*********************************************************************/
  useEffect(() => {
    getPedidos();
  }, []);

  return {
    isLoading,
    pedidos,
    getPedidos,
  }
}
export type useOrdersType = ReturnType<typeof useOrders>;