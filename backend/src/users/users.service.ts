import { Injectable } from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { PrismaClient } from '../../generated/prisma/client';

@Injectable()
export class UsersService {
  constructor(private readonly prisma:PrismaClient){}
  async create(createUserDto: CreateUserDto) {
    await this.prisma.user.create({
      data:{
        username:createUserDto.username,
        email:createUserDto.email,
        password:createUserDto.password
      }
    })
  }

  findAll() {
    return `This action returns all users`;
  }

  async findOne(id: string) {
    await this.prisma.user.findFirst({
      where:{
        id
      }
    })
  }

  update(id: number, updateUserDto: UpdateUserDto) {
    return `This action updates a #${id} user`;
  }

  remove(id: number) {
    return `This action removes a #${id} user`;
  }
}
