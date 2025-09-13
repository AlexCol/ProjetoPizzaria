import Button from "@/components/singles/Button";
import Input from "@/components/singles/Input";
import { useCategoriaType } from "../../useCategoria";
import categoriaModalStyles from "./categoriaModal.styles";

type categoriaModalProps = {
  states: useCategoriaType
}

function CategoriaModal({ states }: categoriaModalProps) {
  return (
    <>
      <h1 className={categoriaModalStyles.title}>{states.modalTitle}</h1>
      <form className={categoriaModalStyles.form} onSubmit={states.handleFormClick}>
        <Input
          type="text"
          name="name"
          placeholder="Nome da Categoria, ex: Pizzas"
          ref={states.categoryNameRef}
          required
        />
        <div className={categoriaModalStyles.buttonGroup}>
          <div className="w-3/10">
            <Button label="Salvar" type="submit" buttonType="Green" />
          </div>
          <div className="w-3/10">
            <Button label="Cancelar" buttonType="Red" type="button" onClick={states.handleModalClose} />
          </div>
        </div>
      </form>
    </>
  )
}

export default CategoriaModal