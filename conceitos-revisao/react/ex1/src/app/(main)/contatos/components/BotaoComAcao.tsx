'use client';
import React, { useEffect } from 'react'

function BotaoComAcao() {
  const [counter, setCounter] = React.useState(0);

  return (
    <button
      className='
        bg-blue-500
        hover:bg-blue-700
        text-white
        font-bold
        py-2
        px-4
        rounded'
      onClick={() => setCounter(counter + 1)}>
      Clique para incrementar: {counter}-
    </button>
  )
}

export default BotaoComAcao