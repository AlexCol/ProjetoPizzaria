import { Location } from '@angular/common';
import { HttpErrorResponse } from '@angular/common/http';
import { Component, DestroyRef, effect, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { ButtonComponent } from '../../../../components/shared/button/button';
import { InputComponent } from '../../../../components/shared/input/input';
import { LoaderComponent } from '../../../../components/shared/loader/loader';
import { equalValues } from '../../../../helpers/formValidators/equalValues';
import { tokenFromRoute } from '../../../../helpers/router/tokenFromRoute';
import { getApiErrorMessage } from '../../../../models/ApiError';
import { UsersService } from '../../../../services/domain/users/users.service';
import { TokenControlService } from '../../../../services/token-control/token-control.service';
import { notLoggedStyles } from '../not-logged.styles';

const PASSWORD_PATTERN = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[\W_]).+$/;
@Component({
  selector: 'app-password-change',
  imports: [ButtonComponent, InputComponent, LoaderComponent, ReactiveFormsModule],
  templateUrl: './password-change.html',
})
export class PasswordChangeComponent {
  /*****************************************/
  /* Propriedades Privadas                 */
  /*****************************************/
  private readonly usersService = inject(UsersService);
  private readonly tokenControlService = inject(TokenControlService);
  private readonly toast = inject(ToastrService);
  private readonly router = inject(Router);
  private readonly activatedRoute = inject(ActivatedRoute);
  private readonly location = inject(Location);
  private readonly destroyRef = inject(DestroyRef);
  private redirectTimer?: ReturnType<typeof setTimeout>;

  /*****************************************/
  /* Inputs e Outputs                      */
  /*****************************************/
  readonly token = signal(tokenFromRoute(this.activatedRoute));

  /*****************************************/
  /* Propriedades Publicas                 */
  /*****************************************/
  readonly status = signal<'idle' | 'loading' | 'success' | 'error'>('loading');
  readonly message = signal<string>('');
  readonly styles = notLoggedStyles; // Estilos utilizados pelo componente.

  readonly form = new FormGroup(
    {
      password: new FormControl('', {
        nonNullable: true,
        validators: [Validators.required, Validators.minLength(8), Validators.pattern(PASSWORD_PATTERN)],
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
    this.destroyRef.onDestroy(this.clearRedirectTimer);
    this.removeTokenFromAddressBar();
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
          this.message.set(getApiErrorMessage(error, 'Não foi possível alterar a senha.'));
          this.redirectToLoginIn3Seconds();
        },
      });
  }

  /*****************************************/
  /* Metodos Privados                      */
  /*****************************************/
  private redirectToLoginIn3Seconds(): void {
    this.clearRedirectTimer();
    this.redirectTimer = setTimeout(() => {
      this.redirectTimer = undefined;
      void this.router.navigateByUrl('/auth/login');
    }, 3000);
  }

  private readonly clearRedirectTimer = (): void => {
    if (this.redirectTimer) {
      clearTimeout(this.redirectTimer);
      this.redirectTimer = undefined;
    }
  };

  private readonly handleEffect = (): void => {
    if (!this.token()) {
      this.status.set('error');
      this.message.set('Token inválido');
      this.redirectToLoginIn3Seconds();
      return;
    }

    this.status.set('loading');

    this.tokenControlService
      .validateToken(this.token())
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: () => {
          this.status.set('idle');
          this.message.set('');
        },
        error: (error: HttpErrorResponse) => {
          this.status.set('error');
          this.message.set(getApiErrorMessage(error, 'Token inválido'));
          this.redirectToLoginIn3Seconds();
        },
      });
  };

  private removeTokenFromAddressBar(): void {
    this.location.replaceState(this.router.url.split(/[?#]/)[0]);
  }

  // Valida o formulário no submit e exibe apenas o primeiro erro encontrado para evitar múltiplos toasts.
  private validateForm(): boolean {
    if (this.form.valid) {
      return true;
    }

    this.form.markAllAsTouched();

    const password = this.form.controls.password;
    const confirmPassword = this.form.controls.confirmPassword;

    if (password.hasError('required')) {
      this.toast.error('Informe sua nova senha.', 'Erro');
    }
    if (password.hasError('minlength')) {
      this.toast.error('A senha deve possuir pelo menos 8 caracteres.', 'Erro');
    }
    if (password.hasError('pattern'))
      this.toast.error(
        'A senha deve conter ao menos uma letra maiúscula, uma minúscula, um número e um símbolo.',
        'Erro',
      );
    if (confirmPassword.hasError('required')) {
      this.toast.error('Informe a confirmação da nova senha.', 'Erro');
    }
    if (this.form.hasError('valuesNotEqual')) {
      this.toast.error('A senha e a confirmação da senha não coincidem.', 'Erro');
    }
    return false;
  }
}
