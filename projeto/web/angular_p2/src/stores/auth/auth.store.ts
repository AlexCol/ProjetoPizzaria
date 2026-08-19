import { HttpErrorResponse } from '@angular/common/http';
import { inject, Injectable, signal } from '@angular/core';
import { Router } from '@angular/router';
import { catchError, map, of, switchMap, tap } from 'rxjs';
import { AuthService } from '../../api/generated/auth/auth.service';
import { ResponseUserDto } from '../../api/generated/models';
import { processaErros } from '../../models/ApiError';
import { User } from '../../models/User';
import { CsrfService } from '../../services/security/csrf.service';

type AuthStatus = 'loading' | 'authenticated' | 'anonymous';
@Injectable({
  providedIn: 'root',
})
export class AuthStore {
  private readonly _router = inject(Router);
  private readonly _api = inject(AuthService);
  private readonly _csrfService = inject(CsrfService);
  private _userData = signal<User | undefined>(undefined);
  private readonly _status = signal<AuthStatus>('loading');

  /****************************************/
  /* Getters                              */
  /****************************************/
  get user() {
    return this._userData();
  }

  get isAuthenticated() {
    return this._status() === 'authenticated';
  }

  get isLoading() {
    return this._status() === 'loading';
  }
  /****************************************/
  /* Metodos publicos                     */
  /****************************************/
  initialize() {
    //faz refresh token antes de chamar o me
    return this._csrfService.refreshToken().pipe(
      switchMap(() => this.getMe()),
      catchError(() => {
        this.clearUser();
        return of(null);
      }),
    );
  }

  expireSession(): void {
    this.clearUserAndRedirectToLogin();
  }

  hasAnyRole(allowedRoles: readonly string[]): boolean {
    const userRole = this.user?.role?.name;
    return !!userRole && allowedRoles.includes(userRole);
  }

  /****************************************/
  /* Metodos Api (Observables)            */
  /****************************************/
  login(email: string, password: string, remember: boolean) {
    // faz refresh token antes de chamar o login
    return this._csrfService.ensureToken().pipe(
      switchMap(() =>
        this._api.postApiAuthLogin(
          { email, password },
          {
            headers: { 'remember-me': remember ? 'true' : 'false' },
          },
        ),
      ),
      switchMap((payload) => this._csrfService.refreshToken().pipe(map(() => payload))), //? faz novo refresh para ser usado para requisições subsequentes
      map((payload) => {
        const user = this.toUser(payload.user);
        this.setUser(user);
        return user;
      }),
      catchError(processaErros),
    );
  }

  logout() {
    return this._api.postApiAuthLogout().pipe(
      tap(() => this.clearUserAndRedirectToLogin()),
      catchError(processaErros),
    );
  }

  getMe() {
    return this._api.getApiAuthSession().pipe(
      map((payload) => {
        const user = this.toUser(payload.user);
        this.setUser(user);
        return user;
      }),
      catchError((error: HttpErrorResponse) => {
        const hadUser = this._userData() !== undefined;
        this.clearUser();
        if (hadUser) {
          return processaErros(error);
        }
        return of(null);
      }),
    );
  }

  /****************************************/
  /* Metodos Privados                     */
  /****************************************/
  private setUser(user: User) {
    this._userData.set(user);
    this._status.set('authenticated');
  }

  private toUser(user: ResponseUserDto | undefined): User {
    if (user?.id === null || user?.id === undefined || !user.email || !user.name || !user.status || !user.role?.name) {
      throw new Error('A API retornou uma sessao de usuario invalida.');
    }

    return {
      id: String(user.id),
      email: user.email,
      name: user.name,
      status: user.status,
      roleId: user.roleId === null || user.roleId === undefined ? undefined : String(user.roleId),
      role: {
        id: String(user.role.id ?? user.roleId ?? ''),
        name: user.role.name,
      },
    };
  }

  private clearUser() {
    this._userData.set(undefined);
    this._status.set('anonymous');
    this._csrfService.clearToken();
  }

  private clearUserAndRedirectToLogin() {
    const wasAuthenticated = this.isAuthenticated;
    this.clearUser();

    if (wasAuthenticated) {
      void this._router.navigateByUrl('/auth/login');
    }
  }
}
