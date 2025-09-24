'use client'
import { Modal } from "@/components/singles/Modal";
import { FiRefreshCcw } from "react-icons/fi";
import Order from "./components/Order";
import ordersStyles from "./orders.styles";
import useOrders from "./useOrders";

function Orders() {
  const states = useOrders();
  const iconClass = states.isLoading ? ordersStyles.icon : ordersStyles.iconAnimated;

  return (
    <>
      <main className={ordersStyles.container}>

        {/* Header com Title e Icon de recarregar */}
        <section className={ordersStyles.containerHeader}>
          <h1 className={ordersStyles.tittle}>Últimos Pedidos</h1>
          <button onClick={states.getPedidos} disabled={states.isLoading}>
            <FiRefreshCcw size={24} className={iconClass} />
          </button>
        </section>

        {/* Lista de Pedidos em Aberto */}
        <section className={ordersStyles.listOrders}>
          {
            states.pedidos.map(item => (
              <button
                className={ordersStyles.orderItem}
                key={item.id}
                onClick={() => states.openModalForEdit(item.id)}
                disabled={states.isLoading}
              >
                <div className={ordersStyles.tag}></div>
                <span>Mesa {item.table.toString().padStart(2, '0')}</span>
              </button>
            ))
          }
        </section>
      </main>

      <Modal isOpen={states.isModalOpen} onClose={states.closeModal}>
        <Order states={states} />
      </Modal>
    </>
  )
}

export default Orders