'use client';
import React, { useState } from 'react'
import favoritosStyles from './favoritos.styles'
import FavMovieItemList from './components/FavMovieItemList/FavMovieItemList';
import useFavoritosStates from './favoritos.states';
import { Modal } from '@/components/ModalBase/Modal';
import ConfirmRemoveModal from './components/ConfirmRemoveModal/ConfirmRemoveModal';

function Favoritos() {
  const { favMovies, isModalOpen, idToRemove, handleRemove, handleConfirmRemove, handleClose } = useFavoritosStates();

  return (
    <div className={favoritosStyles.container}>
      <h1 className={favoritosStyles.title}>Meus Filmes</h1>
      <ul className={favoritosStyles.list}>
        {favMovies.map((filme) => <FavMovieItemList key={filme.id} movie={filme} handleRemove={handleConfirmRemove} />)}
      </ul>

      <Modal isOpen={isModalOpen} onClose={handleClose} className={favoritosStyles.modalInner}>
        <ConfirmRemoveModal
          isOpen={isModalOpen}
          handleClose={handleClose}
          handleConfirm={() => handleConfirmRemove(idToRemove)}
          handleRemove={() => handleRemove(idToRemove)}
        />
      </Modal>

    </div>
  )
}

export default Favoritos