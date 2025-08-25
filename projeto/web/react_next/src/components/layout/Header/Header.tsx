import { useAuthContext } from '@/components/contexts/auth/AuthContext';
import LogoImage from '@/components/singles/LogoImage';
import { useTheme } from 'next-themes';
import Link from 'next/link';
import { PiSignOutBold } from "react-icons/pi";
import { headerStyles } from './header.styles';

function Header() {
  const { signOut } = useAuthContext();
  const { setTheme, theme } = useTheme();

  const themeHandle = () => {
    if (theme === 'dark') {
      setTheme('light')
    } else {
      setTheme('dark');
    }
  }

  return (
    <header className={headerStyles.header}>
      <Link href={'/'} className={headerStyles.logoLink}>
        <LogoImage height={62} width={62} />
      </Link>

      <nav className={headerStyles.menuItens}>

        <Link href={'/categoria'} className={headerStyles.link}>
          Categoria
        </Link>
        <Link href={'/produto'} className={headerStyles.link}>
          Produto
        </Link>
        <div onClick={themeHandle} className={headerStyles.link}>
          {`${(theme === 'dark' ? 'Light' : 'Dark')} Mode`}
        </div>
        <div onClick={signOut} className={headerStyles.link}>
          <PiSignOutBold className={headerStyles.logoutIcon} />
        </div>
      </nav>
    </header>
  )
}

export default Header;
