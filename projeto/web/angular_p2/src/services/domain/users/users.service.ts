import { HttpClient, HttpParams } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { MessageResponse } from '../../../models/MessageResponse';
import { PaginatedData } from '../../../models/PaginatedData';
import { User } from '../../../models/User';
import { CreateUserRequest, SortOrder, UpdateUserRequest, UserSortField } from './user.interfaces';

@Injectable({
  providedIn: 'root',
})
export class UsersService {
  /*****************************************/
  /* Propriedades Privadas                 */
  /*****************************************/
  private readonly _httpClient = inject(HttpClient);

  /*****************************************/
  /* Metodos Api (Observables)            */
  /*****************************************/
  getAllUsers() {
    return this._httpClient.get<User[]>('/users');
  }

  getUsers(
    page: number,
    limit: number,
    name = '',
    roleId?: string,
    sortField: UserSortField = 'Name',
    sortOrder: SortOrder = 'asc',
  ) {
    let params = new HttpParams()
      .set('page', page)
      .set('limit', limit)
      .set('sort-field', sortField)
      .set('sort-order', sortOrder);

    if (name.trim()) params = params.set('name', name.trim());
    if (roleId !== undefined) params = params.set('roleId', roleId);

    return this._httpClient.get<PaginatedData<User>>('/users/search', { params });
  }

  createUser(user: CreateUserRequest) {
    return this._httpClient.post<MessageResponse>('/users', user);
  }

  updateUser(id: string, user: UpdateUserRequest) {
    return this._httpClient.patch<MessageResponse>(`/users/${id}`, user);
  }

  deleteUser(id: string) {
    return this._httpClient.delete<void>(`/users/${id}`);
  }

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
