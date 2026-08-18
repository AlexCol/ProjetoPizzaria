/*****************************************/
/* Ordenacao de Usuario                  */
/*****************************************/
export type UserSortField = 'Name' | 'Email' | 'RoleId' | 'Status';
export type SortOrder = 'asc' | 'desc';

/*****************************************/
/* Criacao de Usuario                    */
/*****************************************/
export interface CreateUserRequest {
  email: string;
  name: string;
  password: string;
  confirmPassword: string;
  roleId: string;
}

/*****************************************/
/* Atualizacao de Usuario                */
/*****************************************/
export interface UpdateUserRequest {
  name: string;
  roleId: string;
}
