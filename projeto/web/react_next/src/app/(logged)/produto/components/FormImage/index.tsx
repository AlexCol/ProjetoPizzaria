import Input from "@/components/singles/Input"
import Image from "next/image"
import { CgClose } from "react-icons/cg"
import { FiUploadCloud } from "react-icons/fi"
import { useProductFormType } from "../../useProduct"
import imageFormStyles from "./imageFormStyles"

type FormImageProps = {
  states: useProductFormType
}

function FormImage({ states }: FormImageProps) {
  return (
    <div className="relative">
      <label className={imageFormStyles.labelImageTC}>
        <span className={imageFormStyles.spanTC}>
          <FiUploadCloud size={40} />
        </span>
        <Input
          type="file"
          name="file"
          accept="image/png, image/jpeg" //sugestão para o navegador sobre quais tipos de arquivo devem aparecer no seletor de arquivos
          onChange={states.handleFile}
          className="hidden"
        />
        {states.previewImage && (
          <Image
            alt="Imagem de Preview"
            src={states.previewImage}
            className={imageFormStyles.previewTC}
            fill={true}
            quality={100}
            priority={true}
          />
        )}
      </label>

      {states.previewImage && (
        <button
          type="button"
          onClick={states.clearImage}
          className={imageFormStyles.clearTC}
        >
          <CgClose size={20} className="font-bold" />
        </button>
      )}
    </div>
  )
}

export default FormImage