import {
  FileTypeValidator,
  MaxFileSizeValidator,
  ParseFilePipe,
} from '@nestjs/common';

type ImageFilePipeOptions = {
  required?: boolean;
  maxSize?: number;
};
export const FIVE_MB = 5*24*1024
export function imageFilePipe(options?: ImageFilePipeOptions) {
  return new ParseFilePipe({
    fileIsRequired: options?.required ?? false,
    validators: [
      new MaxFileSizeValidator({
        maxSize: options?.maxSize ?? FIVE_MB, 
      }),
      new FileTypeValidator({
        fileType: /^image\/(jpeg|png|webp)$/,
      }),
    ],
  });
}