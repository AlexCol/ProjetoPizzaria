import React from 'react'
import { confirmModalStyles } from './confirmModal.styles';

type ConfirmModalProps = {
  handleClose: () => void;
  mensagem: string;
};

function ConfirmModal({ handleClose, mensagem }: ConfirmModalProps) {
  return (
    <>
      <span className={confirmModalStyles.modalText}>{mensagem}</span>
      <div className="flex justify-end mt-4">
        <button onClick={handleClose} className={confirmModalStyles.modalOkButton}>Ok</button>
      </div>
    </>
  )
}

export default ConfirmModal