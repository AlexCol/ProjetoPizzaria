import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { inject, Injectable, signal } from '@angular/core';
import { catchError, map, of, tap } from 'rxjs';
import { processaErros } from '../../models/ApiError';
import { User } from '../../models/User';

type AuthStatus = 'loading' | 'authenticated' | 'anonymous';
type UserSessionPayload = { user: User };

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private readonly _httpClient = inject(HttpClient);
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
  expireSession(): void {
    this.clearUser();
  }

  hasAnyRole(allowedRoles: readonly string[]): boolean {
    const userRole = this.user?.role?.name;
    return !!userRole && allowedRoles.includes(userRole);
  }

  /****************************************/
  /* Metodos Api (Observables)            */
  /****************************************/
  login(email: string, password: string, remember: boolean) {
    return this._httpClient
      .post<UserSessionPayload>(
        '/auth/login',
        { email, password },
        { headers: { 'remember-me': remember ? 'true' : 'false' } },
      )
      .pipe(
        map((payload) => {
          this.setUser(payload.user);
          return payload.user;
        }),
        catchError(processaErros),
      );
  }

  logout() {
    return this._httpClient.post('/auth/logout', {}).pipe(
      tap(() => this.clearUser()),
      catchError(() => {
        this.clearUser();
        return of(null);
      }),
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
  }
}
