'use client';

import { useDarkModeValue } from '@/contexts/darkMode/DarkModeContext';
import React from 'react'

function Header() {
  const { isDarkMode, toggleDarkMode } = useDarkModeValue();
  return (
    <header className={headerTailwindClass}>
      <p>navbar?</p>
      <button className={buttonTailwindClass} onClick={toggleDarkMode}>
        {isDarkMode ? '🌕' : '☀️'}
      </button>
    </header>
  )
}

export default Header;

const headerTailwindClass = `
  h-16
  flex
  items-center
  justify-between
  px-4
  bg-purple-200
  dark:bg-purple-800
  text-purple-700
  dark:text-purple-300
  transition-colors
  duration-300
`;

const buttonTailwindClass = `
  px-4
  py-2
  pb-[10px]
  flex
  items-center
  justify-center
  bg-blue-500
  text-white
  rounded-full
  hover:bg-blue-600
  dark:bg-blue-700
  dark:hover:bg-blue-800
  transition-colors
  duration-300
  active:bg-blue-200
  dark:active:bg-blue-300  
`;