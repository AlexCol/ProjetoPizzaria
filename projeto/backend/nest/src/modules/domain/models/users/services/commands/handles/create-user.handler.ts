
import { CommandHandler, EventBus, ICommandHandler } from '@nestjs/cqrs';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { IHashingService } from 'src/modules/auth/hashing/hashing.service';
import { BadRequestException } from '@nestjs/common';
import { Permission } from 'src/common/enums/permissao.enum';
import { CreateUserCommand } from '../create-user.command';
import { User } from '../../../entities/user.entity';
import { UserCreatedEvent } from '../../events/user-created.event';
import { plainToInstance } from 'class-transformer';
import { UserResponseDto } from '../../../dto/response-user.dto';

@CommandHandler(CreateUserCommand)
export class CreateUserHandler implements ICommandHandler<CreateUserCommand> {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    private readonly hashingService: IHashingService,
    private readonly eventBus: EventBus,
  ) { }

  async execute(command: CreateUserCommand): Promise<User> {
    const { createUserDto, isAdmin } = command;

    if (!isAdmin && createUserDto.permissions.find(p => p === Permission.ADMIN))
      throw new BadRequestException('Cannot create a user with ADMIN permission directly');

    if (this.passwordDontMatch(createUserDto.password, createUserDto.confirmPassword))
      throw new BadRequestException('Passwords do not match');

    const existingUser = await this.userRepository.findOne({ where: { email: createUserDto.email } });
    if (existingUser)
      throw new BadRequestException('Email already exists');

    createUserDto.password = await this.hashingService.hashPassword(createUserDto.password);

    const user = this.userRepository.create(createUserDto);
    await this.userRepository.save(user);

    // Publicar evento
    this.eventBus.publish(new UserCreatedEvent(user.id, user.email));

    return plainToInstance(UserResponseDto, user, { excludeExtraneousValues: true }); // Transforming the user entity to UserResponseDto
  }

  private passwordDontMatch(password: string | undefined, confirmPassword: string | undefined): boolean {
    if (!password && !confirmPassword) return false;
    return password !== confirmPassword;
  }
}