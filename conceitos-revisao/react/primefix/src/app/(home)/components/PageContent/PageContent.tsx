'use client';
import React, { useMemo, useState } from 'react';
import { pageContentStyles } from './pageContent.styles';
import { baseImageUrl } from '@/util/constants';
import Link from 'next/link';
import { Movie } from '@/model/Movie.model';
import { FaStar } from 'react-icons/fa'
import { getSavedMovies, removeMovie, saveMovie } from '@/services/saveMovie';

type PageContentProps = {
  filmes: Movie[];
}

function PageContent({ filmes }: PageContentProps) {
  const [clickedMovie, setClickedMovie] = useState<boolean>(false);
  const filmesSalvos = useMemo(() => getSavedMovies(), [clickedMovie]);

  const handleFavoredClick = (movieId: number, movieTitle: string) => {
    const isFavored = filmesSalvos.some(filme => filme.id === movieId);
    if (isFavored) {
      removeMovie(movieId);
    } else {
      saveMovie(movieId, movieTitle);
    }
    setClickedMovie(!clickedMovie);
  };

  return (
    <div className={pageContentStyles.container}>
      <div className={pageContentStyles.listaFilmes}>
        {filmes.map((filme) => {
          const isFavored = filmesSalvos.some(filmeSalvo => filmeSalvo.id === filme.id);
          const starClass = isFavored ? pageContentStyles.starFavored : pageContentStyles.starNotFavored;
          return (
            <article className={pageContentStyles.aticle} key={filme.id}>
              <strong
                className={pageContentStyles.filmeTitulo}
                title={`${filme.title}`}
              >
                {filme.title}
              </strong>

              <div className='flex-1 relative'>
                <img
                  className={pageContentStyles.filmeImagem}
                  src={`${baseImageUrl}${filme.poster_path}`} alt={filme.title}
                />
                <FaStar
                  className={starClass}
                  onClick={() => handleFavoredClick(filme.id, filme.title)}
                />
              </div>

              <Link className={pageContentStyles.filmeLink} href={`/filme/${filme.id}`}>
                Detalhes
              </Link>
            </article>
          )
        })}
      </div>
    </div>
  )
}

export default PageContent