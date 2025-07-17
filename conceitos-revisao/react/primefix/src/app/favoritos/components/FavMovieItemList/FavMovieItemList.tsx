import React from 'react'
import Link from 'next/link';
import { favMovieItemListStyles } from './favMovieItemList.styles';

type FavMovieItemListProps = {
  movie: FavMovie;
  handleRemove: (id: number) => void;
};

function FavMovieItemList({ movie, handleRemove }: FavMovieItemListProps) {

  return (
    <li key={movie.id} className={favMovieItemListStyles.item}>
      <span className={favMovieItemListStyles.title}>{movie.title}</span>
      <div className={favMovieItemListStyles.actions}>
        <Link href={`/filme/${movie.id}`} className={favMovieItemListStyles.detailsLink}>
          Detalhes
        </Link>
        <button onClick={() => handleRemove(movie.id)} className={favMovieItemListStyles.removeButton}>
          Remover
        </button>
      </div>
    </li>
  )
}

export default FavMovieItemList;