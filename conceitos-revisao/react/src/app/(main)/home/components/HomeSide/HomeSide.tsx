'use client';

import React from 'react'
import homeSideStyles from './homeSide.styles'
import { HomeStates } from '../../home.states'

type HomeSideProps = {
  homeStates: HomeStates
}

function HomeSide({ homeStates }: HomeSideProps) {
  const { menuHidden } = homeStates;
  return (
    <>
      {!menuHidden && (
        <div className={homeSideStyles.container}>
          HomeSide
        </div>
      )}
    </>
  )
}

export default HomeSide