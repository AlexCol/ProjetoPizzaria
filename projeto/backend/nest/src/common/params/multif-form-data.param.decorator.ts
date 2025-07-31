import { BadRequestException, createParamDecorator, ExecutionContext } from "@nestjs/common";
import { FastifyRequest } from "fastify";
import { plainToInstance } from "class-transformer";
import { validate } from 'class-validator';
import { MultipartFile, MultipartValue } from "@fastify/multipart";
import { UploadFileType } from "src/uploads/upload-handler";

type MultiFormDataType<T extends object = object> = {
  dtoClass: new () => T;
  fileName?: string;
  permitedExtensions?: string[];
}

export const MultiFormData = createParamDecorator(

  async <T extends object>(data: MultiFormDataType<T>, ctx: ExecutionContext) => {
    const req = ctx.switchToHttp().getRequest<FastifyRequest>();
    const parts = req.parts();
    let dtoData: any = {};

    for await (const part of parts) {
      if (part.type === 'field') {
        handleField(part, dtoData, data.fileName);
      } else if (part.type === 'file') {
        await handleFile(part, dtoData, data.fileName);
      }
    }

    // Usa class-transformer para conversão automática de tipos
    const dto = plainToInstance(data.dtoClass, dtoData, { enableImplicitConversion: true });
    const errors = await validate(dto, { whitelist: true, forbidNonWhitelisted: true });

    if (errors.length) {
      throw new BadRequestException(
        errors.map(e => e.constraints ? Object.values(e.constraints) : []).flat()
      );
    }

    return dto;
  }
);

function handleField(part: MultipartValue, dtoData: any, expectedFileName?: string) {
  if (expectedFileName && part.fieldname === expectedFileName)
    throw new BadRequestException(`Expected file: ${expectedFileName} as file, but got as field.`);

  dtoData[part.fieldname] = part.value;
}

async function handleFile(part: MultipartFile, dtoData: any, expectedFileName?: string, permitedExtensions?: string[]) {
  if (expectedFileName && part.fieldname !== expectedFileName)
    throw new BadRequestException(`Expected field: ${expectedFileName}, but got: ${part.fieldname}`);

  if (!part.filename) {
    dtoData[part.fieldname] = null; // Handle case where no file is uploaded
    return;
  }

  permitedExtensions = permitedExtensions || ['jpg', 'jpeg', 'png', 'gif'];
  const extension = part.mimetype?.split('/')[1] || 'unknown';
  if (!permitedExtensions.includes(extension)) {
    throw new BadRequestException(`Invalid image format. Allowed formats: ${permitedExtensions.join(', ')}`);
  }

  const imageBuffer = await part.toBuffer();
  const base64Image = imageBuffer.toString('base64');

  if (process.env.SAVE_FILE_DIR === 'true') {
    const image: UploadFileType = {
      file: base64Image,
      extension
    };
    dtoData[part.fieldname] = JSON.stringify(image);
    return;
  }

  if (process.env.SAVE_FILE_DB === 'true') {
    dtoData[part.fieldname] = base64Image;
    return;
  }
}