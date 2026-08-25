import { Component, DestroyRef, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormsModule, NgForm } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { ButtonComponent } from '../../../../components/shared/button/button';
import { CheckComponent } from '../../../../components/shared/check/check';
import { InputComponent } from '../../../../components/shared/input/input';
import { LinkComponent } from '../../../../components/shared/link/link';
import { Credentials } from '../../../../models/Credentials';
import { AuthStore } from '../../../../stores/auth/auth.store';
import { notLoggedStyles } from '../not-logged.styles';

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
  private readonly authStore = inject(AuthStore);
  private readonly router = inject(Router);
  private readonly activatedRoute = inject(ActivatedRoute);
  private readonly toast = inject(ToastrService);
  private readonly destroyRef = inject(DestroyRef);

  /*****************************************/
  /* Propriedades Publicas                 */
  /*****************************************/
  readonly isLoading = signal(false);
  readonly styles = notLoggedStyles; // Estilos utilizados pelo componente.

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
    if (!this.validateForm(form)) {
      return;
    }

    this.isLoading.set(true);
    this.authStore
      .login(this.credentials.email, this.credentials.password, this.credentials.remember)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (response) => {
          this.toast.success(`Bem-vindo(a) ${response.name}`, 'Sucesso');
          void this.router.navigateByUrl(this.getSafeReturnUrl());
        },
        error: (error: string) => {
          this.toast.error(error, 'Erro');
          this.isLoading.set(false);
        },
      });
  }

  /*****************************************/
  /* Metodos Privados                      */
  /*****************************************/
  //! metodo para validar a url de retorno, caso seja inválida, redireciona para a home
  //! senão, retorna a url de retorno
  //! returnUrl - alimentada em auth.guard.ts
  private getSafeReturnUrl(): string {
    const returnUrl = this.activatedRoute.snapshot.queryParamMap.get('returnUrl');
    if (!returnUrl || !returnUrl.startsWith('/') || returnUrl.startsWith('//')) {
      return '/home';
    }

    const path = returnUrl.split(/[?#]/)[0].toLowerCase();
    if (path === '/auth' || path.startsWith('/auth/')) {
      return '/home';
    }

    try {
      this.router.parseUrl(returnUrl);
      return returnUrl;
    } catch {
      return '/home';
    }
  }

  private validateForm(form: NgForm): boolean {
    if (!form.invalid) {
      return true;
    }
    form.control.markAllAsTouched();

    if (form.controls['email']?.invalid) {
      this.toast.error('Informe um e-mail válido.', 'Erro');
    }
    if (form.controls['password']?.invalid) {
      this.toast.error('Informe sua senha.', 'Erro');
    }

    return false;
  }
}
