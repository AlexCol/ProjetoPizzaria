import Categoria from "@/models/Categoria";
import { FormEvent, RefObject, useEffect, useRef, useState } from "react";

import { toast } from "react-toastify";
import createCategoria from "./functions/createCategoria";
import removeCategoria from "./functions/deleteCategoria";
import editCategoria from "./functions/editCategoria";
import fetchCategorias from "./functions/fetchCategorias";

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
    console.log(categoryNameRef.current);
    categoryNamePendingRef.current = categoria.name;
  }

  const getCategorias = async () => {
    try {
      const data = await fetchCategorias();
      setCategorias(data.categories);
    } catch (err) {
      if (err instanceof Error) {
        toast.error(err.message);
      } else {
        toast.error('Erro. Tente novamente mais tarde.')
      }
    }
  }

  const deleteCategoria = async (id: number) => {
    try {
      await removeCategoria(id);
      await getCategorias(); //pra atualizar a grid
      toast.success('Registro deletado com sucesso!');
    } catch (err) {
      if (err instanceof Error) {
        toast.error(err.message);
      } else {
        toast.error('Erro. Tente novamente mais tarde.')
      }
    }
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
  async function handleCreate() {
    const name = categoryNameRef.current.value;
    if (!name) {
      toast.error('Nome não informado.')
      return;
    }

    try {
      await createCategoria(name);
      await getCategorias(); //pra atualizar a grid
      toast.success('Registro criado com sucesso!');
    } catch (err) {
      if (err instanceof Error) {
        toast.error(err.message);
      } else {
        toast.error('Erro. Tente novamente mais tarde.')
      }
    }
  }

  async function handleEdit() {
    /* do stuff */
    const id = idRef.current;
    const name = categoryNameRef.current.value;
    if (!id || !name) {
      toast.error('Erro ao processar registro, tente novamente mais tarde.')
      return;
    }

    try {
      await editCategoria(id, name);
      await getCategorias(); //pra atualizar a grid
      toast.success('Registro alterado com sucesso!');
    } catch (err) {
      if (err instanceof Error) {
        toast.error(err.message);
      } else {
        toast.error('Erro. Tente novamente mais tarde.')
      }
    }
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
    newCategoryModalOpen, editCategoryModalOpen, deleteCategoria,
    handleModalClose,
    handleFormClick,
    categoryNameRef,
    categorias, getCategorias,
  }
}
export type useCategoriaType = ReturnType<typeof useCategoria>;