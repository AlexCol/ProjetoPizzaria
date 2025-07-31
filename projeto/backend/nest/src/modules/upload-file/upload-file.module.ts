import { Global, Module } from '@nestjs/common';
import { UploadFileService } from './upload-file.service';

@Global()
@Module({
  imports: [],
  controllers: [],
  providers: [UploadFileService],
  exports: [UploadFileService],
})
export class UploadFileModule { }
