'use client'

import FormImage from "../FormImage"
import productFormStyles from "./productFormStyles"
import useProductForm from "./useProductForm"

function ProductForm() {
  const states = useProductForm();

  return (
    <main className={productFormStyles.containerTC}>
      <h1 className={productFormStyles.titleTC}>Formulário</h1>

      <form className={productFormStyles.formTC}>
        <FormImage states={states} />
      </form>
    </main>
  )
}

export default ProductForm