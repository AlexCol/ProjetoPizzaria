import { Permission } from "src/common/enums/permissao.enum";

export class TokenPayloadDto {
  id: number;
  permissions: Permission[];
  iat: number;
  exp: number;
  aud: string;
  iss: string;
}

/*
esse DTO é só pra poder usar o autocomplete do Typescript,
ao realizar
  await this.jwtService.verifyAsync(token, this.jwtConfiguration)
será alimentado na variavel todo o payload do token, não só o que tem no dto,
o payload (fora o padrão do JWT) é criado em AuthService

payload === claims
*/