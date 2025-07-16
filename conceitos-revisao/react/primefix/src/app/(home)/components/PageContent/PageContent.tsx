import React from 'react'
import { pageContentStyles } from './pageContent.styles'
import { baseImageUrl } from '@/util/constants'
import Link from 'next/link'
import { Movie } from '@/model/Movie.model'

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

            <img
              className={pageContentStyles.filmeImagem}
              src={`${baseImageUrl}${filme.poster_path}`} alt={filme.title}
            />

            <Link className={pageContentStyles.filmeLink} href={`/filme/${filme.id}`}
            >
              Detalhes
            </Link>
          </article>
        ))}
      </div>
    </div>
  )
}

export default PageContent