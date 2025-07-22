import { Permission } from "src/common/enums/permissao.enum";

export class TokenPayloadDto {
  id: number;
  permissions: Permission[];
  iat: number;
  exp: number;
  aud: string;
  iss: string;
}
