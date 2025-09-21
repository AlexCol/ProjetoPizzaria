type Produto = {
  id: number,
  name: string,
  price: string,
  banner?: File,
  description: string,
  categoryId: number,
  criadoEm?: string,
  atualizadoEm?: string,
}
export default Produto;