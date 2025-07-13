'use client';

import Link from 'next/link';
import React, { use } from 'react'
import useHomeStates from './home.states';
import { homeStyles } from './home.styles';
import { baseImageUrl } from '@/util/constants';
import { Loading } from '@/components/loading/Loading';

function Home() {
  //const filmes = use(fetchFilmes());
  const { filmes, loading } = useHomeStates();

  if (loading) {
    return <Loading />; // Exibe o componente de loading enquanto os filmes estão sendo carregados
  }

  return (
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
  )
}

export default Home;