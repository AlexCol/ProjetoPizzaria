import ItemPedido from "./ItemPedido";

type Pedido = {
  id: number,
  table: number,
  status: boolean,
  draft: boolean,
  name: string,
  criadoEm: string,
  user: {
    name: string
  },
  itens: ItemPedido[],
};

export default Pedido;