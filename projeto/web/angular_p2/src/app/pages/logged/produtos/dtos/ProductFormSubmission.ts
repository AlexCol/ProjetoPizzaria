import { EProductStatus } from '../../../../../api/generated/models';

export interface ProductFormSubmission {
  name: string;
  price: number;
  description: string;
  categoryId: number | string;
  status?: EProductStatus;
  image?: File;
}
