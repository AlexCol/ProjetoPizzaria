import { useLocalSearchParams, useRouter } from 'expo-router';
import { useCallback, useEffect, useState } from 'react';
import { Alert } from 'react-native';
import { useThemeValue } from '@/src/contexts/theme/ThemeContext';
import { Category } from '@/src/models/Category';
import { NewOrderItemPageDto } from '@/src/models/dtos/NewOrderItemPageDto';
import { Order } from '@/src/models/Order';
import { Product } from '@/src/models/Product';
import { getCategories } from '@/src/services/categories';
import { postOrderItem } from '@/src/services/order-items';
import { delOrder } from '@/src/services/orders/delOrder';
import { getOrder } from '@/src/services/orders/getOrder';
import { getProducts } from '@/src/services/products/getProducts';
import { alertFromError } from '@/src/shared/helpers';
import getNewOrderItemsStyles from './use-new-order-items.styles';

export function useNewOrderItems() {
  /****************************************************/
  /* Variaveis vindas de Hooks ou Metodos externos    */
  /****************************************************/
  const router = useRouter();
  const { orderId } = useLocalSearchParams<NewOrderItemPageDto>();
  const theme = useThemeValue();
  const styles = getNewOrderItemsStyles(theme);

  /****************************************************/
  /* UseStates                                        */
  /****************************************************/
  const [order, setOrder] = useState<Order>({} as Order);
  const [isLoading, setIsLoading] = useState(false);
  const [categories, setCategories] = useState<Category[]>([]);
  const [selectedCategoryId, setSelectedCategoryId] = useState<string>('');
  const [products, setProducts] = useState<Product[]>([]);
  const [selectedProductId, setSelectedProductId] = useState<string>('');
  const [isSelectLoading, setIsSelectLoading] = useState(false);
  const [quantity, setQuantity] = useState(1);
  const [isInsertingItem, setIsInsertingItem] = useState(false);

  /****************************************************/
  /* Refs                                             */
  /****************************************************/

  /****************************************************/
  /* Metodos Privados                                 */
  /****************************************************/
  const loadOrder = useCallback(async () => {
    try {
      setIsLoading(true);
      const order = await getOrder(orderId);
      setOrder(order);
    } catch (error) {
      alertFromError(error);
      router.back();
    } finally {
      setIsLoading(false);
    }
  }, [router, orderId]);

  const loadCategories = useCallback(async () => {
    try {
      setIsSelectLoading(true);
      const categories = await getCategories();

      if (categories.length > 0) {
        setCategories(categories);
      } else {
        setCategories([]);
      }
    } catch (error) {
      Alert.alert('Erro', `Não foi possível carregar as categorias: ${error}`);
    } finally {
      setIsSelectLoading(false);
    }
  }, []);

  const loadProducts = useCallback(async (categoryId: string) => {
    try {
      setIsSelectLoading(true);
      const products: Product[] = await getProducts(categoryId);
      if (products.length > 0) {
        setProducts(products);
      } else {
        setProducts([]);
      }
      setSelectedProductId('');
    } catch (error) {
      Alert.alert('Erro', `Não foi possível carregar os produtos: ${error}`);
    } finally {
      setIsSelectLoading(false);
    }
  }, []);
  /****************************************************/
  /* Metodos Publicos                                 */
  /****************************************************/
  const cancelCreation = useCallback(async () => {
    setIsLoading(true);
    try {
      await delOrder(orderId);

      setSelectedCategoryId('');
      setSelectedProductId('');
      setProducts([]);
      router.back();
    } catch (error) {
      alertFromError(error);
    } finally {
      setIsLoading(false);
    }
  }, [router, orderId]);

  const handleAddItem = async () => {
    if (!selectedProductId) {
      return;
    }

    setIsInsertingItem(true);
    try {
      await postOrderItem(orderId, { productId: selectedProductId, amount: quantity });
      await loadOrder();
    } catch (error) {
      alertFromError(error);
    } finally {
      setIsInsertingItem(false);
    }

    setSelectedCategoryId('');
    setSelectedProductId('');
    setQuantity(1);
  };

  /****************************************************/
  /* UseEffects                                       */
  /****************************************************/
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    void loadOrder();
  }, [loadOrder]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    void loadCategories();
  }, [loadCategories]);

  useEffect(() => {
    if (selectedCategoryId) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      void loadProducts(selectedCategoryId);
    }
  }, [selectedCategoryId, loadProducts]);

  /****************************************************/
  /* Retorno                                          */
  /****************************************************/
  return {
    order,
    isLoading,
    cancelCreation,
    styles,
    isSelectLoading,
    categories,
    selectedCategoryId,
    setSelectedCategoryId,
    products,
    selectedProductId,
    setSelectedProductId,
    isInsertingItem,
    quantity,
    setQuantity,
    handleAddItem,
  };
}

export type UseNewOrderItemsStates = ReturnType<typeof useNewOrderItems>;
