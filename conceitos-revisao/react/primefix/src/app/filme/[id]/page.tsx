'use client';

import React from 'react'
import useFilmesStates from './filmes.states';
import { filmesStyles } from './filmes.styles';
import { baseImageUrl } from '@/util/constants';
import Link from 'next/link';
import { Modal } from '@/components/ModalBase/Modal';
import ConfirmModal from './components/ConfirmModal/ConfirmModal';

function Filme() {
  const { movieDetails, loading, handleSave, isModalOpen, handleModalClose, mensagem } = useFilmesStates();

  if (loading) {
    return <div className={filmesStyles.filmeInfo}>Carregando...</div>;
  }

  if (movieDetails)
    return (
      <div className={filmesStyles.filmeInfo}>
        {/* viraria um componente - mas não fiz pra terminar logo */}
        <h1 className={filmesStyles.title}>{movieDetails.title}</h1>
        <img
          className={filmesStyles.img}
          src={`${baseImageUrl}${movieDetails.backdrop_path}`}
          alt={movieDetails.title}
        />

        <h3 className={filmesStyles.overviewTitle}>Sinopse:</h3>
        <span className={filmesStyles.overview}>{movieDetails.overview}</span>
        <strong className={filmesStyles.rating}>Avaliação: {movieDetails.vote_average.toFixed(2)} / 10</strong>

        {/* viraria um componente - mas não fiz pra terminar logo */}
        <div className={filmesStyles.buttonsArea}>
          <button className={filmesStyles.buttonSalvar} onClick={handleSave}>Salvar</button>

          <Link
            className={filmesStyles.buttonTrailer}
            href={`https://www.youtube.com/results?search_query=${movieDetails.title} trailer`}
            target="_blank" // Abre em nova aba
            rel="external"
          >
            Trailer
          </Link>
        </div>

        <Modal
          isOpen={isModalOpen}
          onClose={handleModalClose}
          className="bg-white p-6 rounded-lg shadow-lg max-w-md w-full"
        >
          <ConfirmModal
            handleClose={handleModalClose}
            mensagem={mensagem}
          />
        </Modal>
      </div>
    )
}

export default Filme

//! tratativa para tornar um componente de página assíncrono e ainda receber parametros
/*
type FilmeProps = {
  params: { id: string; };
};

export default async function Filme({ params }: FilmeProps) {
  //await new Promise(resolve => setTimeout(resolve, 1500)); // Simulating data fetching delay
  const { id } = await Promise.resolve(params); // Simulating async params fetching

  // Se quiser simular carregamento:
  // await new Promise(resolve => setTimeout(resolve, 1000));

  return (
    <div>
      <h1 className="text-2xl font-bold">Filme Page {id}</h1>
      <p>Details about the movie will go here.</p>
    </div>
  );
}

*/