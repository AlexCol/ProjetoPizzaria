import { Modal } from './Modal';

type ConfirmMessageProps = {
  message: string;
  isOpen: boolean;
  closeConfirmModal: () => void;
  action: () => void;
};

function ConfirmMessage(props: ConfirmMessageProps) {
  return (
    <Modal isOpen={props.isOpen} onClose={props.closeConfirmModal}>
      <div className="p-6 bg-white rounded-2xl shadow-lg max-w-sm w-full mx-auto">
        <h1 className="text-lg font-semibold text-gray-800">{props.message}</h1>

        <div className="flex justify-end gap-3 mt-6">
          <button
            type="button"
            onClick={props.closeConfirmModal}
            className="px-4 py-2 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-100 transition"
          >
            Cancelar
          </button>

          <button
            type="button"
            onClick={props.action}
            className="px-4 py-2 rounded-lg bg-red-600 text-white hover:bg-red-700 transition"
          >
            Confirmar
          </button>
        </div>
      </div>
    </Modal>
  );
}

export default ConfirmMessage;
