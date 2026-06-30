import { ConflictException, Inject, Injectable, InternalServerErrorException, Logger } from '@nestjs/common';
import {  CreateUserInput } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import {  PrismaClient } from '@prisma/client';
import { StorageService } from '../storage/storage.service';
import { FILE_STORAGE } from '../storage/fileStorage.token';
import { generatePath } from '../common/imageUplaod/generatePath';
import { UploadAvatars, UploadImageDTO } from './dto/uploadAvatars';
import { hashPassword } from '../common/hashPassword/hash';
import { User } from '@prisma/client';
import { getErrorMessage } from '../common/utils/errors.utils';
@Injectable()
export class UsersService {
  private readonly logger = new Logger(UsersService.name)
  constructor(private readonly prisma:PrismaClient ,@Inject(FILE_STORAGE) private readonly storage:StorageService){}

  protected async uploadImage({file,tmpKey,finalKey}:UploadImageDTO):Promise<UploadAvatars>{
    if(!file) {
      return {
        tmpKey:"",
        success:true,
        finalKey:""
      }
    }
    const response =  await this.storage.uploadImage({
      fileBuffer:file.buffer,
      mimeType:file.mimetype,
      urlPath:tmpKey
    })
    return {
      ...response,
      finalKey,
      tmpKey
    }
  }
  async create(createUser: CreateUserInput) {
    let user:User;
    await this.findByUser(createUser.username,createUser.email)
    
    const {extension,id} = generatePath(createUser.avatarFile?.originalname)
    const tmpKey = `tmp/${id}${extension}`
    const finalKey = `files/${id}.webp`
    
    const {hash,success} =await hashPassword(createUser.password)
    if(!success){
      this.logger.error({
        context: 'UsersService',
        method: 'create',
        action: 'hash password',
        status: 'error',
        message: 'Internal error while hashing user password',
      })
      throw new InternalServerErrorException("Failed to create user")
    }
    try{
      
       user = await this.prisma.user.create({
        data:{
          username:createUser.username,
          email:createUser.email,
          password:hash,
          name:createUser.nickname,
          bio:createUser.bio,
          status:createUser.status,
          avatarKey:tmpKey || null,
          avatarUrl:finalKey || null
        } 
      })
      
    }catch(err:unknown){

      this.logger.error({
        context: 'UsersService',
        method: 'create',
        action: 'create user db',
        status: 'error',
        message: 'Internal error while creating user in database',
        error:getErrorMessage(err),
      })
      throw new InternalServerErrorException("Failed to create a user")
    }
    const uploadAvatars = await this.uploadImage({
        file:createUser.avatarFile,
        finalKey,
        tmpKey
      })
      if(!uploadAvatars.success){
        await this.remove(user.id)
        
       this.logger.error({
        context: 'UsersService',
        method: 'create',
        action: 'rollback user',
        status: 'error',
        message: 'Rollback user failed after avatar upload failure',
        userId: user.id,

      })
        throw new InternalServerErrorException('Failed to upload avatar');
      }
      this.logger.log({
        context: 'UsersService',
        method: 'create',
        action: 'create user',
        status: 'success',
        message: 'User created successfully',
        userId: user.id,
      })
      return {
        message:"success"
      }
  }

  findAll() {
    return `This action returns all users`;
  }

  async findByUser(username:string,email:string) {
    try{
        const user =  await this.prisma.user.findFirst({
          where:{
            OR: [
              { username },
              { email },
            ]
          }
        })
      if(user)throw new ConflictException("User already exists")
    }catch(err:unknown){
      this.logger.error({
        context: 'UsersService',
        method: 'findByUsername',
        action: 'find user by username',
        status: 'error',
        message: 'Error finding user by username',
        error: getErrorMessage(err),
      })
      throw new InternalServerErrorException('Error finding user by username');
    }
  }

  update(id: number, updateUserDto: UpdateUserDto) {
    return `This action updates a #${id} user`;
  }

  async remove(id: string):Promise<{success:boolean}> {
    try{
      await this.prisma.user.delete({
        where:{
          id
        }
      })
      return {success:false}
    }catch(err:unknown){
       this.logger.warn({
          context: 'UsersService',
          method: 'create',
          action: 'rollback user',
          status: 'success',
          message: 'User removed after avatar upload failure',
          userId: getErrorMessage(err),
        })
      return {success:true}
    }
  }
}
