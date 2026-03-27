import { FocusTrap } from 'focus-trap-react';
import { AnimatePresence, motion } from 'framer-motion';
import React, { useEffect, type ReactNode } from 'react';
import ReactDOM from 'react-dom';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  children: ReactNode;
  className?: string;
  bloquBackdropClose?: boolean;
}

export const Modal: React.FC<ModalProps> = ({ isOpen, onClose, children, className, bloquBackdropClose = false }) => {
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
        <FocusTrap>
          <motion.div
            onClick={bloquBackdropClose ? undefined : onClose}
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
            z-1000
            bg-gray-900/90
            backdrop-blur-xs
          `}
          >
            <motion.div
              onClick={(e) => e.stopPropagation()}
              initial={{ y: 50, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: 50, opacity: 0 }}
              transition={{ duration: 0.3 }}
              className={className ?? mediaWidthTC}
            >
              <div className='w-full'>{children}</div>
            </motion.div>
          </motion.div>
        </FocusTrap>
      )}
    </AnimatePresence>,
    document.body,
  );
};

const mediaWidthTC = `
  w-full          // padrão: mobile ocupa toda largura
  sm:w-[80%]      // >= 640px: 80% da largura
  md:w-[70%]      // >= 768px: 70% da largura
  lg:w-[60%]      // >= 1024px: 60% da largura
  xl:w-[50%]      // >= 1280px: 50% da largura
  2xl:w-[40%]      // >= 1536px: 40% da largura
`;
