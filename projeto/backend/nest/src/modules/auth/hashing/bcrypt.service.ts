import { IHashingService } from "./hashing.service";
import * as bcrypt from "bcrypt";

export class BcryptService implements IHashingService {
  async hashPassword(password: string): Promise<string> {
    const salt = await bcrypt.genSalt();
    return bcrypt.hash(password, salt);
  }

  async comparePassword(password: string, hashedPassword: string): Promise<boolean> {
    return await bcrypt.compare(password, hashedPassword);
  }
}
