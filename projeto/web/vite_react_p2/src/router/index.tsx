import { BrowserRouter } from 'react-router-dom';
import LoggedRoutes from './LoggedRoutes';
import NotLoggedRoutes from './NotLoggedRoutes';
import { useAuthContext } from '@/components/contexts/auth/AuthContext';

function Router() {
  const { userData } = useAuthContext();
  return (
    <div className='h-full w-full'>
      <BrowserRouter>
        {userData ? (
          <LoggedRoutes /> //? Rotas autenticadas
        ) : (
          <NotLoggedRoutes /> //? Rotas públicas
        )}
      </BrowserRouter>
    </div>
  );
}

export default Router;
