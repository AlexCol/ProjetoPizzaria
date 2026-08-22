import { Component, computed, inject, signal, TemplateRef, viewChild } from '@angular/core';
import { LucideAngularModule, Pen, Trash2 } from 'lucide-angular';
import { CategoriesDto, Category } from '../../../../api/generated/models';
import { ButtonComponent } from '../../../../components/shared/button/button';
import { DataTableComponent } from '../../../../components/shared/data-table/data-table';
import { DataTableCellTemplateContext } from '../../../../components/shared/data-table/data-table.interfaces';
import { ModalComponent } from '../../../../components/shared/modal/modal';
import { AuthDirective } from '../../../../directives/auth.directive';
import { AuthStore } from '../../../../stores/auth/auth.store';
import { CategoriaModalComponent } from './categoria-modal/categoria-modal';
import { CategoriasDataService } from './categorias-data.service';
import { categoriasStyles } from './categorias.styles';
import { createCategoriesTableColumns } from './categories-table.columns';

@Component({
  selector: 'app-categorias',
  templateUrl: './categorias.html',
  host: { '[class]': 'styles.host' },
  imports: [
    AuthDirective,
    ButtonComponent,
    CategoriaModalComponent,
    DataTableComponent,
    LucideAngularModule,
    ModalComponent,
  ],
  providers: [CategoriasDataService],
})
export class CategoriasComponent {
  /*****************************************/
  /* Propriedades Privadas                 */
  /*****************************************/
  private readonly data = inject(CategoriasDataService);
  private readonly authStore = inject(AuthStore);

  /*****************************************/
  /* Propriedades Publicas                 */
  /*****************************************/
  readonly Edit = Pen;
  readonly Trash2 = Trash2;
  readonly categories = this.data.categories;
  readonly loading = this.data.loading;
  readonly saving = this.data.saving;
  readonly deleting = this.data.deleting;
  readonly modalOpen = signal(false);
  readonly deleteModalOpen = signal(false);
  readonly selectedCategory = signal<Category | undefined>(undefined);
  readonly categoryToDelete = signal<Category | undefined>(undefined);
  readonly styles = categoriasStyles;

  /*****************************************/
  /* Propriedades Computadas               */
  /*****************************************/
  readonly actionsTemplate = viewChild<TemplateRef<DataTableCellTemplateContext<Category>>>('actionsTemplate');
  readonly isAdmin = computed(() => this.authStore.hasAnyRole(['Admin']));
  readonly tableColumns = computed(() =>
    createCategoriesTableColumns({
      actionsTemplate: this.actionsTemplate(),
      showControls: this.isAdmin(),
    }),
  );

  /*****************************************/
  /* Metodo Construtor                     */
  /*****************************************/
  constructor() {
    this.data.load();
  }

  /*****************************************/
  /* Metodos Publicos                      */
  /*****************************************/
  openModal(category?: Category): void {
    this.selectedCategory.set(category);
    this.modalOpen.set(true);
  }

  closeModal(): void {
    this.selectedCategory.set(undefined);
    this.modalOpen.set(false);
  }

  saveCategory(payload: CategoriesDto): void {
    this.data.saveCategory(this.selectedCategory(), payload, () => this.closeModal());
  }

  requestDelete(category: Category): void {
    this.categoryToDelete.set(category);
    this.deleteModalOpen.set(true);
  }

  cancelDelete(): void {
    this.categoryToDelete.set(undefined);
    this.deleteModalOpen.set(false);
  }

  confirmDelete(): void {
    const category = this.categoryToDelete();
    if (!category) return;

    this.data.deleteCategory(category, () => this.cancelDelete());
  }
}
