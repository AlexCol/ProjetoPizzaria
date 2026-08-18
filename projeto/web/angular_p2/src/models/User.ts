import { Role } from "./Role";

/*****************************************/
/* Modelo de Usuario                     */
/*****************************************/
export type User = {
  id: string;
  email: string;
  name: string;
  status: 'Active' | 'Inactive' | 'Blocked';
  roleId?: string;
  role: Role;
}
