import { HttpErrorResponse } from '@angular/common/http';
import { Component, DestroyRef, effect, inject, input, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { UsersService } from '../../../../services/users/users.service';
import { notLoggedStyles } from '../not-logged.styles';

@Component({
  selector: 'app-activate-account',
  imports: [ReactiveFormsModule],
  templateUrl: './activate-account.html',
})
export class ActivateAccountComponent {
  /*****************************************/
  /* Propriedades Privadas                 */
  /*****************************************/
  private readonly usersService = inject(UsersService);
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

  /*****************************************/
  /* Metodos Construtor                    */
  /*****************************************/
  constructor() {
    // Valida o token recebido ao carregar a tela antes de permitir a alteração da senha.
    effect(this.handleEffect);
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

    this.usersService
      .activateAccount(this.token())
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: () => {
          this.status.set('success');
          this.message.set('Conta ativada com sucesso! Redirecionando para a tela de login...');
          this.redirectToLoginIn3Seconds();
        },
        error: (error: HttpErrorResponse) => {
          this.status.set('error');
          this.message.set(error.error?.Message ?? 'Token inválido');
          this.redirectToLoginIn3Seconds();
        },
      });
  };
}
