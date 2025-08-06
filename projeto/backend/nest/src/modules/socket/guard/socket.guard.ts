import { Socket } from "socket.io";
import { CustomNestLogger } from "../../logger/logger.service";

// Decorator para exigir autenticação em eventos socket
export function SocketAuthGuard() {
  return function (
    target: any,
    propertyKey: string,
    descriptor: PropertyDescriptor
  ) {
    const originalMethod = descriptor.value;
    descriptor.value = async function (...args: any[]) {
      const client: Socket = args.find((a) => a && a.handshake);
      try {
        await this.verifyToken(client);
        return await originalMethod.apply(this, args);
      } catch (err) {
        client.disconnect();
        throw new Error('Token inválido, desconectando...');
      }
    };
    return descriptor;
  };
}

//deixado aqui mas não estou usando, pois não tenho acesso a DI no decorator
//esse guard não é um guard do nest,
//é um decorator que pode ser usado em métodos de socket
//! usar ele como o primeiro decorator, logo acima do metodo decorado
//! ex:
//? @SubscribeMessage('ping') //ping usando o padrão do socket.io
//? @SocketAuthGuard() //ficar sempre embaixo de SubscribeMessage
//? async handlePing(@MessageBody() _: any, @ConnectedSocket() client: Socket) {