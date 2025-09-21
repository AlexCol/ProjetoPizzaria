'use client'

import Button from "@/components/singles/Button";
import LinkCustom from "@/components/singles/LinkCustom";
import { Modal } from "@/components/singles/Modal";
import { FiArrowLeft } from "react-icons/fi";
import ProductItem from "./components/ProductItem";
import ProductModal from "./components/ProductModal";
import productStyles from "./productStyles";
import useProduct from "./useProduct";

function Produto() {
  const states = useProduct();

  return (
    <main className={productStyles.containerTC}>
      <Button label="Novo produto" onClick={states.newProductModalOpen} />

      {states.produtos.length > 0 && (
        states.produtos.map(item => (
          <ProductItem
            key={item.id}
            produto={item}
            categorias={states.categorias}
            editarClick={states.editProductModalOpen}
            deletarClick={states.handleDelete}
          />
        ))
      )}

      <LinkCustom href={'/'} icon={FiArrowLeft} disabled={false} />

      {/* modal a ser aberto para editar e criar */}
      <Modal className={productStyles.containerTC} isOpen={states.isModalOpen} onClose={states.handleModalClose}>
        <ProductModal states={states} />
      </Modal>
    </main>
  )
}

export default Produto

/*
      <Button label="Nova categoria" onClick={states.newCategoryModalOpen} />

      {states.categorias.length > 0 && (
        states.categorias.map(item => (
          <CategoriaItem
            key={item.id}
            categoria={item}
            editarClick={states.editCategoryModalOpen}
            deletarClick={states.deleteCategoria}
          />
        ))
      )}
*/