import Categoria from '@/models/Categoria';
import categoriaItemStyles from './categoriaItem.styles';

type CategoriaItemProps = {
  categoria: Categoria,
  editarClick: (categoria: Categoria) => void,
  deletarClick: (id: number) => void
}

function CategoriaItem({ categoria, editarClick, deletarClick }: CategoriaItemProps) {
  return (
    <div className={categoriaItemStyles.containerTC}>
      <div className={categoriaItemStyles.labelBoxTC}>
        <div className={categoriaItemStyles.labelTC}>
          {categoria.name}
        </div>
      </div>

      <div className={categoriaItemStyles.buttonGroupTC}>
        <button
          type="button"
          onClick={() => editarClick(categoria)}
          className={categoriaItemStyles.editButtonTC}
        >
          Editar
        </button>

        <button
          type="button"
          onClick={() => deletarClick(categoria.id)}
          className={categoriaItemStyles.deleteButtonTC}
        >
          Excluir
        </button>
      </div>
    </div>
  )
}

export default CategoriaItem;

