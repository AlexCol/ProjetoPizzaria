import { Component, DestroyRef, inject } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormsModule, NgForm } from '@angular/forms';
import { Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { ButtonComponent } from '../../../../components/shared/button/button';
import { CheckComponent } from '../../../../components/shared/check/check';
import { InputComponent } from '../../../../components/shared/input/input';
import { LinkComponent } from '../../../../components/shared/link/link';
import { Credentials } from '../../../../models/Credentials';
import { AuthService } from '../../../../services/auth/auth.service';
import { loginStyles } from './login.styles';

@Component({
  selector: 'app-login',
  templateUrl: './login.html',
  host: {
    '[class]': 'styles.host',
  },
  imports: [ButtonComponent, CheckComponent, FormsModule, InputComponent, LinkComponent],
})
export class LoginComponent {
  /*****************************************/
  /* Propriedades Privadas                 */
  /*****************************************/
  private readonly authService = inject(AuthService);
  private readonly router = inject(Router);
  private readonly toast = inject(ToastrService);
  private readonly destroyRef = inject(DestroyRef);

  /*****************************************/
  /* Propriedades Publicas                 */
  /*****************************************/
  readonly styles = loginStyles; // Estilos utilizados pelo componente.

  readonly credentials: Credentials = {
    email: '',
    password: '',
    remember: false,
  };

  /*****************************************/
  /* Metodos Publicos                      */
  /*****************************************/

  // Disparado no submit do formulário. Valida os campos antes de realizar o login.
  login(form: NgForm): void {
    if (form.invalid) {
      form.control.markAllAsTouched();
      return;
    }

    this.authService
      .login(this.credentials.email, this.credentials.password, this.credentials.remember)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (response) => {
          this.toast.success(`Bem-vindo(a) ${response.name}`, 'Sucesso');
          void this.router.navigateByUrl('/home');
        },
        error: (error: string) => {
          this.toast.error(error, 'Erro');
        },
      });
  }
}
