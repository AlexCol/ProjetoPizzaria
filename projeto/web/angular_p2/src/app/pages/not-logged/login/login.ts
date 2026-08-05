import { Component, DestroyRef, inject } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormsModule, NgForm } from '@angular/forms';
import { Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { ButtonComponent } from '../../../../components/shared/button/button';
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
  imports: [ButtonComponent, FormsModule, LinkComponent],
})
export class LoginComponent {
  private readonly _authService = inject(AuthService);
  private readonly _router = inject(Router);
  private readonly _toast = inject(ToastrService);
  private readonly _destroyRef = inject(DestroyRef);

  protected readonly credentials: Credentials = {
    email: '',
    password: '',
    remember: false,
  };

  protected get styles() {
    return loginStyles;
  }

  protected login(form: NgForm): void {
    if (form.invalid) {
      form.control.markAllAsTouched();
      return;
    }

    this._authService
      .login(this.credentials.email, this.credentials.password, this.credentials.remember)
      .pipe(takeUntilDestroyed(this._destroyRef))
      .subscribe({
        next: (response) => {
          this._toast.success(`Bem-vindo(a) ${response.name}`, 'Sucesso');
          void this._router.navigateByUrl('/home');
        },
        error: (error: string) => {
          this._toast.error(error, 'Erro');
        },
      });
  }
}
