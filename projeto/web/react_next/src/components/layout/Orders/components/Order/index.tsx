import Button from "@/components/singles/Button";
import { useOrdersType } from "../../useOrders";
import orderStyles from "./order.style";

type orderProps = {
  states: useOrdersType
};

function Order({ states }: orderProps) {
  return (
    <div className={orderStyles.containerTC}>
      <article className={orderStyles.orderContainerTC}>
        <h2 className={orderStyles.titleTC}>Detalhes do Pedido</h2>

        <p className={orderStyles.tableTC}>
          Mesa {states.pedido.table.toString().padStart(2, '0')} {states.pedido.name ? ' - ' + states.pedido.name : ''}
        </p>

        {states.pedido.itens.map((item, index) => (
          <div key={item.id} className={orderStyles.itensTC}>
            {index + 1} - {item.product.name}
          </div>
        ))}

        <section className={orderStyles.buttonAreaTC}>
          <Button
            label="Voltar"
            buttonType="Red"
            onClick={states.closeModal}
            type="button"
            className="max-w-1/4"
          />
          <Button
            label="Concluir Pedido"
            buttonType="Green"
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