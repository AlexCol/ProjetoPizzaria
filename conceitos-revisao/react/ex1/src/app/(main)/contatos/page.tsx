import React from 'react'
import BotaoComAcao from './components/BotaoComAcao';

async function Contatos() {
  //await new Promise(resolve => setTimeout(resolve, 2000));
  const posts = await fetch('https://jsonplaceholder.typicode.com/posts');
  const data = await posts.json();
  return (

    <div className='
      flex 
      flex-col 
      items-center 
      justify-start
      h-screen 
      w-full 
      break-words 
      overflow-x-auto'>

      <BotaoComAcao />
      <h1 className='text-4xl font-bold text-amber-300'>Contatos</h1>
      <ul>
        {data.map((post: { id: number; title: string }) => (
          <li key={post.id}>{post.title}</li>
        ))}
      </ul>

    </div>
  )
}

export default Contatos