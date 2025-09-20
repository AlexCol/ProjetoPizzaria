import Button from '@/components/singles/Button'
import Input from '@/components/singles/Input'
import { useProductType } from '../../useProduct'
import FormImage from '../FormImage'
import productModalStyles from './productModalStyles'

type ProductModalProps = {
  states: useProductType
}

function ProductModal({ states }: ProductModalProps) {
  return (
    <>
      <h1 className={productModalStyles.titleTC}>{states.modalTitle}</h1>
      <form className={productModalStyles.formTC} onSubmit={states.handleFormClick}>
        <FormImage states={states} />

        <select name="category" className={productModalStyles.selectTC}>
          {states.categorias?.length > 0 && (
            states.categorias.map(categoria => (
              <option key={categoria.id} value={categoria.id}>
                {categoria.name}
              </option>
            ))
          )}
        </select>

        <Input
          type="text"
          name="name"
          placeholder="Digite o nome do produto."
          required
        />

        <Input
          type="number"
          name="price"
          placeholder="Preço do produto."
          required
          className="no-spinner" //classe customizada, em global.css
        />

        <textarea
          className={productModalStyles.textAreaTC}
          placeholder="Digite a descrição do produto."
          required
          name="description"
        ></textarea>

        <div className={productModalStyles.buttonGroupTC}>
          <div className="w-3/10">
            <Button label="Salvar" type="submit" buttonType="Green" />
          </div>
          <div className="w-3/10">
            <Button label="Cancelar" buttonType='Red' type="button" onClick={states.handleModalClose} />
          </div>
        </div>
      </form>
    </>
  )
}

export default ProductModal