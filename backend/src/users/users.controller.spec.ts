import { Test, TestingModule } from '@nestjs/testing'
import { UsersController } from './users.controller'
import { UsersService } from './users.service'

describe('UsersController', () => {
  let controller: UsersController

  const mockUsersService = {
    create: jest.fn(),
  }

  const values = {
    nickname: 'lucas',
    username: 'josef',
    email: 'lucas@gmail.com',
    password: '123456',
    bio: 'lorem itpsy',
    status:""
  }

  const avatarFileMock = {
    fieldname: 'avatar',
    originalname: 'avatar.png',
    encoding: '7bit',
    mimetype: 'image/png',
    buffer: Buffer.from('fake-image'),
    size: 1234,
  } as Express.Multer.File

  beforeEach(async () => {
    jest.clearAllMocks()

    const module: TestingModule = await Test.createTestingModule({
      controllers: [UsersController],
      providers: [
        {
          provide: UsersService,
          useValue: mockUsersService,
        },
      ],
    }).compile()

    controller = module.get<UsersController>(UsersController)
  })

  it('should be defined', () => {
    expect(controller).toBeDefined()
  })

  it('should create a user', async () => {
    mockUsersService.create.mockResolvedValue({
      message: 'success',
    })

    const response = await controller.create(values, avatarFileMock)

    expect(response).toEqual({
      message: 'success',
    })

    expect(mockUsersService.create).toHaveBeenCalledWith({
      ...values,
      avatarFile: avatarFileMock,
    })
  })

  it('should throw error when service throws', async () => {
    mockUsersService.create.mockRejectedValue(new Error('Internal error'))

    await expect(
      controller.create(values, avatarFileMock),
    ).rejects.toThrow('Internal error')

    expect(mockUsersService.create).toHaveBeenCalledWith({
      ...values,
      avatarFile: avatarFileMock,
    })
  })
})