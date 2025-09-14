'use client'

import Input from "@/components/singles/Input"
import Image from "next/image"
import { FiUploadCloud } from "react-icons/fi"
import productFormStyles from "./productFormStyles"
import useProductForm from "./useProductForm"

function ProductForm() {
  const states = useProductForm();

  return (
    <main className={productFormStyles.containerTC}>
      <h1 className={productFormStyles.titleTC}>Formulário</h1>

      <form className={productFormStyles.formTC}>
        <label className={productFormStyles.labelImageTC}>
          <span>
            <FiUploadCloud size={40} />
          </span>
          <Input
            type="file"
            accept="image/png, image/jpeg" //sugestão para o navegador sobre quais tipos de arquivo devem aparecer no seletor de arquivos
            required
            onChange={states.handleFile}
          />
          {states.previewImage && (
            <Image
              alt="Imagem de Preview"
              src={states.previewImage}
              className={productFormStyles.previewTC}
              fill={true}
              quality={100}
              priority={true}

            />
          )}
        </label>
      </form>
    </main>
  )
}

export default ProductForm