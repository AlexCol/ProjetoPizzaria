import { CommandHandler, EventBus, ICommandHandler } from "@nestjs/cqrs";
import { UpdateUserCommand } from "../update-user.command";
import { Repository } from "typeorm";
import { User } from "../../../entities/user.entity";
import { InjectRepository } from "@nestjs/typeorm";
import { IHashingService } from "src/modules/auth/hashing/hashing.service";
import { BadRequestException } from "@nestjs/common";

@CommandHandler(UpdateUserCommand)
export class UpdateUserHandler implements ICommandHandler<UpdateUserCommand> {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    private readonly hashingService: IHashingService,
    private readonly eventBus: EventBus,
  ) { }

  async execute(command: UpdateUserCommand): Promise<void> {
    const { id, updateUserDto } = command;

    if (this.passwordDontMatch(updateUserDto.password, updateUserDto.confirmPassword))
      throw new BadRequestException('Passwords do not match');

    const existingUser = await this.userRepository.findOneBy({ id });
    if (!existingUser)
      throw new BadRequestException('User not found');

    if (updateUserDto.password)
      updateUserDto.password = await this.hashingService.hashPassword(updateUserDto.password);

    this.userRepository.merge(existingUser, updateUserDto);
    await this.userRepository.save(existingUser);
  }

  private passwordDontMatch(password: string | undefined, confirmPassword: string | undefined): boolean {
    if (!password && !confirmPassword) return false;
    return password !== confirmPassword;
  }
}