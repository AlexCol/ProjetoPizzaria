import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { MessageResponse } from '../../models/MessageResponse';

@Injectable({
  providedIn: 'root',
})
export class UsersService {
  private readonly _httpClient = inject(HttpClient);

  /****************************************/
  /* Metodos Api (Observables)            */
  /****************************************/
  recoverPassword(email: string) {
    return this._httpClient.post<MessageResponse>('/users/send-password-reset-email', { email });
  }
}
