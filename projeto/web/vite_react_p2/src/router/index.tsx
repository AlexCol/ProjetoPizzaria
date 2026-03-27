import { useEffect } from 'react';
import { BrowserRouter } from 'react-router-dom';
import LoggedRoutes from './LoggedRoutes';
import NotLoggedRoutes from './NotLoggedRoutes';
import { useAuthContext } from '@/components/contexts/auth/AuthContext';
import { useSseContext } from '@/components/contexts/sse/SSEContext';

function Router() {
  const { isAuthenticated } = useAuthContext();
  const { setSseEnabled } = useSseContext();

  useEffect(() => {
    setSseEnabled(isAuthenticated);
  }, [isAuthenticated, setSseEnabled]);

  return (
    <div className='h-full w-full'>
      <BrowserRouter>
        {isAuthenticated ? (
          <LoggedRoutes /> //? Rotas autenticadas
        ) : (
          <NotLoggedRoutes /> //? Rotas públicas
        )}
      </BrowserRouter>
    </div>
  );
}

export default Router;
