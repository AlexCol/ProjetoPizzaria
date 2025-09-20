import Categoria from "@/models/Categoria";
import Produto from "@/models/Produto";
import fetchCategorias from "@/services/categoria/fetchCategorias";
import fetchProdutos from "@/services/produto/fetchProduto";

import { ChangeEvent, FormEvent, MouseEvent, useEffect, useState } from "react";
import { toast } from "react-toastify";

export default function useProduct() {
  const [image, setImage] = useState<File>();
  const [previewImage, setPreviewImage] = useState<string>('');
  const [produtos, setProdutos] = useState<Produto[]>([]);
  const [categorias, setCategorias] = useState<Categoria[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [mode, setMode] = useState<'edit' | 'create'>('create');
  const modalTitle = mode === 'create' ? 'Novo Produto' : 'Editar Produto';

  /*********************************************************************/
  /* METODOS PARA ABSTRAIR USE STATES                                  */
  /*********************************************************************/
  const handleModalClose = () => {
    setIsModalOpen(false);
  };

  const newProductModalOpen = () => {
    setIsModalOpen(true);
    setMode('create');
  }

  const editProductModalOpen = () => {
    setIsModalOpen(true);
    setMode('edit');
    //idRef.current = categoria.id;
    //ProductNamePendingRef.current = categoria.name;
  }

  const handleFile = (e: ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || !e.target.files[0])
      return;

    const imageHandled = e.target.files[0];
    if (imageHandled.type !== 'image/jpeg' && imageHandled.type !== 'image/png') {
      toast.error("Tipo de arquivo invalido!")
      e.target.value = ""; // limpa o input
      return;
    }

    setImage(imageHandled);
    setPreviewImage(URL.createObjectURL(imageHandled));
  }

  const clearImage = (e: MouseEvent<HTMLButtonElement>) => {
    if (previewImage)
      e.stopPropagation();
    setPreviewImage('');
  };

  const deleteProduct = async (id: number) => {
    alert('deletando');
    //const removed = await removeCategoria(id);
    //if (removed)
    //await getCategorias(); //pra atualizar a grid
  }

  /*********************************************************************/
  /* METODO CENTRALIZADOR DO CLICK EXTERNO (DO FORMULÁRIO)             */
  /*********************************************************************/
  function handleFormClick(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!previewImage) {
      toast.error("É preciso enviar uma imagem.")
      return;
    }

    if (mode === 'create')
      handleCreate();
    else if (mode === 'edit')
      handleEdit();

    handleModalClose();
    setPreviewImage('');
  }

  /*********************************************************************/
  /* METODOS PRIVADOS                                                  */
  /*********************************************************************/
  const getCategorias = async () => {
    const data = await fetchCategorias();
    setCategorias(data.categories);
  };

  const getProdutos = async () => {
    const data = await fetchProdutos();
    setProdutos(data.products);
  };

  const inicialFetch = async () => {
    await Promise.all([getProdutos(), getCategorias()]);
  }

  async function handleCreate() {
    alert('criando');
  }

  async function handleEdit() {
    alert('editando');
  }

  /*********************************************************************/
  /* USE EFFECTS                                                       */
  /*********************************************************************/
  useEffect(() => {
    inicialFetch();
  }, []);

  return {
    image, previewImage, handleFile, clearImage,
    produtos, categorias,
    handleFormClick,
    mode, isModalOpen, modalTitle, handleModalClose, newProductModalOpen, editProductModalOpen, deleteProduct
  }
};

export type useProductType = ReturnType<typeof useProduct>;