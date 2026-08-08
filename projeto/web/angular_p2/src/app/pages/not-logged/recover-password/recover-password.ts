import { HttpErrorResponse } from '@angular/common/http';
import { Component, DestroyRef, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormsModule, NgForm } from '@angular/forms';
import { ToastrService } from 'ngx-toastr';
import { ButtonComponent } from '../../../../components/shared/button/button';
import { InputComponent } from '../../../../components/shared/input/input';
import { LinkComponent } from '../../../../components/shared/link/link';
import { RecoverPassword } from '../../../../models/RecoverPassword';
import { UsersService } from '../../../../services/users/users.service';
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
  requestSended = signal(false); // Indica se a requisição de login foi enviada.
  readonly styles = notLoggedStyles; // Estilos utilizados pelo componente.

  readonly credentials: RecoverPassword = {
    email: '',
  };

  /*****************************************/
  /* Metodos Publicos                      */
  /*****************************************/
  // Disparado no submit do formulário. Valida os campos antes de realizar o login.
  sendRequest(form: NgForm): void {
    if (!this.validateForm(form)) {
      return;
    }
    this.usersService
      .recoverPassword(this.credentials.email)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: () => {
          // this.toast.success(response.message, 'Sucesso');
          this.requestSended.set(true);
        },
        error: (error: HttpErrorResponse) => {
          this.toast.error(error.error.Message, 'Erro');
        },
      });
  }

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
