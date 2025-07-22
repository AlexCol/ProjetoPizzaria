import { Exclude, Expose } from "class-transformer";
import { Permission } from "src/common/enums/permissao.enum";

export class UserResponseDto {
  @Expose()
  id: number;

  @Expose()
  email: string;

  @Expose()
  name: string;

  @Exclude()
  password: string;

  @Expose()
  ativo: boolean;

  @Expose()
  permissions: Permission[];

  @Expose()
  criadoEm: Date;

  @Expose()
  atualizadoEm: Date;
}