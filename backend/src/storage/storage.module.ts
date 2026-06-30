import { Module } from '@nestjs/common';
import { StorageService } from './storage.service';
import { AwsStorage } from './providers/s3.provider';
import { FILE_STORAGE } from './fileStorage.token';



@Module({
  providers: [
    AwsStorage,
    {
      provide: FILE_STORAGE,
      useExisting: AwsStorage,
    },
    StorageService,
  ],

  exports: [StorageService],
})
export class StorageModule {}

