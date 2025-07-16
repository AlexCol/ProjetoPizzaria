import React, { FormEvent, RefObject } from 'react'
import { FiSkipBack, FiSkipForward } from 'react-icons/fi';
import { pageComandsStyles } from './pageComands.styles';

type PageComandsProps = {
  fetchFilmes: (page: number) => void;
  currentPage: number;
  totalPages: number;
}

function PageComands({ fetchFilmes, currentPage, totalPages }: PageComandsProps) {
  const pageSearchedRef = React.useRef<HTMLInputElement>(null) as RefObject<HTMLInputElement>;
  if (pageSearchedRef.current) pageSearchedRef.current.value = currentPage.toString();

  const backDisabled = currentPage === 1;
  const nextDisabled = currentPage === totalPages;

  const buttonFetch = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const page = parseInt(pageSearchedRef.current.value, 10);
    if (page === currentPage) return; // Se a página já for a atual, não faz nada
    if (page <= 0) return; // Se a página for menor ou igual a 0, não faz nada
    if (page > totalPages) return; // Se a página for maior que o total

    fetchFilmes(page);
  }

  return (
    <div className='w-full flex justify-center items-center mt-4'>
      <button
        onClick={() => fetchFilmes(currentPage - 1)}
        disabled={backDisabled}
        className={backDisabled ? pageComandsStyles.disabledArrow : pageComandsStyles.arrow}
      >
        <FiSkipBack />
      </button>

      <span className={pageComandsStyles.text}>
        Pagina: {currentPage} de {totalPages}
      </span>

      <button
        onClick={() => fetchFilmes(currentPage + 1)}
        disabled={nextDisabled}
        className={nextDisabled ? pageComandsStyles.disabledArrow : pageComandsStyles.arrow}
      >
        <FiSkipForward />
      </button>

      <form onSubmit={buttonFetch}>
        <span className={pageComandsStyles.text}>
          Selecionar pagina:
        </span>
        <input
          type="number"
          min="1"
          max={totalPages}
          ref={pageSearchedRef}
          defaultValue={currentPage}
          className="w-16 text-center border border-purple-300 rounded-md p-1"
        />
        <input
          type="submit"
          className="ml-2 bg-purple-500 text-white px-3 py-1 rounded-md hover:bg-purple-600 transition-colors"
          value="Ir"
        />
      </form>
    </div >
  )
}

export default PageComands