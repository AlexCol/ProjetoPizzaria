import React from 'react';
import { pageContentStyles } from './pageContent.styles';
import { baseImageUrl } from '@/util/constants';
import Link from 'next/link';
import { Movie } from '@/model/Movie.model';
import { FaStar } from 'react-icons/fa'

type PageContentProps = {
  filmes: Movie[];
}

function PageContent({ filmes }: PageContentProps) {
  return (
    <div className={pageContentStyles.container}>
      <div className={pageContentStyles.listaFilmes}>
        {filmes.map((filme) => (
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
              <FaStar className="absolute top-2 right-2 text-yellow-400" />
              https://chatgpt.com/c/6878e323-6674-8004-92e2-f877ee901501
            </div>

            <Link className={pageContentStyles.filmeLink} href={`/filme/${filme.id}`}>
              Detalhes
            </Link>
          </article>
        ))}
      </div>
    </div>
  )
}

export default PageContent