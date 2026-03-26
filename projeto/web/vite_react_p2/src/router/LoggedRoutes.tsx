import { Navigate, Route, Routes } from 'react-router-dom';
import Home from '@/app/(logged)/home';
import NotFound from '@/app/_NotFound/not-found';
import Footer from '@/components/layout/Footer/Footer';
import Header from '@/components/layout/Header/Header';
import Main from '@/components/layout/Main/Main';
import Sidebar from '@/components/layout/Sidebar/Sidebar';

function LoggedRoutes() {
  return (
    <div className='h-screen w-full flex overflow-hidden'>
      <Sidebar />

      <div className='h-screen min-h-0 w-full flex flex-1 flex-col overflow-hidden'>
        <Header />
        <Main>
          <Routes>
            <Route path='/' element={<Home />} />
            <Route path='/auth/login' element={<Navigate to='/' replace />} />
            <Route path='*' element={<NotFound />} />
          </Routes>
        </Main>
        <Footer />
      </div>
    </div>
  );
}

export default LoggedRoutes;
