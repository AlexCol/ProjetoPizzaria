'use client';
import FuzzyText from '@/components/fuzzyText/FuzzyText'
import { useDarkModeValue } from '@/contexts/darkMode/DarkModeContext'
import React from 'react'

function Teste() {
  const { isDarkMode } = useDarkModeValue();
  return (
    <div className='flex flex-col items-center justify-center h-screen'>
      <FuzzyText
        baseIntensity={0.2}
        hoverIntensity={0.5}
        enableHover={true}
        //fontSize={60}
        fontWeight="bold"
        color={isDarkMode ? "#fff" : "#000"}>
        Teste
      </FuzzyText>
    </div>
  )
}

export default Teste