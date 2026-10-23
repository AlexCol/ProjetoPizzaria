import { useRouter } from 'expo-router';
import { useCallback, useEffect, useState } from 'react';
import { useThemeValue } from '@/src/contexts/theme/ThemeContext';
import { NewOrderItemPageDto } from '@/src/models/dtos/NewOrderItemPageDto';
import { Order } from '@/src/models/Order';
import getDashboardStyles from './dashboard.styles';

export function useDashboard() {
  /****************************************************/
  /* Variaveis vindas de Hooks ou Metodos externos    */
  /****************************************************/
  const router = useRouter();
  const theme = useThemeValue();
  const styles = getDashboardStyles(theme);

  /****************************************************/
  /* UseStates                                        */
  /****************************************************/
  const [orders, setOrders] = useState<Order[]>([]);

  /****************************************************/
  /* Refs                                             */
  /****************************************************/

  /****************************************************/
  /* Metodos Privados                                 */
  /****************************************************/

  /****************************************************/
  /* Metodos Publicos                                 */
  /****************************************************/
  const loadMyOrders = useCallback(async () => {
    // Implement the logic to load orders here
    // Example: const fetchedOrders = await fetchOrders();
    // setOrders(fetchedOrders);
  }, []);

  const loadAllOrders = useCallback(async () => {
    // Implement the logic to load all orders here
    // Example: const fetchedOrders = await fetchAllOrders();
    // setOrders(fetchedOrders);
  }, []);

  const navigateToOrderDetails = useCallback(
    (orderId: string) => {
      const params: NewOrderItemPageDto = { orderId };
      router.push({
        pathname: '/new-order-items',
        params,
      });
    },
    [router],
  );
  /****************************************************/
  /* UseEffects                                       */
  /****************************************************/
  useEffect(() => {
    //// eslint-disable-next-line react-hooks/set-state-in-effect
    void loadMyOrders();
  }, [loadMyOrders]);
  /****************************************************/
  /* Retorno                                          */
  /****************************************************/
  return {
    styles,
    navigateToOrderDetails,
    loadMyOrders,
    loadAllOrders,
  };
}

export type UseDashboardStates = ReturnType<typeof useDashboard>;
