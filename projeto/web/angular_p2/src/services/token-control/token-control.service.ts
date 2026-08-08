import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class TokenControlService {
  private readonly _httpClient = inject(HttpClient);

  /****************************************/
  /* Metodos Api (Observables)            */
  /****************************************/
  validateToken(token: string) {
    return this._httpClient.get<void>(`/tokencontrol/is-token-valid/${token}`);
  }
}
