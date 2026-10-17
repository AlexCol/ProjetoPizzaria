import { Alert } from 'react-native';

export function alertFromError(error: unknown) {
  let errorMessage = 'Ocorreu um erro. Tente novamente.';
  if (typeof error === 'object' && error !== null && 'message' in error) {
    errorMessage = error.message as string;
  }
  Alert.alert('Erro', errorMessage);
}
