import React from 'react'

function Footer() {
  return (
    <footer className={footerTailwindClass}>
      <p>footer?</p>
    </footer>
  )
}

export default Footer;

const footerTailwindClass = `
  h-16
  flex
  items-center
  justify-center
  bg-gray-200
  dark:bg-gray-800
  text-gray-700
  dark:text-gray-300
  transition-colors
  duration-300
`;