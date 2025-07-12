import React from 'react'
import { headerStyles } from './header.styles';
import DarkModeButton from '@/components/darkModeButton/DarkModeButton';
import Link from 'next/link';

function Header() {

  return (
    <header className={headerStyles.header}>
      {/*espaço para os itens do curso, usando flex-1 */}
      <div className={headerStyles.cursoItensArea}>
        <Link href="/" className={headerStyles.logo}>
          Primefix
        </Link>

        <Link href="/favoritos" className={headerStyles.favoritos}>
          Favoritos
        </Link>
      </div>

      <DarkModeButton />
    </header>
  )
}

export default Header;