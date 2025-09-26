import ConfirmMessage from "@/components/singles/ConfirmMessage"
import Categoria from "@/models/Categoria"
import Produto from "@/models/Produto"
import { useState } from "react"
import productItemStyles from "./productItem.styles"

type ProductItemProps = {
  produto: Produto,
  categorias: Categoria[],
  editarClick: (product: Produto) => void,
  deletarClick: (id: number) => void
}

function ProductItem(props: ProductItemProps) {
  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);
  const openConfirmModal = () => { setIsConfirmModalOpen(true) };
  const closeConfirmModal = () => { setIsConfirmModalOpen(false) };
  const action = () => {
    deletarClick(produto.id)
    closeConfirmModal();
  };

  const { produto, categorias, deletarClick, editarClick } = props;
  return (
    <>
      <div className={productItemStyles.containerTC}>
        <div className={productItemStyles.labelBoxTC}>
          <div className={productItemStyles.labelTC}>
            {produto.name}
          </div>

          <div className={`${productItemStyles.labelTC} whitespace-pre`}>
            R$ {produto.price.padStart(6, ' ')}
          </div>

          <div className={productItemStyles.labelTC}>
            {categorias.find(item => item.id === produto.categoryId)?.name}
          </div>
        </div>

        <div className={productItemStyles.buttonGroupTC}>
          <button
            type="button"
            onClick={() => editarClick(produto)}
            className={productItemStyles.editButtonTC}
          >
            Editar
          </button>

          <button
            type="button"
            onClick={openConfirmModal}
            className={productItemStyles.deleteButtonTC}
          >
            Excluir
          </button>
        </div>
      </div>

      <ConfirmMessage
        action={action}
        isOpen={isConfirmModalOpen}
        closeConfirmModal={closeConfirmModal}
        message='Tem certeza que deseja excluir?'
      />
    </>

  )
}

export default ProductItem