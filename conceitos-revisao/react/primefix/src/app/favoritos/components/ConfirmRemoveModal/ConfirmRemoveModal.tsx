import React from 'react'
import { confirmModalStyles } from './confirmRemoveModal.styles';

type ConfirmRemoveModalProps = {
  isOpen: boolean;
  handleClose: () => void;
  handleConfirm: () => void;
  handleRemove: () => void;
};

function ConfirmRemoveModal({ isOpen, handleClose, handleConfirm, handleRemove }: ConfirmRemoveModalProps) {
  if (!isOpen) return null;

  return (
    <>
      <span className={confirmModalStyles.modalText}>Tem certeza que deseja remover este filme dos favoritos?</span>
      <div className="flex justify-end mt-4">
        <button onClick={handleClose} className={confirmModalStyles.modalCancelButton}>Cancelar</button>
        <button onClick={handleRemove} className={confirmModalStyles.modalRemoveButton}>Remover</button>
      </div>
    </>
  )
}

export default ConfirmRemoveModal