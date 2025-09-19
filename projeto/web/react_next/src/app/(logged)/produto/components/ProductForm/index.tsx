'use client'

import Button from "@/components/singles/Button";
import { Modal } from "@/components/singles/Modal";
import ProductModal from "./components/ProductModal";
import productFormStyles from "./productFormStyles";
import useProductForm from "./useProductForm";

function ProductForm() {
  const states = useProductForm();

  return (
    <main className={productFormStyles.containerTC}>
      <Button label="Novo produto" onClick={states.newProductModalOpen} />

      <button onClick={states.editProductModalOpen}>Edit</button>

      {/* modal a ser aberto para editar e criar */}
      <Modal className={productFormStyles.containerTC} isOpen={states.isModalOpen} onClose={states.handleModalClose}>
        <ProductModal states={states} />
      </Modal>
    </main>
  )
}

export default ProductForm

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