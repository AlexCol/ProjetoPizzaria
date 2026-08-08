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

  changePassword(token: string, password: string, confirmPassword: string) {
    //! sim, o nome da rota no backend é recover-password, mas o nome do metodo aqui é changePassword, pq é isso que ele faz
    return this._httpClient.post<MessageResponse>('/users/recover-password', {
      token,
      password,
      confirmPassword,
    });
  }

  resendActivationEmail(email: string) {
    return this._httpClient.post<MessageResponse>('/users/resend-activation-email', { email });
  }

  activateAccount(token: string) {
    return this._httpClient.post<MessageResponse>('/users/activate', { token });
  }
}
