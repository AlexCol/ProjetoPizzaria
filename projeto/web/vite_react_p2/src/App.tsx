import { useAuthContext } from './components/contexts/auth/AuthContext';
import LoadingTailwind from './components/singles/LoadingTailwind';
import Router from './router';

function App() {
  const { isLoading } = useAuthContext();

  if (isLoading) {
    return <LoadingTailwind />;
  }

  return <Router />;
}

export default App;
