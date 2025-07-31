import { BadRequestException, createParamDecorator, ExecutionContext } from "@nestjs/common";
import { FastifyRequest } from "fastify";
import { plainToInstance } from "class-transformer";
import { validate } from 'class-validator';

type MultiFormDataType<T extends object = object> = {
  dtoClass: new () => T;
  fileName?: string;
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

function handleField(part: any, dtoData: any, expectedFileName?: string) {
  if (expectedFileName && part.fieldname === expectedFileName)
    throw new BadRequestException(`Expected file: ${expectedFileName} as file, but got as field.`);

  dtoData[part.fieldname] = part.value;
}

async function handleFile(part: any, dtoData: any, expectedFileName?: string) {
  if (expectedFileName && part.fieldname !== expectedFileName)
    throw new BadRequestException(`Expected field: ${expectedFileName}, but got: ${part.fieldname}`);

  if (!part.filename) {
    dtoData[part.fieldname] = null; // Handle case where no file is uploaded
    return;
  }

  const extension = part.filename.split('.').pop() || '';

  if (!['jpg', 'jpeg', 'png', 'gif'].includes(extension)) {
    throw new BadRequestException('Invalid image format. Allowed formats: jpg, jpeg, png, gif');
  }

  const image = await part.toBuffer();
  dtoData[part.fieldname] = image.toString('base64');
}