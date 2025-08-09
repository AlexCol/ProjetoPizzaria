import Link from 'next/link';
import React from 'react'

interface PessoaIdProp {
  params: {
    id: number;
  },
  searchParams: {
    [key: string]: string | string[];
  }
}

//http://localhost:3000/pessoas/56?nome=alexandre&sobrenome=coletti
async function PessoaId({ params, searchParams }: PessoaIdProp) { //!dessa forma o componente precisa ser SSR
  const { id } = params;
  const { nome, sobrenome } = searchParams;

  // const { id } = useParams(); //!dessa forma o componente precisa ser CSR
  await new Promise(resolve => setTimeout(resolve, 500));

  if (typeof id !== "number")
    return <Link href="/">Pessoa não encontrada</Link>;

  return (
    <>
      <div>PessoaId: {id}</div>
      <div>Nome: {nome}</div>
      <div>Sobrenome: {sobrenome}</div>
    </>
  )
}

export default PessoaId