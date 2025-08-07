import React from 'react'
import navBarStyles from './navBar.styles'
import Link from 'next/link'

function NavBar() {
  return (
    <div className={navBarStyles.container}>
      <h1 className={navBarStyles.title}>Pizzaria</h1>
      <nav className={navBarStyles.nav}>
        <ul className={navBarStyles.navList}>
          <li className={navBarStyles.navItem}>
            <Link href="/">Home</Link>
          </li>
          <li className={navBarStyles.navItem}>
            <Link href="/sobre">About</Link>
          </li>
          <li className={navBarStyles.navItem}>
            <Link href="/contatos">Contact</Link>
          </li>
        </ul>
      </nav>
    </div>
  )
}

export default NavBar