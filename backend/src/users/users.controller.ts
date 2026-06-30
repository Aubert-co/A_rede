import { Controller, Post, Body, UseInterceptors, UploadedFile, HttpCode } from '@nestjs/common';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { FileInterceptor } from '@nestjs/platform-express';
import { FIVE_MB, imageFilePipe } from '../common/pipes/images.pipes';


@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Post()
  @UseInterceptors(FileInterceptor("avatar"))
  @HttpCode(201)
  create(@Body() createUserDto: CreateUserDto,
    @UploadedFile(
      imageFilePipe({
        required: false,
        maxSize: FIVE_MB,
      }),
    )
    avatar?: Express.Multer.File,
  ) {
    return this.usersService.create({
      ...createUserDto,
      avatarFile:avatar,
    });
  }
}
