import { FormEvent, useState } from "react";

export default function useCategoria() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [mode, setMode] = useState<'edit' | 'create'>('create');
  const modalTitle = mode === 'create' ? 'Nova Categoria' : 'Editar Categoria';

  /*********************************************************************/
  /* METODOS PARA ABSTRAIR USE STATES                                  */
  /*********************************************************************/
  const handleModalClose = () => {
    setIsModalOpen(false);
  };

  const newCategoryModalOpen = () => {
    setIsModalOpen(true);
    setMode('create');
  }

  const editCategoryModalOpen = () => {
    setIsModalOpen(true);
    setMode('edit');
  }

  /*********************************************************************/
  /* METODO CENTRALIZADOR DO CLICK EXTERNO                             */
  /*********************************************************************/
  function handleFormClick(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();

    if (mode === 'create')
      handleCreate();
    else if (mode === 'edit')
      handleEdit();

    handleModalClose();
  }

  /*********************************************************************/
  /* METODOS PRIVADOS                                                  */
  /*********************************************************************/
  function handleCreate() {
    /* do stuff */
    alert('criando');
  }

  function handleEdit() {
    /* do stuff */
    alert('editando');
  }

  return {
    isModalOpen, mode, modalTitle,
    newCategoryModalOpen, editCategoryModalOpen,
    handleModalClose,
    handleFormClick,
  }
}