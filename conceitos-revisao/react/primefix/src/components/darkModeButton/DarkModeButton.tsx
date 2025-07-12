import { useDarkModeValue } from '@/contexts/darkMode/DarkModeContext';
import React from 'react'

function DarkModeButton() {
  const { isDarkMode, toggleDarkMode } = useDarkModeValue();
  return (
    <button className={darkModeButtonTailwindClass} onClick={toggleDarkMode}>
      {isDarkMode ? '🌕' : '☀️'}
    </button>
  )
}

export default DarkModeButton;

const darkModeButtonTailwindClass = `
  px-4 
  py-2 
  rounded-full 
  bg-blue-500 
  text-white
  hover:bg-blue-600 
  transition 
  shadow-md 
  hover:shadow-lg 
  active:shadow-sm
  active:translate-y-[1px]
`;