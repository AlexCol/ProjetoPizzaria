'use client';
import React from 'react'
import favoritosStyles from './favoritos.styles'
import FavMovieItemList from './components/FavMovieItemList/FavMovieItemList';
import useFavoritosStates from './favoritos.states';

function Favoritos() {
  const { favMovies, handleRemove } = useFavoritosStates();

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