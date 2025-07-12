import { useDarkModeValue } from '@/contexts/darkMode/DarkModeContext';
import Link from 'next/link';
import React from 'react'

async function Home() {
  //await new Promise(resolve => setTimeout(resolve, 1000)); // Simulating data fetching delay
  return (
    <div>
      <h1 className="text-2xl font-bold">Home Page</h1>
      <p>Welcome to the home page!</p>
      <Link href="/filme/1" className="text-blue-500 hover:underline">
        Go to Filme Page
      </Link>
    </div>
  )
}

export default Home;