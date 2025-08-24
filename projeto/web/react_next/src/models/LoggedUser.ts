type LoggedUser = {
  id: number;
  email: string;
  name: string;
  ativo: boolean;
  permissions: string[];
  criadoEm: Date;
  atualizadoEm: Date;
  Origin: string;
}
export default LoggedUser;