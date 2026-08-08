import { HttpErrorResponse } from '@angular/common/http';
import { Component, DestroyRef, effect, inject, input, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { AbstractControl, FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { ButtonComponent } from '../../../../components/shared/button/button';
import { InputComponent } from '../../../../components/shared/input/input';
import { UsersService } from '../../../../services/users/users.service';
import { notLoggedStyles } from '../not-logged.styles';

const PASSWORD_PATTERN = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[\W_]).+$/;

function equalValues(controlName1: string, controlName2: string) {
  return (control: AbstractControl) => {
    const value1 = control.get(controlName1)?.value;
    const value2 = control.get(controlName2)?.value;

    if (value1 !== value2) {
      return { valuesNotEqual: true };
    }
    return null;
  };
}

@Component({
  selector: 'app-password-change',
  imports: [ButtonComponent, InputComponent, ReactiveFormsModule],
  templateUrl: './password-change.html',
})
export class PasswordChangeComponent {
  /*****************************************/
  /* Propriedades Privadas                 */
  /*****************************************/
  private readonly usersService = inject(UsersService);
  private readonly toast = inject(ToastrService);
  private readonly router = inject(Router);
  private readonly destroyRef = inject(DestroyRef);

  /*****************************************/
  /* Inputs e Outputs                      */
  /*****************************************/
  readonly token = input.required<string>();

  /*****************************************/
  /* Propriedades Publicas                 */
  /*****************************************/
  readonly status = signal<'idle' | 'loading' | 'success' | 'error'>('idle');
  readonly message = signal<string>('');
  readonly styles = notLoggedStyles; // Estilos utilizados pelo componente.

  readonly form = new FormGroup(
    {
      password: new FormControl('', {
        nonNullable: true,
        validators: [Validators.required, Validators.pattern(PASSWORD_PATTERN)],
      }),
      confirmPassword: new FormControl('', {
        nonNullable: true,
        validators: [Validators.required],
      }),
    },
    {
      validators: [equalValues('password', 'confirmPassword')],
      updateOn: 'blur', // Atualiza a validação do FormGroup apenas quando o usuário sair do campo.
    },
  );

  /*****************************************/
  /* Metodos Construtor                    */
  /*****************************************/
  constructor() {
    // Valida o token recebido ao carregar a tela antes de permitir a alteração da senha.
    effect(this.handleEffect);
  }

  /*****************************************/
  /* Metodos Publicos                      */
  /*****************************************/

  // Disparado no submit. Valida os campos individualmente e também as regras que dependem do FormGroup.
  sendRequest(): void {
    if (!this.validateForm()) {
      return;
    }

    const { password, confirmPassword } = this.form.getRawValue();
    this.status.set('loading');
    this.usersService
      .changePassword(this.token(), password, confirmPassword)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: () => {
          this.status.set('success');
          this.message.set('Senha alterada com sucesso. Sendo redirecionado para a tela de login em 3 segundos...');
          this.redirectToLoginIn3Seconds();
        },
        error: (error: HttpErrorResponse) => {
          this.status.set('error');
          this.message.set(error.error?.Message ?? 'Não foi possível alterar a senha.');
          this.redirectToLoginIn3Seconds();
        },
      });
  }

  /*****************************************/
  /* Metodos Privados                      */
  /*****************************************/
  private redirectToLoginIn3Seconds(): void {
    setTimeout(() => {
      void this.router.navigateByUrl('/login');
    }, 3000);
  }

  private readonly handleEffect = (): void => {
    if (!this.token()) {
      this.status.set('error');
      this.message.set('Token inválido');
      this.redirectToLoginIn3Seconds();
    }
  };

  private validateForm(): boolean {
    if (!this.form.invalid) {
      return true;
    }

    this.form.markAllAsTouched();

    if (this.form.controls.password.touched && this.form.controls.password.hasError('required')) {
      this.toast.error('Informe sua nova senha.', 'Erro');
    }
    if (this.form.controls.password.touched && this.form.controls.password.hasError('pattern')) {
      this.toast.error(
        'A senha deve conter ao menos uma letra maiúscula, uma minúscula, um número e um símbolo.',
        'Erro',
      );
    }
    if (this.form.controls.confirmPassword.touched && this.form.controls.confirmPassword.hasError('required')) {
      this.toast.error('Informe a confirmação da nova senha.', 'Erro');
    }
    if (this.form.hasError('valuesNotEqual')) {
      this.toast.error('A senha e a confirmação da senha não coincidem.', 'Erro');
    }

    return false;
  }
}

/*
        @if (form.controls.password.touched && form.controls.password.hasError('required')) {
          <small id="password-error" [class]="styles.validationError"> Informe sua nova senha. </small>
        } @else if (form.controls.password.touched && form.controls.password.hasError('pattern')) {
          <small id="password-error" [class]="styles.validationError">
            A senha deve conter ao menos uma letra maiúscula, uma minúscula, um número e um símbolo.
          </small>
        }
*/
