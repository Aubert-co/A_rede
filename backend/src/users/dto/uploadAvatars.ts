import type {  UploadImageResult } from "src/storage/storage.interface";

export type UploadAvatars =UploadImageResult & {
    tmpKey:string,
    finalKey:string
}

export type UploadImageDTO = {
    file?:Express.Multer.File,
    tmpKey:string,
    finalKey:string
}