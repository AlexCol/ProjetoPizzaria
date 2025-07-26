import { FastifyRequest } from 'fastify';
import { Permission } from '../../../../common/enums/permissao.enum';
import { TokenPayloadDto } from '../../dto/token-payload.dto';

declare module 'fastify' {
  interface FastifyRequest {
    tokenPayload?: TokenPayloadDto;
  }
}

// lembrar de adicionar
//   "include": [
//     "src/**/*",
//     "src/**/*.d.ts"
//   ]
// no tsconfig.json para que o TypeScript reconheça este arquivo de declaração.
//! pode não ser necessário
