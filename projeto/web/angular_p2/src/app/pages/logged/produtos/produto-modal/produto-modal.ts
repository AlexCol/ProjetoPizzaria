import { Component, DestroyRef, effect, inject, input, output, signal } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ToastrService } from 'ngx-toastr';
import { EProductStatus, Product } from '../../../../../api/generated/models';
import { ButtonComponent } from '../../../../../components/shared/button/button';
import { InputComponent } from '../../../../../components/shared/input/input';
import { SelectComponent, SelectOption } from '../../../../../components/shared/select/select';
import { ProductFormSubmission } from '../dtos/ProductFormSubmission';
import { createProductImageUrl } from '../product-image-url';
import { produtoModalStyles } from './produto-modal.styles';

const MAX_IMAGE_SIZE = 2 * 1024 * 1024;
const ALLOWED_IMAGE_TYPES = new Set(['image/jpeg', 'image/png']);

@Component({
  selector: 'app-produto-modal',
  templateUrl: './produto-modal.html',
  host: { '[class]': 'styles.host' },
  imports: [ButtonComponent, InputComponent, ReactiveFormsModule, SelectComponent],
})
export class ProdutoModalComponent {
  /*****************************************/
  /* Propriedades Privadas                 */
  /*****************************************/
  private readonly toast = inject(ToastrService);
  private readonly destroyRef = inject(DestroyRef);
  private readonly selectedImage = signal<File | undefined>(undefined);
  private previewObjectUrl: string | undefined;

  /*****************************************/
  /* Propriedades Publicas                 */
  /*****************************************/
  readonly styles = produtoModalStyles;
  readonly previewUrl = signal<string | undefined>(undefined);
  readonly previewUnavailable = signal(false);
  readonly isDraggingImage = signal(false);
  readonly statusOptions: readonly SelectOption[] = [
    { label: 'Ativo', value: EProductStatus.Active },
    { label: 'Inativo', value: EProductStatus.Inactive },
  ];

  /*****************************************/
  /* Inputs e Outputs                      */
  /*****************************************/
  readonly product = input.required<Product | undefined>();
  readonly categoryOptions = input.required<readonly SelectOption[]>();
  readonly saving = input(false);
  readonly closeModal = output<void>();
  readonly saveProduct = output<ProductFormSubmission>();

  /*****************************************/
  /* Formulario                            */
  /*****************************************/
  readonly form = new FormGroup({
    name: new FormControl('', {
      nonNullable: true,
      validators: [Validators.required, Validators.minLength(1), Validators.maxLength(100)],
    }),
    price: new FormControl<number | null>(null, { validators: [Validators.required, Validators.min(0.01)] }),
    categoryId: new FormControl<string | number | null>(null, { validators: [Validators.required] }),
    description: new FormControl('', {
      nonNullable: true,
      validators: [Validators.required, Validators.minLength(1), Validators.maxLength(500)],
    }),
    status: new FormControl<EProductStatus>(EProductStatus.Active, { nonNullable: true }),
  });

  /*****************************************/
  /* Metodo Construtor                     */
  /*****************************************/
  constructor() {
    effect(() => {
      const product = this.product();
      this.releasePreviewObjectUrl();
      this.selectedImage.set(undefined);
      this.previewUnavailable.set(false);
      this.previewUrl.set(createProductImageUrl(product?.banner, product?.updatedAt));
      this.form.reset({
        name: product?.name ?? '',
        price: product?.price === undefined ? null : Number(product.price),
        categoryId: product?.categoryId ?? null,
        description: product?.description ?? '',
        status: this.normalizeStatus(product?.status),
      });
    });

    this.destroyRef.onDestroy(() => this.releasePreviewObjectUrl());
  }

  /*****************************************/
  /* Metodos Publicos                      */
  /*****************************************/
  close(): void {
    this.closeModal.emit();
  }

  selectImage(event: Event): void {
    const inputElement = event.target as HTMLInputElement;
    const image = inputElement.files?.[0];

    if (!image) {
      this.selectedImage.set(undefined);
      this.restoreProductPreview();
      return;
    }

    this.loadImage(image, inputElement);
  }

  dragImageOver(event: DragEvent): void {
    event.preventDefault();
    if (event.dataTransfer) event.dataTransfer.dropEffect = 'copy';
    this.isDraggingImage.set(true);
  }

  leaveImageDropZone(event: DragEvent): void {
    const container = event.currentTarget as HTMLElement;
    const nextTarget = event.relatedTarget as Node | null;
    if (!nextTarget || !container.contains(nextTarget)) this.isDraggingImage.set(false);
  }

  dropImage(event: DragEvent): void {
    event.preventDefault();
    this.isDraggingImage.set(false);

    const image = event.dataTransfer?.files[0];
    if (image) this.loadImage(image);
  }

  removeImage(): void {
    this.selectedImage.set(undefined);
    this.restoreProductPreview();
  }

  markPreviewAsUnavailable(): void {
    this.previewUnavailable.set(true);
  }

  save(): void {
    if (!this.isFormValid()) return;

    const value = this.form.getRawValue();
    const image = this.selectedImage();
    this.saveProduct.emit({
      name: value.name.trim(),
      price: value.price!,
      description: value.description.trim(),
      categoryId: value.categoryId!,
      ...(this.product() ? { status: value.status } : {}),
      ...(image ? { image } : {}),
    });
  }

  /*****************************************/
  /* Metodos Privados                      */
  /*****************************************/
  private loadImage(image: File, inputElement?: HTMLInputElement): void {
    if (!ALLOWED_IMAGE_TYPES.has(image.type)) {
      if (inputElement) inputElement.value = '';
      this.selectedImage.set(undefined);
      this.restoreProductPreview();
      this.toast.error('A imagem deve estar no formato JPG, JPEG ou PNG.', 'Erro');
      return;
    }

    if (image.size > MAX_IMAGE_SIZE) {
      if (inputElement) inputElement.value = '';
      this.selectedImage.set(undefined);
      this.restoreProductPreview();
      this.toast.error('A imagem deve ter no máximo 2 MB.', 'Erro');
      return;
    }

    this.selectedImage.set(image);
    this.releasePreviewObjectUrl();
    this.previewObjectUrl = URL.createObjectURL(image);
    this.previewUnavailable.set(false);
    this.previewUrl.set(this.previewObjectUrl);
  }
  private normalizeStatus(status: Product['status']): EProductStatus {
    return status === EProductStatus.Inactive ? EProductStatus.Inactive : EProductStatus.Active;
  }

  private restoreProductPreview(): void {
    this.releasePreviewObjectUrl();
    const product = this.product();
    this.previewUnavailable.set(false);
    this.previewUrl.set(createProductImageUrl(product?.banner, product?.updatedAt));
  }

  private releasePreviewObjectUrl(): void {
    if (!this.previewObjectUrl) return;

    URL.revokeObjectURL(this.previewObjectUrl);
    this.previewObjectUrl = undefined;
  }

  private isFormValid(): boolean {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      this.toast.error('Por favor, preencha todos os campos obrigatórios corretamente.', 'Erro');
      return false;
    }

    if (!this.product() && !this.selectedImage()) {
      this.toast.error('Por favor, selecione uma imagem para o produto.', 'Erro');
      return false;
    }

    return true;
  }
}
