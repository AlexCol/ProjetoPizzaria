import { Component, TemplateRef, computed, inject, signal, viewChild } from '@angular/core';
import { LucideAngularModule, Pen, Trash2 } from 'lucide-angular';
import { Product } from '../../../../api/generated/models';
import { ButtonComponent } from '../../../../components/shared/button/button';
import { DataTableComponent } from '../../../../components/shared/data-table/data-table';
import {
  DataTableCellTemplateContext,
  DataTableFilterOption,
} from '../../../../components/shared/data-table/data-table.interfaces';
import { ModalComponent } from '../../../../components/shared/modal/modal';
import { AuthDirective } from '../../../../directives/auth.directive';
import { AuthStore } from '../../../../stores/auth/auth.store';
import { ProductFormSubmission } from './dtos/ProductFormSubmission';
import { createProductImageUrl } from './product-image-url';
import { ProdutoModalComponent } from './produto-modal/produto-modal';
import { ProdutosDataService } from './produtos-data.service';
import { createProdutosTableColumns } from './produtos-table.columns';
import { produtosStyles } from './produtos.styles';

@Component({
  selector: 'app-produtos',
  templateUrl: './produtos.html',
  host: { '[class]': 'styles.host' },
  imports: [
    AuthDirective,
    ButtonComponent,
    DataTableComponent,
    LucideAngularModule,
    ModalComponent,
    ProdutoModalComponent,
  ],
  providers: [ProdutosDataService],
})
export class ProdutosComponent {
  /*****************************************/
  /* Propriedades Privadas                 */
  /*****************************************/
  private readonly data = inject(ProdutosDataService);
  private readonly authStore = inject(AuthStore);

  /*****************************************/
  /* Propriedades Publicas                 */
  /*****************************************/
  readonly Edit = Pen;
  readonly Trash2 = Trash2;
  readonly products = this.data.products;
  readonly loading = this.data.loading;
  readonly saving = this.data.saving;
  readonly deleting = this.data.deleting;
  readonly modalOpen = signal(false);
  readonly deleteModalOpen = signal(false);
  readonly unavailableImages = signal<ReadonlySet<string>>(new Set());
  readonly selectedProduct = signal<Product | undefined>(undefined);
  readonly productToDelete = signal<Product | undefined>(undefined);
  readonly styles = produtosStyles;

  /*****************************************/
  /* Propriedades Computadas               */
  /*****************************************/
  readonly imageTemplate = viewChild<TemplateRef<DataTableCellTemplateContext<Product>>>('imageTemplate');
  readonly statusTemplate = viewChild<TemplateRef<DataTableCellTemplateContext<Product>>>('statusTemplate');
  readonly actionsTemplate = viewChild<TemplateRef<DataTableCellTemplateContext<Product>>>('actionsTemplate');
  readonly isAdmin = computed(() => this.authStore.hasAnyRole(['Admin']));
  readonly categoryOptions = computed<DataTableFilterOption[]>(() =>
    this.data
      .categories()
      .filter((category) => category.id !== undefined && category.id !== null)
      .map((category) => ({ label: category.name ?? '', value: category.id! })),
  );
  readonly tableColumns = computed(() =>
    createProdutosTableColumns({
      categoryOptions: this.categoryOptions(),
      imageTemplate: this.imageTemplate(),
      statusTemplate: this.statusTemplate(),
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
  openModal(product?: Product): void {
    this.selectedProduct.set(product);
    this.modalOpen.set(true);
  }

  closeModal(): void {
    this.selectedProduct.set(undefined);
    this.modalOpen.set(false);
  }

  statusLabel(status: Product['status']): string {
    return status === 'Active' ? 'Ativo' : 'Inativo';
  }

  hasProductImage(product: Product): boolean {
    return !!product.banner?.trim() && !this.unavailableImages().has(this.productImageKey(product));
  }

  productImageUrl(product: Product): string {
    return createProductImageUrl(product.banner, product.updatedAt) ?? '';
  }

  markImageAsUnavailable(product: Product): void {
    this.unavailableImages.update((current) => new Set(current).add(this.productImageKey(product)));
  }

  saveProduct(payload: ProductFormSubmission): void {
    this.data.saveProduct(this.selectedProduct(), payload, () => this.closeModal());
  }

  requestDelete(product: Product): void {
    this.productToDelete.set(product);
    this.deleteModalOpen.set(true);
  }

  cancelDelete(): void {
    this.productToDelete.set(undefined);
    this.deleteModalOpen.set(false);
  }

  confirmDelete(): void {
    const product = this.productToDelete();
    if (!product) return;

    this.data.deleteProduct(product, () => this.cancelDelete());
  }

  /*****************************************/
  /* Metodos Privados                      */
  /*****************************************/
  private productImageKey(product: Product): string {
    return `${product.id ?? ''}:${product.banner?.trim() ?? ''}:${product.updatedAt ?? ''}`;
  }
}
