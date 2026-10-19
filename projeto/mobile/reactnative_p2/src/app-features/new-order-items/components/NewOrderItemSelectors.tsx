import { View } from 'react-native';
import Select from '@/src/components/base/Select';
import { UseNewOrderItemsStates } from '../useNewOrderItems';
import NewOrderIAddtemButton from './NewOrderIAddtemButton';
import NewOrderItemAddItemControl from './NewOrderItemAddItemControl';

type NewOrderItemSelectorsProps = {
  states: UseNewOrderItemsStates;
};

export default function NewOrderItemSelectors({ states }: NewOrderItemSelectorsProps) {
  const { styles } = states;
  const { products, selectedProductId, setSelectedProductId } = states;
  const { categories, selectedCategoryId, setSelectedCategoryId } = states;

  return (
    <View style={styles.selectContainer}>
      <Select
        label='Categorias'
        options={categories.map((category) => ({
          label: category.name,
          value: category.id.toString(),
        }))}
        selectedValue={selectedCategoryId}
        onValueChange={setSelectedCategoryId}
        placeholder='Selecione uma categoria...'
      />

      <Select
        label='Produtos'
        options={products.map((product) => ({
          label: product.name,
          value: product.id.toString(),
        }))}
        selectedValue={selectedProductId}
        onValueChange={setSelectedProductId}
        disabled={!selectedCategoryId}
        placeholder='Selecione um produto...'
      />

      <NewOrderItemAddItemControl states={states} />
      <NewOrderIAddtemButton states={states} />
    </View>
  );
}
