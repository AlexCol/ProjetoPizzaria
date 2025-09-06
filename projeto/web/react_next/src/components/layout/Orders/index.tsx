import { FiRefreshCcw } from "react-icons/fi";
import orderStyles from "./orders.styles";

function Orders() {
  return (
    <main className={orderStyles.container}>
      <section className={orderStyles.containerHeader}>
        <h1 className={orderStyles.tittle}>Últimos Pedidos</h1>
        <button>
          <FiRefreshCcw size={24} className={orderStyles.icon} />
        </button>
      </section>

      <section className={orderStyles.listOrders}>
        <button className={orderStyles.orderItem}>
          <div className={orderStyles.tag}></div>
          <span>Mesa10</span>
        </button>

        <button className={orderStyles.orderItem}>
          <div className={orderStyles.tag}></div>
          <span>Mesa13</span>
        </button>
      </section>
    </main>
  )
}

export default Orders