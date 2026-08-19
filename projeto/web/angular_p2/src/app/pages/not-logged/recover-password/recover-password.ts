import { HttpErrorResponse } from '@angular/common/http';
import { Component, DestroyRef, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormsModule, NgForm } from '@angular/forms';
import { ToastrService } from 'ngx-toastr';
import { UsersService } from '../../../../api/generated/users/users.service';
import { ButtonComponent } from '../../../../components/shared/button/button';
import { InputComponent } from '../../../../components/shared/input/input';
import { LinkComponent } from '../../../../components/shared/link/link';
import { getApiErrorMessage } from '../../../../models/ApiError';
import { RecoverPassword } from '../../../../models/RecoverPassword';
import { notLoggedStyles } from '../not-logged.styles';

@Component({
  selector: 'app-recover-password',
  imports: [ButtonComponent, LinkComponent, InputComponent, FormsModule],
  templateUrl: './recover-password.html',
})
export class RecoverPasswordComponent {
  /*****************************************/
  /* Propriedades Privadas                 */
  /*****************************************/
  private readonly usersService = inject(UsersService);
  private readonly toast = inject(ToastrService);
  private readonly destroyRef = inject(DestroyRef);

  /*****************************************/
  /* Propriedades Publicas                 */
  /*****************************************/
  status = signal<'idle' | 'loading' | 'success' | 'error'>('idle');
  message = signal<string>('');
  readonly styles = notLoggedStyles; // Estilos utilizados pelo componente.

  readonly credentials: RecoverPassword = {
    email: '',
  };

  /*****************************************/
  /* Metodos Publicos                      */
  /*****************************************/
  // Disparado no submit do formulário. Valida os campos antes de realizar o login.
  sendRequest(form: NgForm): void {
    if (this.status() === 'loading' || !this.validateForm(form)) {
      return;
    }

    this.status.set('loading');
    this.message.set('');

    this.usersService
      .postApiUsersSendPasswordResetEmail({ email: this.credentials.email })
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (response) => {
          this.status.set('success');
          this.message.set(response.message);
        },
        error: (error: HttpErrorResponse) => {
          this.status.set('error');
          this.message.set(getApiErrorMessage(error, 'Não foi possível solicitar a recuperação de senha.'));
        },
      });
  }

  /*****************************************/
  /* Metodos Privados                      */
  /*****************************************/
  private validateForm(form: NgForm): boolean {
    if (!form.invalid) {
      return true;
    }
    form.control.markAllAsTouched();

    if (form.controls['email']?.invalid) {
      this.toast.error('Informe um e-mail válido.', 'Erro');
    }

    return false;
  }
}
