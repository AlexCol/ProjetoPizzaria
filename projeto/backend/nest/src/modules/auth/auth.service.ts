import { Inject, Injectable, UnauthorizedException } from "@nestjs/common";
import { IHashingService } from "./hashing/hashing.service";
import { JwtService } from "@nestjs/jwt";
import jwtConfig from "./config/jwt.config";
import { ConfigType } from "@nestjs/config";
import { User } from "../domain/models/users/entities/user.entity";
import { LoginDto } from "./dto/login.dto";
import { RefreshTokenDto } from "./dto/refresh-token.dto";
import { UsersService } from "../domain/models/users/users.service";
import { TokenPayloadDto } from "./dto/token-payload.dto";

@Injectable()
export class AuthService {
  constructor(
    private readonly userService: UsersService, // Assuming UsersService is imported correctly
    //private readonly queryBus: QueryBus,
    private readonly hashingService: IHashingService, // Injecting the hashing service
    private readonly jwtService: JwtService, // Assuming JwtService is imported correctly
    @Inject(jwtConfig.KEY) private readonly jwtConfiguration: ConfigType<typeof jwtConfig>, // Injecting the JWT configuration
  ) {
    //console.log(this.jwtConfiguration);
  }

  async login(loginDto: LoginDto) {
    const user = await this.userService.findByEmail(loginDto.email); // Fetch the user by email

    //console.log(user);

    if (!user || !user.ativo)
      throw new UnauthorizedException('Invalid credentials!!');

    const isPasswordValid = await this.hashingService.comparePassword(loginDto.password, user!.password); // Check if the password is valid
    if (!isPasswordValid)
      throw new UnauthorizedException('Invalid credentials!');

    const tokens = await this.createTokens(user!); // Create JWT tokens for the user

    return {
      message: "Login successful",
      ...tokens,
      origin: 'njs',
    };
  }

  async refreshTokens(refreshTokenDto: RefreshTokenDto) {
    //const { id } = await this.jwtService.verifyAsync(refreshTokenDto.refreshToken, this.jwtConfiguration); // Verify the refresh token and extract the user ID
    const { id } = await this.verifyJwtAsync(refreshTokenDto.refreshToken); // Verify the refresh token and extract the user ID
    const user = await this.userService.findOne(id); // Find the user by ID
    if (!user || !user.ativo) {
      throw new UnauthorizedException('User not found or inactive');
    }
    const tokens = await this.createTokens(user); // Create new JWT tokens for the user
    return {
      message: "Refresh token successful",
      ...tokens,
      origin: 'njs',
    };
  }

  public async verifyJwtAsync(token: string): Promise<TokenPayloadDto> {
    return await this.jwtService.verifyAsync(token, this.jwtConfiguration);
  }

  private async createTokens(user: User) {
    const payload = { id: user.id, email: user.email, permissions: user.permissions }; // Create a payload with the user's ID and email
    const accessToken = await this.signJwtAsync(user.id, this.jwtConfiguration.expiresIn, payload);
    const refreshToken = await this.signJwtAsync(user.id, this.jwtConfiguration.jwtRefreshExpires);
    return {
      accessToken,
      refreshToken
    }
  }

  private async signJwtAsync<T>(id: number, expiresIn: number, payload?: T): Promise<string> {
    return await this.jwtService.signAsync(
      { id, ...payload },
      {
        subject: id.toString(),
        audience: this.jwtConfiguration.audience,
        issuer: this.jwtConfiguration.issuer,
        expiresIn: expiresIn,
        secret: this.jwtConfiguration.secret,
      }
    );
  }
}