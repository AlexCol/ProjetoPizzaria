import { Location } from '@angular/common';
import { HttpErrorResponse } from '@angular/common/http';
import { Component, DestroyRef, effect, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ActivatedRoute, Router } from '@angular/router';
import { UsersService } from '../../../../api/generated/users/users.service';
import { LoaderComponent } from '../../../../components/shared/loader/loader';
import { tokenFromRoute } from '../../../../helpers/router/tokenFromRoute';
import { getApiErrorMessage } from '../../../../models/ApiError';
import { notLoggedStyles } from '../not-logged.styles';

@Component({
  selector: 'app-activate-account',
  imports: [LoaderComponent],
  templateUrl: './activate-account.html',
})
export class ActivateAccountComponent {
  /*****************************************/
  /* Propriedades Privadas                 */
  /*****************************************/
  private readonly usersService = inject(UsersService);
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

    this.usersService
      .postApiUsersActivate({ token: this.token() })
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: () => {
          this.status.set('success');
          this.message.set('Conta ativada com sucesso! Redirecionando para a tela de login...');
          this.redirectToLoginIn3Seconds();
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
}
