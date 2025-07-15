'use client';

import { useParams } from 'next/navigation';
import React from 'react'
import useFilmesStates from './filmes.states';

function Filme() {
  const states = useFilmesStates();

  if (states.loading) {
    return <div className="h-full flex justify-center items-center">Carregando...</div>;
  }

  if (states.movieDetails)
    return (
      <div>
        <h1 className="text-2xl font-bold">Filme Page {states.id}</h1>
        <p>Details about the movie will go here.</p>
        <p>{states.movieDetails?.original_title}</p>
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