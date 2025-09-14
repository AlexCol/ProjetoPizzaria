import { ChangeEvent, useState } from "react";
import { toast } from "react-toastify";

export default function useProductForm() {
  const [image, setImage] = useState<File>();
  const [previewImage, setPreviewImage] = useState<string>('');

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

  return {
    image, previewImage,
    handleFile,
  }
};

export type useProductForm = ReturnType<typeof useProductForm>;