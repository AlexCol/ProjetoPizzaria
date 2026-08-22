import { Component, effect, inject, input, output } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ToastrService } from 'ngx-toastr';
import { CategoriesDto, Category } from '../../../../../api/generated/models';
import { ButtonComponent } from '../../../../../components/shared/button/button';
import { InputComponent } from '../../../../../components/shared/input/input';
import { categoriaModalStyles } from './categoria-modal.styles';

@Component({
  selector: 'app-categoria-modal',
  templateUrl: './categoria-modal.html',
  host: { '[class]': 'styles.host' },
  imports: [ButtonComponent, InputComponent, ReactiveFormsModule],
})
export class CategoriaModalComponent {
  /*****************************************/
  /* Propriedades Privadas                 */
  /*****************************************/
  private readonly toast = inject(ToastrService);

  /*****************************************/
  /* Propriedades Publicas                 */
  /*****************************************/
  styles = categoriaModalStyles;

  /*****************************************/
  /* Inputs e Outputs                      */
  /*****************************************/
  readonly category = input.required<Category | undefined>();
  readonly saving = input(false);
  readonly closeModal = output<void>();
  readonly saveCategory = output<CategoriesDto>();

  /*****************************************/
  /* Formulario                            */
  /*****************************************/
  readonly form = new FormGroup({
    name: new FormControl('', {
      nonNullable: true,
      validators: [Validators.required, Validators.minLength(3), Validators.maxLength(100)],
    }),
  });

  /*****************************************/
  /* Metodo Construtor                     */
  /*****************************************/
  constructor() {
    effect(() => {
      const category = this.category();
      this.form.reset({
        name: category?.name ?? '',
      });
    });
  }

  /*****************************************/
  /* Metodos Publicos                      */
  /*****************************************/
  close(): void {
    this.closeModal.emit();
  }

  save(): void {
    if (!this.isFormValid()) {
      return;
    }

    const value = this.form.getRawValue();
    this.saveCategory.emit({ name: value.name.trim() });
  }

  /*****************************************/
  /* Metodos Privados                      */
  /*****************************************/
  private isFormValid(): boolean {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      this.toast.error('Por favor, preencha todos os campos obrigatórios corretamente.', 'Erro');
      return false;
    }
    return true;
  }
}
