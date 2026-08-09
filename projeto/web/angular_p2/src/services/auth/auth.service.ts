import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { inject, Injectable, signal } from '@angular/core';
import { Router } from '@angular/router';
import { catchError, map, of, switchMap, tap } from 'rxjs';
import { processaErros } from '../../models/ApiError';
import { User } from '../../models/User';
import { CsrfService } from '../security/csrf.service';

type AuthStatus = 'loading' | 'authenticated' | 'anonymous';
type UserSessionPayload = { user: User };

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private readonly _httpClient = inject(HttpClient);
  private readonly _router = inject(Router);
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
        this._httpClient.post<UserSessionPayload>(
          '/auth/login',
          { email, password },
          { headers: { 'remember-me': remember ? 'true' : 'false' } },
        ),
      ),
      // faz novo refresh para ser usado para requisições subsequentes
      switchMap((payload) => this._csrfService.refreshToken().pipe(map(() => payload))),
      map((payload) => {
        this.setUser(payload.user);
        return payload.user;
      }),
      catchError(processaErros),
    );
  }

  logout() {
    return this._httpClient.post('/auth/logout', {}).pipe(
      tap(() => this.clearUserAndRedirectToLogin()),
      catchError(processaErros),
    );
  }

  getMe() {
    return this._httpClient.get<UserSessionPayload>('/auth/session').pipe(
      map((payload) => {
        this.setUser(payload.user);
        return payload.user;
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
