'use client';
import React, { use, useEffect } from 'react'
import favoritosStyles from './favorito.styles'
import { getSavedMovies, removeMovie } from '@/services/saveMovie';
import FavMovieItemList from './components/FavMovieItemList/FavMovieItemList';

function Favoritos() {
  const [favMovies, setFavMovies] = React.useState<FavMovies>([]);

  useEffect(() => {
    const savedMovies = getSavedMovies();
    setFavMovies(savedMovies);
  }, []);

  const handleRemove = (id: number) => {
    removeMovie(id);
    setFavMovies(prevMovies => prevMovies.filter(movie => movie.id !== id));
  };

  return (
    <div className={favoritosStyles.container}>
      <h1 className={favoritosStyles.title}>Meus Filmes</h1>
      <ul className={favoritosStyles.list}>
        {favMovies.map((filme) => <FavMovieItemList key={filme.id} movie={filme} handleRemove={handleRemove} />)}
      </ul>
    </div>
  )
}

export default Favoritos