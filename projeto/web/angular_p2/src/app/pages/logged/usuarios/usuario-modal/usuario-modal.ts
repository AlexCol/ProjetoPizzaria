import { Component, effect, inject, input, output } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ToastrService } from 'ngx-toastr';
import { CreateUserDto, UpdateUserDto } from '../../../../../api/generated/models';
import { ButtonComponent } from '../../../../../components/shared/button/button';
import { InputComponent } from '../../../../../components/shared/input/input';
import { SelectComponent, SelectOption } from '../../../../../components/shared/select/select';
import { User } from '../../../../../models/User';
import { usuarioModalStyles } from './usuario-modal.styles';

export type UserFormSubmission = CreateUserDto | UpdateUserDto;
const PASSWORD_PATTERN = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[\W_]).+$/;

@Component({
  selector: 'app-usuario-modal',
  templateUrl: './usuario-modal.html',
  host: { '[class]': 'styles.host' },
  imports: [ButtonComponent, InputComponent, ReactiveFormsModule, SelectComponent],
})
export class UsuarioModalComponent {
  /*****************************************/
  /* Propriedades Privadas                 */
  /*****************************************/
  private readonly toast = inject(ToastrService);

  /*****************************************/
  /* Propriedades Publicas                 */
  /*****************************************/
  styles = usuarioModalStyles;

  /*****************************************/
  /* Inputs e Outputs                     */
  /*****************************************/
  readonly user = input.required<User | undefined>();
  readonly roleOptions = input.required<readonly SelectOption[]>();
  readonly saving = input(false);
  readonly closeModal = output<void>();
  readonly saveUser = output<UserFormSubmission>();

  /*****************************************/
  /* Formulario                            */
  /*****************************************/
  readonly form = new FormGroup({
    name: new FormControl('', { nonNullable: true, validators: [Validators.required, Validators.minLength(3)] }),
    email: new FormControl('', { nonNullable: true, validators: [Validators.required, Validators.email] }),
    roleId: new FormControl<string | null>(null, { validators: [Validators.required] }),
    password: new FormControl('', { nonNullable: true }),
    confirmPassword: new FormControl('', { nonNullable: true }),
  });

  /*****************************************/
  /* Metodo Construtor                     */
  /*****************************************/
  constructor() {
    effect(() => {
      const user = this.user();
      this.form.reset({
        name: user?.name ?? '',
        email: user?.email ?? '',
        roleId: user?.role?.id ?? user?.roleId ?? null,
        password: '',
        confirmPassword: '',
      });

      if (user) {
        this.form.controls.email.disable();
        this.clearPasswordValidators();
      } else {
        this.form.controls.email.enable();
        this.setPasswordValidators();
      }
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
    if (this.user()) {
      //? Edição de usuário existente
      this.saveUser.emit({ name: value.name.trim(), roleId: value.roleId! });
    } else {
      this.saveUser.emit({
        name: value.name.trim(),
        email: value.email.trim(),
        roleId: value.roleId!,
        password: value.password,
        confirmPassword: value.confirmPassword,
      });
    }
  }

  /*****************************************/
  /* Metodos Privados                      */
  /*****************************************/
  private isFormValid(): boolean {
    if (!this.form.invalid) {
      return true;
    }

    this.form.markAllAsTouched();

    if (this.form.controls.password.errors?.['minlength']) {
      this.toast.error('A senha deve ter no mínimo 8 caracteres.', 'Erro');
      return false;
    }

    if (this.form.controls.password.errors?.['pattern']) {
      this.toast.error(
        'A senha deve conter pelo menos uma letra maiúscula, uma letra minúscula, um número e um caractere especial.',
        'Erro',
      );
      return false;
    }

    if (this.form.controls.confirmPassword.errors?.['passwordMismatch']) {
      this.toast.error('As senhas não coincidem.', 'Erro');
      return false;
    }

    if (this.form.controls.email.errors?.['email']) {
      this.toast.error('O e-mail informado não é válido.', 'Erro');
      return false;
    }

    const value = this.form.getRawValue();
    if (!value.roleId) {
      this.toast.error('Por favor, selecione um cargo para o usuário.', 'Erro');
      return false;
    }

    if (this.user()) {
      if (value.password !== value.confirmPassword) {
        this.form.controls.confirmPassword.setErrors({ passwordMismatch: true });
        this.toast.error('As senhas não coincidem.', 'Erro');
        return false;
      }
    }

    this.toast.error('Por favor, preencha todos os campos obrigatórios corretamente.', 'Erro');
    return false;
  }

  private setPasswordValidators(): void {
    this.form.controls.password.setValidators([
      Validators.required,
      Validators.minLength(8),
      Validators.pattern(PASSWORD_PATTERN),
    ]);
    this.form.controls.confirmPassword.setValidators([Validators.required]);
    this.refreshPasswordValidity();
  }

  private clearPasswordValidators(): void {
    this.form.controls.password.clearValidators();
    this.form.controls.confirmPassword.clearValidators();
    this.refreshPasswordValidity();
  }

  private refreshPasswordValidity(): void {
    this.form.controls.password.updateValueAndValidity({ emitEvent: false });
    this.form.controls.confirmPassword.updateValueAndValidity({ emitEvent: false });
  }
}
