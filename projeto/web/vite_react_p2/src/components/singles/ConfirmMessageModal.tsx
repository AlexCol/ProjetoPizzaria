import { useEffect, useRef } from 'react';
import Button from './Button';
import { Modal } from './Modal';

type Props = {
  isOpen: boolean;
  tittle: string;
  message: string;
  classNames?: {
    containerTC?: string;
    tittleTC?: string;
    messageTC?: string;
    buttonContainerTC?: string;
    buttonTC?: string;
  };
  onClose: () => void;
  onConfirm: () => void;
};

function ConfirmMessageModal(props: Props) {
  const { isOpen, onClose, tittle, message, onConfirm, classNames } = props;
  const { containerTC, tittleTC, messageTC, buttonContainerTC, buttonTC } = classNames || {};
  const cancelButtonRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (isOpen && cancelButtonRef.current) {
      // Pequeno delay para garantir que o modal já renderizou
      const timer = setTimeout(() => {
        cancelButtonRef.current?.focus();
      }, 100);

      return () => clearTimeout(timer);
    }
  }, [isOpen]);

  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <div className={containerTC || 'bg-background-2 rounded-lg p-6 max-w-md mx-auto'}>
        {/* Título */}
        <h2 className={tittleTC || 'text-xl font-semibold mb-4 text-center'}>{tittle}</h2>

        {/* Mensagem */}
        <p className={messageTC || 'mb-6 text-center'}>{message}</p>

        {/* Botões */}
        <div className={buttonContainerTC || 'flex gap-3 justify-center'}>
          <button className='w-0 h-0' />
          <Button
            label='Confirmar'
            buttonType='Success'
            onClick={onConfirm}
            className={buttonTC || 'px-6 py-2 min-w-25'}
          />
          <Button label='Cancelar' buttonType='Danger' onClick={onClose} className={buttonTC || 'px-6 py-2 min-w-25'} />
        </div>
      </div>
    </Modal>
  );
}

export default ConfirmMessageModal;
