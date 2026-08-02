import { Component, DestroyRef, inject } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormsModule, NgForm } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { Credentials } from '../../../models/Credentials';
import { AuthService } from '../../../services/auth/auth.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.html',
  styleUrl: './login.css',
  imports: [FormsModule, RouterLink],
})
export class LoginComponent {
  private readonly _authService = inject(AuthService);
  private readonly _toast = inject(ToastrService);
  private readonly _destroyRef = inject(DestroyRef);

  protected readonly credentials: Credentials = {
    email: '',
    password: '',
    remember: false,
  };

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
        },
        error: (error: string) => {
          this._toast.error(error, 'Erro');
        },
      });
  }
}
