import { FocusTrap } from 'focus-trap-react';
import { AnimatePresence, motion } from 'framer-motion';
import React, { ReactNode, useEffect } from 'react';
import ReactDOM from 'react-dom';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  children: ReactNode;
  className?: string;
}

export const Modal: React.FC<ModalProps> = ({ isOpen, onClose, children, className }) => {
  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', handleEsc);
    return () => document.removeEventListener('keydown', handleEsc);
  }, [onClose]);

  return ReactDOM.createPortal(
    <AnimatePresence>
      {isOpen && (
        <motion.div
          onClick={onClose}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className={`
            w-full
            h-full
            flex-1
            flex
            justify-center
            items-center
            fixed
            inset-0
            z-[1000]
            bg-dark-gray-900-pizzaria/90
          `}
        >
          <motion.div
            onClick={e => e.stopPropagation()}
            initial={{ y: 50, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 50, opacity: 0 }}
            transition={{ duration: 0.3 }}
            className={className}
          >
            <FocusTrap>
              <div className='w-full'>
                {children}
              </div>
            </FocusTrap>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>,
    document.body
  );
};
