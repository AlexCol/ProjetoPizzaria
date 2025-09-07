import Button from "@/components/singles/Button";
import Input from "@/components/singles/Input";
import { FormEvent } from "react";
import categoriaModalStyles from "./categoriaModal.styles";

type categoriaModalProps = {
  title: string,
  onClick: (e: FormEvent<HTMLFormElement>) => void,
  onCancel: () => void,
}

function CategoriaModal(props: categoriaModalProps) {
  return (
    <>
      <h1 className={categoriaModalStyles.title}>{props.title}</h1>
      <form className={categoriaModalStyles.form} onSubmit={props.onClick}>
        <Input
          type="text"
          name="name"
          placeholder="Nome da Categoria, ex: Pizzas"
          required
        />
        <div className={categoriaModalStyles.buttonGroup}>
          <div className="w-3/10">
            <Button label="Salvar" type="submit" buttonType="Green" />
          </div>
          <div className="w-3/10">
            <Button label="Cancelar" buttonType="Red" type="button" onClick={props.onCancel} />
          </div>
        </div>
      </form>
    </>
  )
}

export default CategoriaModal