import React from 'react'

/*
pra isso ser usado automaticamente pelo Next, a page.tsx do mesmo nivel da loading.tsx precisa ser async 
e ter uma chamada com await, assim Loading.tsx será automaticamente usada enquanto a page.tsx estiver carregando.
o componente page.tsx PRECISA SER SERVER SIDE, ou seja, não pode ser 'use client';

paginas na mesma arvore de diretórios que tenham loading.tsx serão automaticamente carregadas com o componente Loading

! para componentes que usem 'params', ver Page Filme, é necessária uma 'gambiarra'
*/

function Loading() {
  return (
    <div>loading</div>
  )
}

export default Loading