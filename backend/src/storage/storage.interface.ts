export interface UploadImageResult  {
  success: boolean
  error?: "upload-error"
}

export interface UploadFile {
  fileBuffer:Buffer,
  urlPath:string,
  mimeType:string
}


export interface IFileStorage {
  upload(data: UploadFile): Promise<UploadImageResult>

} 

export interface IImageUploadService{
  uploadImage({}:UploadFile):Promise<UploadImageResult>
}