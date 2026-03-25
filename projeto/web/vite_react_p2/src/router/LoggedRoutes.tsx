import { Route, Routes } from 'react-router-dom';
import Main from '@/app/(logged)/main';
import NotFound from '@/app/_NotFound/not-found';

function LoggedRoutes() {
  return (
    <div className='h-screen w-full flex overflow-hidden'>
      {/* <Sidebar /> */}

      <div className='h-screen min-h-0 w-full flex flex-1 flex-col overflow-hidden'>
        {/* <Header /> */}
        {/* <Main> */}
        <Routes>
          <Route path='/' element={<Main />} />
          <Route path='*' element={<NotFound />} />
        </Routes>
        {/* </Main> */}
        {/* <Footer /> */}
      </div>
    </div>
  );
}

export default LoggedRoutes;
