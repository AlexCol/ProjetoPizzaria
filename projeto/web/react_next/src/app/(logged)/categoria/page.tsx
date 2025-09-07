'use client'
import Button from "@/components/singles/Button"
import LinkCustom from "@/components/singles/LinkCustom"
import { Modal } from "@/components/singles/Modal"
import categoriaStyles from "./categoria.styles"
import CategoriaModal from "./components/CategoriaModal"
import useCategoria from "./useCategoria"

export default function Categoria() {
  const states = useCategoria();

  return (
    <main className={categoriaStyles.container}>
      <Button label="Nova categoria" onClick={states.newCategoryModalOpen} />

      {/*aqui colocar um loop contendo as categorias*/}

      <LinkCustom href={'/'} label="Voltar" disabled={false} />

      <Button label="Editar" onClick={states.editCategoryModalOpen} buttonType="Green" />

      {/* modal a ser aberto para editar e criar */}
      <Modal className={categoriaStyles.container} isOpen={states.isModalOpen} onClose={states.handleModalClose}>
        <CategoriaModal
          onClick={states.handleFormClick}
          onCancel={states.handleModalClose}
          title={states.modalTitle}
        />
      </Modal>
    </main>
  )
}