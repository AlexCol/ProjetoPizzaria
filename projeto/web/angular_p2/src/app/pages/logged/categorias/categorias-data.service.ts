import { HttpErrorResponse } from '@angular/common/http';
import { DestroyRef, inject, Injectable, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ToastrService } from 'ngx-toastr';
import { finalize } from 'rxjs';
import { CategoriesService } from '../../../../api/generated/categories/categories.service';
import { CategoriesDto, Category } from '../../../../api/generated/models';
import { getApiErrorMessage } from '../../../../models/ApiError';

@Injectable()
export class CategoriasDataService {
  /*****************************************/
  /* Propriedades Privadas                 */
  /*****************************************/
  private readonly categoriesService = inject(CategoriesService);
  private readonly toast = inject(ToastrService);
  private readonly destroyRef = inject(DestroyRef);

  /*****************************************/
  /* Propriedades Publicas                 */
  /*****************************************/
  readonly categories = signal<Category[]>([]);
  readonly loading = signal(false);
  readonly saving = signal(false);
  readonly deleting = signal(false);

  /*****************************************/
  /* Metodos Publicos                      */
  /*****************************************/
  load(): void {
    this.loadCategories();
  }

  saveCategory(category: Category | undefined, payload: CategoriesDto, onSuccess: () => void): void {
    const request =
      category?.id !== undefined && category.id !== null
        ? this.categoriesService.patchApiCategoriesId(category.id, payload)
        : this.categoriesService.postApiCategories(payload);

    this.saving.set(true);
    request
      .pipe(
        finalize(() => this.saving.set(false)),
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe({
        next: () => {
          this.toast.success(category ? 'Categoria atualizada com sucesso.' : 'Categoria criada com sucesso.');
          onSuccess();
          this.loadCategories();
        },
        error: (error: HttpErrorResponse) => {
          this.toast.error(getApiErrorMessage(error, 'Não foi possível salvar a categoria.'), 'Erro');
        },
      });
  }

  deleteCategory(category: Category, onSuccess: () => void): void {
    if (category.id === undefined || category.id === null) {
      this.toast.error('Categoria inválida.', 'Erro');
      return;
    }

    this.deleting.set(true);
    this.categoriesService
      .deleteApiCategoriesId(category.id)
      .pipe(
        finalize(() => this.deleting.set(false)),
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe({
        next: () => {
          this.toast.success('Categoria deletada com sucesso.');
          onSuccess();
          this.loadCategories();
        },
        error: (error: HttpErrorResponse) => {
          this.toast.error(getApiErrorMessage(error, 'Não foi possível deletar a categoria.'), 'Erro');
        },
      });
  }

  /*****************************************/
  /* Metodos Privados                      */
  /*****************************************/
  private loadCategories(): void {
    this.loading.set(true);
    this.categoriesService
      .getApiCategories()
      .pipe(
        finalize(() => this.loading.set(false)),
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe({
        next: (categories) => this.categories.set(categories),
        error: (error: HttpErrorResponse) => {
          this.categories.set([]);
          this.toast.error(getApiErrorMessage(error, 'Não foi possível carregar as categorias.'), 'Erro');
        },
      });
  }
}
