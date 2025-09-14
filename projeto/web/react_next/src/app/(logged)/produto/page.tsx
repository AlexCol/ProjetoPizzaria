import Link from "next/link"
import ProductForm from "./components/ProductForm"

function Produto() {
  return (
    <>
      <ProductForm />
      <Link href={'/'}>Voltar</Link>
    </>
  )
}

export default Produto