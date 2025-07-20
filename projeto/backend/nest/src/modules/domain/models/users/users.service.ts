import { Injectable } from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from './entities/user.entity';
import { Repository } from 'typeorm';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) { }
  async findAll() {
    return this.userRepository.find();
  }

  async create(data: CreateUserDto) {
    const user = this.userRepository.create(data);
    await this.userRepository.save(user);
    return user;
  }

  async findOne(id: number) {
    return this.userRepository.findOne({ where: { id } });
  }
}
