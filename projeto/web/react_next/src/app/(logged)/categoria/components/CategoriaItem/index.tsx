import ConfirmMessage from '@/components/singles/ConfirmMessage';
import Categoria from '@/models/Categoria';
import { useState } from 'react';
import categoriaItemStyles from './categoriaItem.styles';

type CategoriaItemProps = {
  categoria: Categoria,
  editarClick: (categoria: Categoria) => void,
  deletarClick: (id: number) => void
}

function CategoriaItem({ categoria, editarClick, deletarClick }: CategoriaItemProps) {
  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);
  const openConfirmModal = () => { setIsConfirmModalOpen(true) };
  const closeConfirmModal = () => { setIsConfirmModalOpen(false) };
  const action = () => {
    deletarClick(categoria.id);
    closeConfirmModal();
  };

  return (
    <>
      <div className={categoriaItemStyles.containerTC}>
        <div className={categoriaItemStyles.labelBoxTC}>
          <div className={categoriaItemStyles.labelTC}>
            {categoria.name}
          </div>
        </div>

        <div className={categoriaItemStyles.buttonGroupTC}>
          <button
            type="button"
            onClick={() => editarClick(categoria)}
            className={categoriaItemStyles.editButtonTC}
          >
            Editar
          </button>

          <button
            type="button"
            onClick={openConfirmModal}
            className={categoriaItemStyles.deleteButtonTC}
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

export default CategoriaItem;

