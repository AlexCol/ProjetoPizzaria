'use client'
import Button from "@/components/singles/Button";
import LinkCustom from "@/components/singles/LinkCustom";
import { Modal } from "@/components/singles/Modal";
import { FiArrowLeft } from "react-icons/fi";
import categoriaStyles from "./categoria.styles";
import CategoriaItem from "./components/CategoriaItem";
import CategoriaModal from "./components/CategoriaModal/CategoriaModal";
import useCategoria from "./useCategoria";

export default function Categoria() {
  const states = useCategoria();
  return (
    <main className={categoriaStyles.container}>
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

      <LinkCustom href={'/'} icon={FiArrowLeft} disabled={false} />

      {/* modal a ser aberto para editar e criar */}
      <Modal className={categoriaStyles.container} isOpen={states.isModalOpen} onClose={states.handleModalClose}>
        <CategoriaModal states={states} />
      </Modal>
    </main>
  )
}