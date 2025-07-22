//fiz com nome de interface para meu entendimento, o Nest não aceita interface como provider
export abstract class IHashingService {
  abstract hashPassword(password: string): Promise<string>;
  abstract comparePassword(password: string, hashedPassword: string): Promise<boolean>;
}
