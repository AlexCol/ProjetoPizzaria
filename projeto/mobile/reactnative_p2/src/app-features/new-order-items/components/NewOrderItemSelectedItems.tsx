import Select from '@/src/components/base/Select';
import MyScrollView from '@/src/components/MyScrollView';
import { UseNewOrderItemsStates } from '../useNewOrderItems';

type NewOrderItemSelectedItemsProps = {
  states: UseNewOrderItemsStates;
};

export default function NewOrderItemSelectedItems({ states }: NewOrderItemSelectedItemsProps) {
  const { styles } = states;
  const { products, selectedProductId, setSelectedProductId } = states;
  const { categories, selectedCategoryId, setSelectedCategoryId } = states;

  return (
    <MyScrollView contentContainerStyle={styles.selectContainer}>
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
        placeholder='Selecione um produto...'
      />
    </MyScrollView>
  );
}
