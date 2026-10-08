import { useLocalSearchParams, useRouter } from 'expo-router';
import { useCallback, useEffect, useState } from 'react';
import { Alert } from 'react-native';
import { useThemeValue } from '@/src/contexts/theme/ThemeContext';
import { Category } from '@/src/models/Category';
import { NewOrderItemPageDto } from '@/src/models/dtos/NewOrderItemPageDto';
import { Product } from '@/src/models/Product';
import { getCategories } from '@/src/services/categories';
import { getProducts } from '@/src/services/products/getProducts';
import getNewOrderItemsStyles from './use-new-order-items.styles';

export function useNewOrderItems() {
  /****************************************************/
  /* Variaveis vindas de Hooks ou Metodos externos    */
  /****************************************************/
  const router = useRouter();
  const { tableNumber, orderId } = useLocalSearchParams<NewOrderItemPageDto>();
  const theme = useThemeValue();
  const styles = getNewOrderItemsStyles(theme);

  const [categories, setCategories] = useState<Category[]>([]);
  const [selectedCategoryId, setSelectedCategoryId] = useState<string>('');
  const [isLoadingCategories, setIsLoadingCategories] = useState(false);
  const [products, setProducts] = useState<Product[]>([]);
  const [selectedProductId, setSelectedProductId] = useState<string>('');

  /****************************************************/
  /* Refs                                             */
  /****************************************************/

  /****************************************************/
  /* Metodos Privados                                 */
  /****************************************************/
  const loadCategories = useCallback(async () => {
    try {
      setIsLoadingCategories(true);
      const categories = await getCategories();

      if (categories.length > 0) {
        setCategories(categories);
      } else {
        setCategories([]);
      }
    } catch (error) {
      Alert.alert('Erro', `Não foi possível carregar as categorias: ${error}`);
    } finally {
      setIsLoadingCategories(false);
    }
  }, []);

  const loadProducts = useCallback(async (categoryId: number) => {
    try {
      const products: Product[] = await getProducts(categoryId.toString());
      if (products.length > 0) {
        setProducts(products);
      } else {
        setProducts([]);
      }
    } catch (error) {
      Alert.alert('Erro', `Não foi possível carregar os produtos: ${error}`);
    }
  }, []);
  /****************************************************/
  /* Metodos Publicos                                 */
  /****************************************************/
  const cancelCreation = useCallback(() => {
    setSelectedCategoryId('');
    setSelectedProductId('');
    setProducts([]);
    router.back();
  }, [router]);

  /****************************************************/
  /* UseEffects                                       */
  /****************************************************/
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    void loadCategories();
  }, [loadCategories]);

  useEffect(() => {
    if (selectedCategoryId) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      void loadProducts(Number(selectedCategoryId));
    }
  }, [selectedCategoryId, loadProducts]);
  /****************************************************/
  /* Retorno                                          */
  /****************************************************/
  return {
    cancelCreation,
    tableNumber,
    orderId,
    styles,
    isLoadingCategories,
    categories,
    selectedCategoryId,
    setSelectedCategoryId,
    products,
    selectedProductId,
    setSelectedProductId,
  };
}

export type UseNewOrderItemsStates = ReturnType<typeof useNewOrderItems>;
