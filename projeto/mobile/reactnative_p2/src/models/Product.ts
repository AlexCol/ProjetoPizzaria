import { Category } from './Category';

export type Product = {
  id: string;
  name: string;
  price: number;
  description: string;
  banner: string | null;
  status: 'Active' | 'Inactive';
  categoryId: string;
  category: Category;
  createdAt: string;
  updatedAt: string;
};
