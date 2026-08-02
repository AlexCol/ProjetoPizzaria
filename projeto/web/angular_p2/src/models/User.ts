import { Role } from "./Role";

export type User = {
  id: string;
  email: string;
  name: string;
  status: 'Active' | 'Inactive';
  role: Role;
}
