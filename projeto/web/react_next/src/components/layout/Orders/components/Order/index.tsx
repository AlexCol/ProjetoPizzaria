import Button from "@/components/singles/Button";
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

      <article className={orderStyles.orderContainerTC}>
        <h2 className={orderStyles.titleTC}>Detalhes do Pedido</h2>

        <p className={orderStyles.tableTC}>
          Mesa {states.pedido.table.toString().padStart(2, '0')}
        </p>

        {states.pedido.name && (
          <p className={orderStyles.tableTC}>
            {states.pedido.name}
          </p>
        )}

        {states.pedido.itens.map(item => (
          <div key={item.id} className={orderStyles.itensTC}>
            {item.product.name}
          </div>
        ))}

        <section className={orderStyles.buttonAreaTC}>
          <Button
            label="Fechar Pedido"
            buttonType="Red"
            onClick={() => states.fecharPedido(states.pedido)}
            type="button"
            className="max-w-1/4"
          />
        </section>
      </article>
    </div>
  )
}

export default Order