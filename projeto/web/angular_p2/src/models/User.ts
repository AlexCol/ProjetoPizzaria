import { Role } from "./Role";

/*****************************************/
/* Modelo de Usuario                     */
/*****************************************/
export type User = {
  id: number;
  email: string;
  name: string;
  status: 'Active' | 'Inactive' | 'Blocked';
  roleId?: number;
  role: Role;
}
