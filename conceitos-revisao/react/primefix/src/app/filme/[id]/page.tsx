'use client';

import { useParams } from 'next/navigation';
import React from 'react'

function Filme() {
  const { id } = useParams();

  return (
    <div>
      <h1 className="text-2xl font-bold">Filme Page {id}</h1>
      <p>Details about the movie will go here.</p>
    </div>
  )
}

export default Filme