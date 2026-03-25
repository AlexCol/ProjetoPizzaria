import { Navigate, Route, Routes } from 'react-router-dom';
import Login from '@/app/(notlogged)/auth/login';
import GradientBackground from '@/components/singles/GradientBackground';

function NotLoggedRoutes() {
  return (
    <>
      <GradientBackground />
      <Routes>
        <Route path='/auth/login' element={<Login />} />
        <Route path='*' element={<Navigate to='/auth/login' replace />} />
      </Routes>
    </>
  );
}

export default NotLoggedRoutes;
