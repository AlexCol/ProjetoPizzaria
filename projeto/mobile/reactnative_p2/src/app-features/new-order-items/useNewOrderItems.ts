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
  const { mesaId, orderId } = useLocalSearchParams<NewOrderItemPageDto>();
  const theme = useThemeValue();
  const styles = getNewOrderItemsStyles(theme);

  const [categories, setCategories] = useState<Category[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);

  /****************************************************/
  /* Refs                                             */
  /****************************************************/

  /****************************************************/
  /* Metodos Privados                                 */
  /****************************************************/
  const loadCategories = useCallback(async () => {
    try {
      const categories = await getCategories();

      if (categories.length > 0) {
        setCategories(categories);
      }
    } catch (error) {
      Alert.alert('Erro', `Não foi possível carregar as categorias: ${error}`);
    }
  }, []);

  const loadProducts = useCallback(async (categoryId: number) => {
    try {
      const products: Product[] = await getProducts(categoryId.toString());
      if (products.length > 0) {
        setProducts(products);
      }
    } catch (error) {
      Alert.alert('Erro', `Não foi possível carregar os produtos: ${error}`);
    }
  }, []);
  /****************************************************/
  /* Metodos Publicos                                 */
  /****************************************************/

  /****************************************************/
  /* UseEffects                                       */
  /****************************************************/
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    void loadCategories();
  }, [loadCategories]);

  useEffect(() => {
    if (selectedCategory) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      void loadProducts(selectedCategory.id);
    }
  }, [selectedCategory, loadProducts]);
  /****************************************************/
  /* Retorno                                          */
  /****************************************************/
  return {
    router,
    mesaId,
    orderId,
    styles,
    categories,
    selectedCategory,
    products,
    selectedProduct,
  };
}

export type UseNewOrderItemsStates = ReturnType<typeof useNewOrderItems>;
