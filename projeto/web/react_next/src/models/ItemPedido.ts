import Produto from "./Produto";

type ItemPedido = {
  id: number,
  amount: number,
  productId: number,
  product: Produto,
};

export default ItemPedido;