import { Navigate, Route, Routes } from 'react-router-dom';
import NotFound from '@/app/_not-found/not-found';
import Home from '@/app/logged/Home';
import Users from '@/app/logged/Usuarios';
import { useAuthContext } from '@/components/contexts/auth/AuthContext';
import Footer from '@/components/layout/Footer';
import Header from '@/components/layout/Header';
import Main from '@/components/layout/Main';
import Sidebar from '@/components/layout/Sidebar';

function LoggedRoutes() {
  const { userData } = useAuthContext();
  const isAdmin = userData?.user?.role?.name === 'Admin';

  return (
    <div className='h-screen w-full flex overflow-hidden'>
      <Sidebar />

      <div className='h-screen min-h-0 w-full flex flex-1 flex-col overflow-hidden'>
        <Header />
        <Main>
          <Routes>
            <Route path='/' element={<Home />} />
            <Route path='/auth/login' element={<Navigate to='/' replace />} />

            {isAdmin ? (
              <>
                <Route path='/usuarios' element={<Users />} />
              </>
            ) : (
              <></>
            )}

            <Route path='*' element={<NotFound />} />
          </Routes>
        </Main>
        <Footer />
      </div>
    </div>
  );
}

export default LoggedRoutes;
