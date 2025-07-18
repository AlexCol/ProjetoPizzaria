'use client';
import { Modal } from '@/components/ModalBase/Modal';
import { useDarkModeValue } from '@/contexts/darkMode/DarkModeContext';
import React from 'react'

function ModalPage() {
  const [isOpen, setIsOpen] = React.useState(false);
  const handleOpen = () => setIsOpen(true);
  const handleClose = () => setIsOpen(false);
  const { isDarkMode } = useDarkModeValue();

  return (
    <div>
      <button
        onClick={handleOpen}
        className={`p-2 rounded ${isDarkMode ? 'bg-gray-700 text-white' : 'bg-blue-500 text-white'}`}
      >
        Open Modal
      </button>

      <Modal isOpen={isOpen} onClose={handleClose} className={innerTailwindClass}>
        <MyInnerModalExemple isDarkMode={isDarkMode} handleClose={handleClose} />
      </Modal>
    </div>
  )
}

export default ModalPage;

const innerTailwindClass = `  
  rounded-lg 
  shadow-lg 
  bg-white 
  dark:bg-gray-800 
  p-6 
  w-1/2
`;

function MyInnerModalExemple({ isDarkMode, handleClose }: { isDarkMode: boolean, handleClose: () => void }) {
  return (
    <>
      <h2 className={`text-lg font-semibold ${isDarkMode ? 'text-white' : 'text-black'}`}>
        Modal Content
      </h2>
      <button
        onClick={handleClose}
        className={`mt-4 p-2 rounded ${isDarkMode ? 'bg-red-600 text-white' : 'bg-red-500 text-white'}`}
      >
        Close Modal
      </button>
    </>
  )
}