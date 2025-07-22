import { Inject, Injectable, UnauthorizedException } from "@nestjs/common";
import { IHashingService } from "./hashing/hashing.service";
import { UsersService } from "../domain/models/users/users.service";
import { JwtService } from "@nestjs/jwt";
import jwtConfig from "./config/jwt.config";
import { ConfigType } from "@nestjs/config";
import { User } from "../domain/models/users/entities/user.entity";
import { LoginDto } from "./dto/login.dto";
import { UserResponseDto } from "../domain/models/users/dto/response-user.dto";
import { Repository } from "typeorm";
import { InjectRepository } from "@nestjs/typeorm";

@Injectable()
export class AuthService {
  constructor(
    private readonly userService: UsersService, // Assuming UsersService is imported correctly
    private readonly hashingService: IHashingService, // Injecting the hashing service
    private readonly jwtService: JwtService, // Assuming JwtService is imported correctly
    @Inject(jwtConfig.KEY) private readonly jwtConfiguration: ConfigType<typeof jwtConfig>, // Injecting the JWT configuration
  ) {
    //console.log(this.jwtConfiguration);
  }

  async login(loginDto: LoginDto): Promise<{}> {
    const usuario = await this.userService.findByEmail(loginDto.email); // Fetch the user by email

    if (!usuario || !usuario.ativo)
      this.authThrowError();

    const isPasswordValid = await this.hashingService.comparePassword(loginDto.password, usuario!.password); // Check if the password is valid
    if (!isPasswordValid)
      this.authThrowError();

    const tokens = await this.createTokens(usuario!); // Create JWT tokens for the user

    return {
      message: "Login successful",
      ...tokens,
    };
  }

  private async createTokens(user: User) {
    const payload = { id: user.id, permissions: user.permissions }; // Create a payload with the user's ID and email
    const accessToken = await this.signJwtAsync(user.id, this.jwtConfiguration.expiresIn, payload);
    const refreshToken = await this.signJwtAsync(user.id, this.jwtConfiguration.jwtRefreshExpires);
    return {
      accessToken,
      refreshToken
    }
  }

  private async signJwtAsync<T>(id: number, expiresIn: number, payload?: T): Promise<string> {
    return await this.jwtService.signAsync(
      {
        id,
        ...payload
      },
      {
        audience: this.jwtConfiguration.audience,
        issuer: this.jwtConfiguration.issuer,
        expiresIn: expiresIn,
        secret: this.jwtConfiguration.secret,
      }
    );
  }

  private authThrowError() {
    //throw new NotFoundException(); // Throw a NotFoundException if the user is not found
    throw new UnauthorizedException('Invalid credentials');
  }

}