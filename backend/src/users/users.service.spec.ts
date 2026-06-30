import { Test, TestingModule } from '@nestjs/testing';
import { UsersService } from './users.service';
import { CreateUserInput } from './dto/create-user.dto';
import { FILE_STORAGE } from '../storage/fileStorage.token';
import { PrismaClient } from '@prisma/client';
import * as hash from "../common/hashPassword/hash"


describe('UsersService', () => {
  const mockHash = jest.spyOn(hash,'hashPassword')
  const avatarFileMock = {
  originalname: 'avatar.png',
  mimetype: 'image/png',
  buffer: Buffer.from('fake-image'),
} as Express.Multer.File;
  const values = {
    nickname:"lucas",
    username:"josef",
    bio:"lorem itpsy",
    status:"loading",
    password:"12345",
    avatarFile:avatarFileMock,
    email:"lucas@gmail.com"
  } as CreateUserInput
 let service: UsersService;

   let mockPrisma: {
    user: {
      findFirst: jest.Mock;
      create: jest.Mock;
      delete:jest.Mock
    };
  };

  let mockStorage: {
    uploadImage: jest.Mock;
  };

  beforeEach(async () => {
    mockHash.mockClear()
    mockPrisma = {
      user: {
        findFirst: jest.fn(),
        create: jest.fn(),
        delete:jest.fn()
      },
    };

    mockStorage = {
      uploadImage: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UsersService,
        {
          provide: PrismaClient,
          useValue: mockPrisma,
        },
        {
          provide: FILE_STORAGE,
          useValue: mockStorage,
        },
      ],
    }).compile();

    service = module.get<UsersService>(UsersService);
  });

  it('should successfully create a new user', async() => {
    mockStorage.uploadImage.mockResolvedValue({success:true})
    mockPrisma.user.findFirst.mockResolvedValue('')
    mockPrisma.user.create.mockResolvedValue('')
    mockHash.mockResolvedValue({success:true,hash:'hased password'})
    const response = await service.create(values)
    
    expect(response).toEqual({
      message:"success"
    })

    expect(mockStorage.uploadImage).toHaveBeenCalledWith({
      fileBuffer: avatarFileMock.buffer,
      mimeType: avatarFileMock.mimetype,
      urlPath: expect.stringMatching(/^tmp\/.+\.png$/),
    });
      expect(mockPrisma.user.findFirst).toHaveBeenCalledWith({
      where: {
        OR: [
          { username: values.username },
          { email: values.email },
        ],
      },
    })
   expect(mockPrisma.user.create).toHaveBeenCalledWith({
    data: expect.objectContaining({
      name: values.nickname,
      username: values.username,
      email: values.email,
      bio: values.bio,
      password: 'hased password',
      status: 'loading',

      avatarKey: expect.stringMatching(/^tmp\/.+\.png$/),
      avatarUrl: expect.stringMatching(/^files\/.+\.webp$/),
    }),
  })
  });
  it('should throw error when avatar upload fails', async () => {
    mockStorage.uploadImage.mockResolvedValue({success:false})

    mockPrisma.user.findFirst.mockResolvedValue(null)
    mockPrisma.user.create.mockResolvedValue('')
    mockPrisma.user.delete.mockRejectedValue({success:true})
    mockHash.mockResolvedValue({
      success: true,
      hash: 'hased password',
    })

    await expect(service.create(values)).rejects.toThrow('Failed to upload avatar')

    expect(mockStorage.uploadImage).toHaveBeenCalledWith({
      fileBuffer: avatarFileMock.buffer,
      mimeType: avatarFileMock.mimetype,
      urlPath: expect.stringMatching(/^tmp\/.+\.png$/),
    })

    expect(mockPrisma.user.findFirst).toHaveBeenCalledWith({
      where: {
        OR: [
          { username: values.username },
          { email: values.email },
        ],
      },
    })

     expect(mockPrisma.user.create).toHaveBeenCalledWith({
      data: expect.objectContaining({
        name: values.nickname,
        username: values.username,
        email: values.email,
        bio: values.bio,
        password: 'hased password',
        status: 'loading',

        avatarKey: expect.stringMatching(/^tmp\/.+\.png$/),
        avatarUrl: expect.stringMatching(/^files\/.+\.webp$/),
      }),
    })
    expect(mockStorage.uploadImage).toHaveBeenCalledWith({
      fileBuffer: avatarFileMock.buffer,
      mimeType: avatarFileMock.mimetype,
      urlPath: expect.stringMatching(/^tmp\/.+\.png$/),
    });
    expect(mockPrisma.user.delete).toHaveBeenCalledTimes(1)

  })
  
  it('should throw error when username or email already exists', async () => {
  
    mockPrisma.user.findFirst.mockResolvedValue(values)

    await expect(service.create(values)).rejects.toThrow('Error finding user by username')

    expect(mockPrisma.user.findFirst).toHaveBeenCalledWith({
      where: {
        OR: [
          { username: values.username },
          { email: values.email },
        ],
      },
    })

    expect(mockHash).not.toHaveBeenCalled()
    expect(mockPrisma.user.create).not.toHaveBeenCalled()
    expect(mockStorage.uploadImage).not.toHaveBeenCalled()
    expect(mockPrisma.user.delete).not.toHaveBeenCalled()
  })
  it('should throw error when findFirst throws an error', async () => {
  
    mockPrisma.user.findFirst.mockRejectedValue(new Error("failed"))

    await expect(service.create(values)).rejects.toThrow('Error finding user by username')

    expect(mockPrisma.user.findFirst).toHaveBeenCalledWith({
      where: {
        OR: [
          { username: values.username },
          { email: values.email },
        ],
      },
    })

    expect(mockHash).not.toHaveBeenCalled()
    expect(mockPrisma.user.create).not.toHaveBeenCalled()
    expect(mockStorage.uploadImage).not.toHaveBeenCalled()
    expect(mockPrisma.user.delete).not.toHaveBeenCalled()
  })
  it('should throw error when database fails while creating user', async () => {
    mockPrisma.user.findFirst.mockResolvedValue(null)

    mockHash.mockResolvedValue({
      success: true,
      hash: 'hased password',
    })

    mockPrisma.user.create.mockRejectedValue(new Error('Database error'))

    await expect(service.create(values)).rejects.toThrow('Failed to create a user')

    expect(mockPrisma.user.findFirst).toHaveBeenCalledWith({
      where: {
        OR: [
          { username: values.username },
          { email: values.email },
        ],
      },
    })

    expect(mockHash).toHaveBeenCalledWith(values.password)

    expect(mockPrisma.user.create).toHaveBeenCalledWith({
      data: expect.objectContaining({
        name: values.nickname,
        username: values.username,
        email: values.email,
        bio: values.bio,
        password: 'hased password',
        status: 'loading',

        avatarKey: expect.stringMatching(/^tmp\/.+\.png$/),
        avatarUrl: expect.stringMatching(/^files\/.+\.webp$/),
      }),
    })

    expect(mockStorage.uploadImage).not.toHaveBeenCalled()
    expect(mockPrisma.user.delete).not.toHaveBeenCalled()
  })
  it('should throw error when hash password fails', async () => {
  mockPrisma.user.findFirst.mockResolvedValue(null)

  mockHash.mockResolvedValue({
    success: false,
    hash:""
  })

  await expect(service.create(values)).rejects.toThrow('Failed to create user')

  expect(mockPrisma.user.findFirst).toHaveBeenCalledWith({
    where: {
      OR: [
        { username: values.username },
        { email: values.email },
      ],
    },
  })

  expect(mockHash).toHaveBeenCalledWith(values.password)

  expect(mockPrisma.user.create).not.toHaveBeenCalled()
  expect(mockStorage.uploadImage).not.toHaveBeenCalled()
  expect(mockPrisma.user.delete).not.toHaveBeenCalled()
})
});
