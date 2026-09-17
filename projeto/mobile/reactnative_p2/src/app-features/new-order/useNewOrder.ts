import { useThemeValue } from '@/src/contexts/theme/ThemeContext';
import getNewOrderStyles from './new-order.styles';

export default function useNewOrder() {
  const theme = useThemeValue();
  const styles = getNewOrderStyles(theme);

  return {
    styles,
  };
}
export type UseNewOrderStates = ReturnType<typeof useNewOrder>;
