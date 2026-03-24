import { AuthProvider } from '@/components/contexts/auth/AuthContext';
import { SseProvider } from '@/components/contexts/sse/SSEContext';
import ToastContext from '@/components/contexts/toast/ToastContext';

function App({ children }: { children: React.ReactNode }) {
  //providers e contexts globais aqui

  return (
    <ToastContext>
      <SseProvider>
        <AuthProvider>
          {/* <PermissionsProvider> */}
          {children}
          {/* </PermissionsProvider> */}
        </AuthProvider>
      </SseProvider>
    </ToastContext>
  );
}

export default App;
