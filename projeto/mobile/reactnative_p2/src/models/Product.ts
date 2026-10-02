import { Category } from './Category';

export type Product = {
  id: number;
  name: string;
  price: number;
  description: string;
  banner: string | null;
  status: 'Active' | 'Inactive';
  categoryId: number;
  category: Category;
  createdAt: string;
  updatedAt: string;
};
