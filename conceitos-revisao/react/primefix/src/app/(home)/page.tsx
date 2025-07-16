'use client';

import React from 'react'
import useHomeStates from './home.states';
import { Loading } from '@/components/loading/Loading';
import PageComands from './components/PageComands/PageComands';
import PageContent from './components/PageContent/PageContent';

function Home() {
  const { filmes, loading, currentPage, totalPages, fetchFilmes } = useHomeStates();

  if (loading) {
    return <Loading />;
  }

  if (filmes)
    return (
      <>
        <PageContent filmes={filmes} />
        <PageComands fetchFilmes={fetchFilmes} currentPage={currentPage} totalPages={totalPages} />
      </>
    )
}

export default Home;