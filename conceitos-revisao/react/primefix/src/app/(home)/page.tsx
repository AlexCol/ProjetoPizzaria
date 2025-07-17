'use client';

import React from 'react'
import useHomeStates from './home.states';
import { Loading } from '@/components/loading/Loading';
import PageComands from './components/PageComands/PageComands';
import PageContent from './components/PageContent/PageContent';
import { homeStyles } from './home.styles';

function Home() {
  const { filmes, loading, currentPage, totalPages, fetchFilmes } = useHomeStates();

  // if (loading) {
  //   return <Loading />;
  // }

  if (filmes)
    return (
      <div className={homeStyles.container}>
        <div className={homeStyles.content}>
          {loading ? (
            <Loading />
          ) : (
            <PageContent filmes={filmes} />
          )}
        </div>
        <PageComands fetchFilmes={fetchFilmes} currentPage={currentPage} totalPages={totalPages} />
      </div>
    )
}

export default Home;

