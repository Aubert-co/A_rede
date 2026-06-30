import { Injectable } from '@nestjs/common';
import type { IFileStorage, IImageUploadService, UploadFile, UploadImageResult } from './storage.interface';

@Injectable()
export class StorageService implements IImageUploadService {
    constructor(private storage:IFileStorage){}

    public async uploadImage({fileBuffer,urlPath,mimeType}:UploadFile):Promise<UploadImageResult>{
     
      return await this.storage.upload({
        fileBuffer,urlPath:"rede/"+urlPath,mimeType
      })
    }
  
}