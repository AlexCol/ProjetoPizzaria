
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

// 'use client';

// import { useParams } from 'next/navigation';
// import React from 'react'

// function Filme() {
//   //await new Promise(resolve => setTimeout(resolve, 1000)); // Simulating data fetching delay
//   const { id } = useParams();

//   return (
//     <div>
//       <h1 className="text-2xl font-bold">Filme Page {id}</h1>
//       <p>Details about the movie will go here.</p>
//     </div>
//   )
// }

// export default Filme