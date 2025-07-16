'use client';
import React, { useCallback, useMemo } from 'react'

function UseMemoUseCallback() {
  const [n1, setN1] = React.useState(0);
  const [n2, setN2] = React.useState(0);

  const soma = useCallback(() => {
    console.log('Calculating soma');
    return n1 + n2;
  }, [n1]);

  const soma2 = useMemo(() => {
    console.log('Calculating soma2');
    return n1 + n2;
  }, [n1]);

  return (
    <div className={favoritosStyles.container}>
      <h1 className={favoritosStyles.title}>Favoritos</h1>
      <p>Resultado da soma: {soma()}</p>
      <p>Resultado da soma2: {soma2}</p>
      <button onClick={() => setN1(n1 + 1)} className="bg-blue-300">Increase N1</button>
      <button onClick={() => setN2(n2 + 1)} className="bg-blue-300">Increase N2</button>
    </div>
  )
}

export default UseMemoUseCallback;

const containerTailwindClass = `
  flex 
  flex-col 
  items-center 
  justify-center 
  h-full
`;

const titleTailwindClass = `
  text-4xl 
  font-bold 
  mb-4
`;

const favoritosStyles = {
  container: containerTailwindClass,
  title: titleTailwindClass,
};