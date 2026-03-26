import { LogOut, Moon, Sun } from 'lucide-react';
import { useTheme } from 'next-themes';
import { Link } from 'react-router-dom';
import { headerStyles } from './header.styles';
import { useAuthContext } from '@/components/contexts/auth/AuthContext';

function Header() {
  const { signOut } = useAuthContext();
  const { setTheme, theme } = useTheme();

  const themeHandle = () => {
    if (theme === 'dark') {
      setTheme('light');
    } else {
      setTheme('dark');
    }
  };

  return (
    <div className={headerStyles.header}>
      <Link to='/' className={headerStyles.logoLink}>
        <div className={headerStyles.logoWrapTC}>
          {/* <img src='/main-logo.png' alt='Main logo' className={headerStyles.logoTC} /> */}
          Logo
        </div>
      </Link>

      <nav className={headerStyles.menuItens}>
        <div onClick={themeHandle} className={headerStyles.link}>
          {theme === 'dark' ? <Sun /> : <Moon />}
        </div>
        <div onClick={signOut} className={headerStyles.link}>
          <LogOut className={headerStyles.logoutIcon} />
        </div>
      </nav>
    </div>
  );
}

export default Header;
