export class CreateUserDto {
  username!: string;
  email!: string;
  password!:string;
  bio:string;
  status:string;
  nickname!:string
}

export type   CreateUserInput = {
  username:string,
  email:string,
  password:string,
  bio?:string,
  status?:string,
  avatarFile?:Express.Multer.File
  nickname:string
}