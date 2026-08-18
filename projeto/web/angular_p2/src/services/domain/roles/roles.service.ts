import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Role } from '../../../models/Role';

@Injectable({ providedIn: 'root' })
export class RolesService {
  /*****************************************/
  /* Propriedades Privadas                 */
  /*****************************************/
  private readonly httpClient = inject(HttpClient);

  /*****************************************/
  /* Metodos Api (Observables)             */
  /*****************************************/
  getRoles() {
    return this.httpClient.get<Role[]>('/roles');
  }
}
