'use client'
import { FiRefreshCcw } from "react-icons/fi";
import orderStyles from "./orders.styles";
import useOrders from "./useOrders";

function Orders() {
  const states = useOrders();
  const iconClass = states.isLoading ? orderStyles.icon : orderStyles.iconAnimated;

  return (
    <main className={orderStyles.container}>

      {/* Header com Title e Icon de recarregar */}
      <section className={orderStyles.containerHeader}>
        <h1 className={orderStyles.tittle}>Últimos Pedidos</h1>
        <button onClick={states.getPedidos} disabled={states.isLoading}>
          <FiRefreshCcw size={24} className={iconClass} />
        </button>
      </section>

      {/* Lista de Pedidos em Aberto */}
      <section className={orderStyles.listOrders}>
        {
          states.pedidos.map(item => (
            <button className={orderStyles.orderItem}>
              <div className={orderStyles.tag}></div>
              <span>Mesa {item.table.toString().padStart(2, '0')}</span>
            </button>
          ))
        }
      </section>
    </main>
  )
}

export default Orders