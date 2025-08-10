import React from 'react'

function Footer() {
  return (
    <footer className={footerTailwindClass}>
      <p>© 2023 Pizzaria Coletti</p>
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
`;