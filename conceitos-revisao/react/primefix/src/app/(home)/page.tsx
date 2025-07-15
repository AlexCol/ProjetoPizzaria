'use client';

import Link from 'next/link';
import React, { use } from 'react'
import useHomeStates from './home.states';
import { homeStyles } from './home.styles';
import { baseImageUrl } from '@/util/constants';
import { Loading } from '@/components/loading/Loading';

function Home() {
  //const filmes = use(fetchFilmes());
  const { filmes, loading, currentPage, totalPages, fetchFilmes } = useHomeStates();

  if (loading) {
    return <Loading />; // Exibe o componente de loading enquanto os filmes estão sendo carregados
  }

  if (filmes)
    return (
      <>
        <div className='w-full flex justify-center items-center mt-4'>
          <button onClick={() => fetchFilmes(currentPage - 1)} disabled={currentPage === 1}>{'<--'}</button>
          <span>Pagina: {currentPage} de {totalPages}</span>
          <button onClick={() => fetchFilmes(currentPage + 1)} disabled={currentPage === totalPages}>{'-->'}</button>
        </div>

        <div className={homeStyles.container}>
          <div className={homeStyles.listaFilmes}>
            {filmes.map((filme) => (
              <article className={homeStyles.aticle} key={filme.id}>

                <strong
                  className={homeStyles.filmeTitulo}
                  title={`${filme.title}`}
                >
                  {filme.title}
                </strong>

                <img
                  className={homeStyles.filmeImagem}
                  src={`${baseImageUrl}${filme.poster_path}`} alt={filme.title}
                />

                <Link className={homeStyles.filmeLink} href={`/filme/${filme.id}`}
                >
                  Detalhes
                </Link>
              </article>
            ))}
          </div>
        </div>
      </>
    )
}

export default Home;