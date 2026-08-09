import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { map, Observable, of } from 'rxjs';

type CsrfTokenResponse = { token: string };

@Injectable({
  providedIn: 'root',
})
export class CsrfService {
  private readonly _httpClient = inject(HttpClient);
  private _token: string | undefined;

  get token(): string | undefined {
    return this._token;
  }

  refreshToken(): Observable<string> {
    return this._httpClient.get<CsrfTokenResponse>('/auth/csrf-token').pipe(
      map((response) => {
        const token = response.token?.trim();
        if (!token) {
          throw new Error('The API returned an invalid CSRF token.');
        }
        this._token = token;
        return token;
      }),
    );
  }

  ensureToken(): Observable<string> {
    return this._token ? of(this._token) : this.refreshToken();
  }

  clearToken(): void {
    this._token = undefined;
  }
}
