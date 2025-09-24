import { FiX } from "react-icons/fi";
import { useOrdersType } from "../../useOrders";
import orderStyles from "./order.style";

type orderProps = {
  states: useOrdersType
};

function Order({ states }: orderProps) {
  return (
    <div className={orderStyles.containerTC}>
      <button onClick={states.closeModal} className={orderStyles.closeButtonTC}>
        <FiX size={40} />
      </button>
      <div>Order</div>
      <div>{states.pedido.name}</div>
      {states.pedido.itens.map(item => (
        <div key={item.id}>{item.product.name}</div>
      ))}
      <button onClick={() => states.fecharPedido(states.pedido)}>Fechar Pedido</button>
    </div>
  )
}

export default Order