import { BadRequestException, Injectable } from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from './entities/user.entity';
import { Repository } from 'typeorm';
import { IHashingService } from 'src/modules/auth/hashing/hashing.service';
import { plainToInstance } from 'class-transformer';
import { UserResponseDto } from './dto/response-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { Permission } from 'src/common/enums/permissao.enum';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    private readonly hashingService: IHashingService, // Injecting the hashing service
  ) { }

  // async findAll() {
  //   const users = await this.userRepository.find();
  //   return plainToInstance(UserResponseDto, users, { excludeExtraneousValues: true });
  // }

  async findOne(id: number) {
    const user = await this.userRepository.findOne({ where: { id } });
    return plainToInstance(UserResponseDto, user, { excludeExtraneousValues: true }); // Transforming the user entity to UserResponseDto
  }

  async findByEmail(email: string) { //used for login, so password can be returned
    const user = await this.userRepository.findOne({ where: { email } });
    return user;
  }

  // async create(data: CreateUserDto, isAdmin: boolean = false) {
  //   if (!isAdmin && data.permissions.find(p => p === Permission.ADMIN))
  //     throw new BadRequestException('Cannot create a user with ADMIN permission directly');

  //   if (this.passwordDontMatch(data.password, data.confirmPassword))
  //     throw new BadRequestException('Passwords do not match');

  //   const existingUser = await this.userRepository.findOne({ where: { email: data.email } });
  //   if (existingUser)
  //     throw new BadRequestException('Email already exists');

  //   data.password = await this.hashingService.hashPassword(data.password);

  //   const user = this.userRepository.create(data);
  //   await this.userRepository.save(user);
  //   return plainToInstance(UserResponseDto, user, { excludeExtraneousValues: true }); // Transforming the user entity to UserResponseDto
  // }

  // async update(id: number, data: UpdateUserDto) {
  //   if (this.passwordDontMatch(data.password, data.confirmPassword))
  //     throw new BadRequestException('Passwords do not match');

  //   const existingUser = await this.userRepository.findOneBy({ id });
  //   if (!existingUser)
  //     throw new BadRequestException('User not found');

  //   if (data.password)
  //     data.password = await this.hashingService.hashPassword(data.password);

  //   this.userRepository.merge(existingUser, data);
  //   await this.userRepository.save(existingUser);
  // }

  // private passwordDontMatch(password: string | undefined, confirmPassword: string | undefined): boolean {
  //   if (!password && !confirmPassword) return false;
  //   return password !== confirmPassword;
  // }
}