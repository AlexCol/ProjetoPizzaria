import { HttpErrorResponse } from '@angular/common/http';
import { DestroyRef, Injectable, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ToastrService } from 'ngx-toastr';
import { Observable, finalize } from 'rxjs';
import { CategoriesService } from '../../../../api/generated/categories/categories.service';
import { Category, PatchApiProductsIdBody, PostApiProductsBody, Product } from '../../../../api/generated/models';
import { ProductsService } from '../../../../api/generated/products/products.service';
import { getApiErrorMessage } from '../../../../models/ApiError';
import { ProductFormSubmission } from './dtos/ProductFormSubmission';

@Injectable()
export class ProdutosDataService {
  /*****************************************/
  /* Propriedades Privadas                 */
  /*****************************************/
  private readonly productsService = inject(ProductsService);
  private readonly categoriesService = inject(CategoriesService);
  private readonly toast = inject(ToastrService);
  private readonly destroyRef = inject(DestroyRef);

  /*****************************************/
  /* Propriedades Publicas                 */
  /*****************************************/
  readonly products = signal<Product[]>([]);
  readonly categories = signal<Category[]>([]);
  readonly loading = signal(false);
  readonly saving = signal(false);
  readonly deleting = signal(false);

  /*****************************************/
  /* Metodos Publicos                      */
  /*****************************************/
  load(): void {
    this.loadCategories();
    this.loadProducts();
  }

  saveProduct(product: Product | undefined, payload: ProductFormSubmission, onSuccess: () => void): void {
    const request: Observable<unknown> =
      product?.id !== undefined && product.id !== null
        ? this.productsService.patchApiProductsId(product.id, this.toUpdatePayload(product, payload))
        : this.productsService.postApiProducts(this.toCreatePayload(payload));

    this.saving.set(true);
    request
      .pipe(
        finalize(() => this.saving.set(false)),
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe({
        next: () => {
          this.toast.success(product ? 'Produto atualizado com sucesso.' : 'Produto criado com sucesso.');
          onSuccess();
          this.loadProducts();
        },
        error: (error: HttpErrorResponse) => {
          this.toast.error(getApiErrorMessage(error, 'Não foi possível salvar o produto.'), 'Erro');
        },
      });
  }

  deleteProduct(product: Product, onSuccess: () => void): void {
    if (product.id === undefined || product.id === null) {
      this.toast.error('Produto inválido.', 'Erro');
      return;
    }

    this.deleting.set(true);
    this.productsService
      .deleteApiProductsId(product.id)
      .pipe(
        finalize(() => this.deleting.set(false)),
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe({
        next: () => {
          this.toast.success('Produto excluído com sucesso.');
          onSuccess();
          this.loadProducts();
        },
        error: (error: HttpErrorResponse) => {
          this.toast.error(getApiErrorMessage(error, 'Não foi possível excluir o produto.'), 'Erro');
        },
      });
  }

  /*****************************************/
  /* Metodos Privados                      */
  /*****************************************/
  private toCreatePayload(payload: ProductFormSubmission): PostApiProductsBody {
    return {
      Name: payload.name,
      Price: payload.price,
      Description: payload.description,
      CategoryId: payload.categoryId,
      ...(payload.image ? { image: payload.image } : {}),
    };
  }

  private toUpdatePayload(product: Product, payload: ProductFormSubmission): PatchApiProductsIdBody {
    return {
      ...(payload.name !== product.name ? { Name: payload.name } : {}),
      ...(Number(payload.price) !== Number(product.price) ? { Price: payload.price } : {}),
      ...(payload.description !== product.description ? { Description: payload.description } : {}),
      ...(String(payload.categoryId) !== String(product.categoryId) ? { CategoryId: payload.categoryId } : {}),
      ...(payload.status !== product.status ? { Status: payload.status } : {}),
      ...(payload.image ? { image: payload.image } : {}),
    };
  }

  private loadCategories(): void {
    this.categoriesService
      .getApiCategories()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (categories) => this.categories.set(categories),
        error: (error: HttpErrorResponse) => {
          this.categories.set([]);
          this.toast.error(getApiErrorMessage(error, 'Não foi possível carregar as categorias.'), 'Erro');
        },
      });
  }

  private loadProducts(): void {
    this.loading.set(true);
    this.productsService
      .getApiProducts()
      .pipe(
        finalize(() => this.loading.set(false)),
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe({
        next: (products) => this.products.set(products),
        error: (error: HttpErrorResponse) => {
          this.products.set([]);
          this.toast.error(getApiErrorMessage(error, 'Não foi possível carregar os produtos.'), 'Erro');
        },
      });
  }
}
