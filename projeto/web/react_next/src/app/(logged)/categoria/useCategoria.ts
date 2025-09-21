import Categoria from "@/models/Categoria";
import { FormEvent, RefObject, useEffect, useRef, useState } from "react";

import deleteCategoria from "@/services/categoria/deleteCategoria";
import createCategoria from "../../../services/categoria/createCategoria";
import editCategoria from "../../../services/categoria/editCategoria";
import fetchCategorias from "../../../services/categoria/fetchCategorias";

export default function useCategoria() {
  const idRef = useRef<number>(0);
  const categoryNamePendingRef = useRef<string>('');
  const categoryNameRef = useRef<HTMLInputElement>(null) as RefObject<HTMLInputElement>;
  const [categorias, setCategorias] = useState<Categoria[]>([]);
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

  const editCategoryModalOpen = (categoria: Categoria) => {
    setIsModalOpen(true);
    setMode('edit');
    idRef.current = categoria.id;
    categoryNamePendingRef.current = categoria.name;
  }

  const getCategorias = async () => {
    const data = await fetchCategorias();
    setCategorias(data.categories);
  }

  const handleDelete = async (id: number) => {
    const removed = await deleteCategoria(id);
    if (removed)
      await getCategorias(); //pra atualizar a grid
  }

  /*********************************************************************/
  /* METODO CENTRALIZADOR DO CLICK EXTERNO (DO FORMULÁRIO)             */
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
  async function handleCreate() {
    const name = categoryNameRef.current.value;
    const created = await createCategoria(name);
    if (created)
      await getCategorias(); //pra atualizar a grid
  }

  async function handleEdit() {
    const id = idRef.current;
    const name = categoryNameRef.current.value;
    const updated = await editCategoria(id, name);
    if (updated)
      await getCategorias(); //pra atualizar a grid
  }

  /*********************************************************************/
  /* USE EFFECTS                                                       */
  /*********************************************************************/
  useEffect(() => {
    getCategorias();
  }, []);

  useEffect(() => {
    if (isModalOpen && mode === 'edit' && categoryNameRef.current) {
      categoryNameRef.current.value = categoryNamePendingRef.current;
    }
  }, [isModalOpen, mode]);

  /*********************************************************************/
  /* RETURN                                                            */
  /*********************************************************************/
  return {
    isModalOpen, mode, modalTitle,
    newCategoryModalOpen, editCategoryModalOpen, handleDelete,
    handleModalClose,
    handleFormClick,
    categoryNameRef,
    categorias, getCategorias,
  }
}
export type useCategoriaType = ReturnType<typeof useCategoria>;