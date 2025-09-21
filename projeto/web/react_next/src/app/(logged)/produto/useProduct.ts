import Categoria from "@/models/Categoria";
import Produto from "@/models/Produto";
import fetchCategorias from "@/services/categoria/fetchCategorias";
import createProduto from "@/services/produto/createProduto";
import deleteProduto from "@/services/produto/deleteProduto";
import editProduto from "@/services/produto/editProduto";
import fetchProdutos from "@/services/produto/fetchProduto";
import fetchProdutoImage from "@/services/produto/fetchProdutoImage";
import { ChangeEvent, FormEvent, MouseEvent, RefObject, useEffect, useRef, useState } from "react";
import { toast } from "react-toastify";

export default function useProduct() {
  const idRef = useRef<number | undefined>(undefined);
  const produtoNamePendingRef = useRef<string>('');
  const produtoNameRef = useRef<HTMLInputElement>(null) as RefObject<HTMLInputElement>;
  const produtoPricePendingRef = useRef<string>('');
  const produtoPriceRef = useRef<HTMLInputElement>(null) as RefObject<HTMLInputElement>;
  const produtoCategoryIdPendingRef = useRef<number>(0);
  const produtoCategoryIdRef = useRef<HTMLSelectElement>(null) as RefObject<HTMLSelectElement>;
  const produtoDescriptionPendingRef = useRef<string>('');
  const produtoDescriptionRef = useRef<HTMLTextAreaElement>(null) as RefObject<HTMLTextAreaElement>;
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
    idRef.current = undefined;
    setIsModalOpen(true);
    setMode('create');
  }

  const editProductModalOpen = async (produto: Produto) => {
    const banner = await fetchProdutoImage(produto.id);
    setImage(undefined);
    setPreviewImage(`data:image/jpeg;base64,${banner}`);

    setIsModalOpen(true);
    setMode('edit');
    idRef.current = produto.id;
    produtoNamePendingRef.current = produto.name;
    produtoPricePendingRef.current = produto.price;
    produtoCategoryIdPendingRef.current = produto.categoryId;
    produtoDescriptionPendingRef.current = produto.description;
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
    //if (previewImage)
    //e.stopPropagation();
    clearImageStates();
  };

  const handleDelete = async (id: number) => {
    const removed = await deleteProduto(id);
    if (removed)
      await getProdutos(); //pra atualizar a grid
  }

  /*********************************************************************/
  /* METODO CENTRALIZADOR DO CLICK EXTERNO (DO FORMULÁRIO)             */
  /*********************************************************************/
  async function handleFormClick(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!previewImage) {
      toast.error("É preciso enviar uma imagem.")
      return;
    }

    const produto = {} as Produto;
    if (idRef.current)
      produto.id = idRef.current;
    produto.name = produtoNameRef.current.value;
    produto.price = produtoPriceRef.current.value;
    produto.categoryId = Number(produtoCategoryIdRef.current.value);
    produto.description = produtoDescriptionRef.current.value;
    if (image)
      produto.banner = image;

    let processed = false;
    if (mode === 'create')
      processed = await createProduto(produto);
    else if (mode === 'edit')
      processed = await editProduto(produto);

    if (processed)
      getProdutos();

    handleModalClose();
    clearImageStates();
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

  const clearImageStates = () => {
    setPreviewImage('');
    setImage(undefined);
  }

  /*********************************************************************/
  /* USE EFFECTS                                                       */
  /*********************************************************************/
  useEffect(() => {
    inicialFetch();
  }, []);

  useEffect(() => {
    if (isModalOpen && mode === 'edit') {
      if (produtoNameRef.current)
        produtoNameRef.current.value = produtoNamePendingRef.current;
      if (produtoPriceRef.current)
        produtoPriceRef.current.value = produtoPricePendingRef.current;
      if (produtoCategoryIdRef.current)
        produtoCategoryIdRef.current.value = produtoCategoryIdPendingRef.current.toString();
      if (produtoDescriptionRef.current)
        produtoDescriptionRef.current.value = produtoDescriptionPendingRef.current;
    }

    if (!isModalOpen) {
      clearImageStates();
    }
  }, [isModalOpen, mode]);

  return {
    image, previewImage, handleFile, clearImage,
    produtos, categorias,
    produtoNameRef, produtoPriceRef, produtoCategoryIdRef, produtoDescriptionRef,
    handleFormClick,
    mode, isModalOpen, modalTitle, handleModalClose, newProductModalOpen, editProductModalOpen, handleDelete
  }
};

export type useProductType = ReturnType<typeof useProduct>;