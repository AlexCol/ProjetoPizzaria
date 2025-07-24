import { Global, Module } from "@nestjs/common";
import { AuthController } from "./auth.controller";
import { AuthService } from "./auth.service";
import { APP_FILTER, APP_GUARD } from "@nestjs/core";
import { ConfigModule } from "@nestjs/config";
import jwtConfig from "./config/jwt.config";
import { AuthTokenGuard } from "./guards/authToken.guard";
import { DomainModule } from "../domain/domain.module";
import { IHashingService } from "./hashing/hashing.service";
import { BcryptService } from "./hashing/bcrypt.service";
import { JwtModule } from "@nestjs/jwt";
import { PermissionGuard } from "./guards/permission.guard";
import { AuthObfuscationFilter } from "./filters/authObfuscation.filter";

@Global()
@Module({
  imports: [
    //ConfigModule.forRoot({ load: [jwtConfig] }), // Exemplo, caso fosse importado no App e desejasse ser global
    ConfigModule.forFeature(jwtConfig), // Importing the ConfigModule for JWT configuration
    JwtModule.registerAsync(jwtConfig.asProvider()), // Registering the JwtModule with the JWT configuration
    DomainModule
  ],
  controllers: [AuthController],
  providers: [
    AuthService,
    { provide: IHashingService, useClass: BcryptService }, // Providing the IHashingService interface with the BcryptService implementation
    { provide: APP_GUARD, useClass: AuthTokenGuard },
    { provide: APP_GUARD, useClass: PermissionGuard },
    //{ provide: APP_FILTER, useClass: AuthObfuscationFilter }, // Registering the AuthObfuscationFilter to handle exceptions globally
  ],
  exports: [
    IHashingService, // Exporting the IHashingService to be used in other modules
  ]

})
export class AuthModule { }