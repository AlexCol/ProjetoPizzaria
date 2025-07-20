import { ArgumentMetadata, BadRequestException, Injectable, PipeTransform } from "@nestjs/common";

@Injectable()
export class FileSizeValidationPipe implements PipeTransform {
  transform(value: any, metadata: ArgumentMetadata) {
    // "value" is an object containing the file's attributes and metadata
    const MX_SIZE = 1 * 1024 * 1024; // 1 MB

    /*ver se é array*/
    if (Array.isArray(value)) {
      for (const file of value) {
        if (file.size > MX_SIZE) {
          throw new BadRequestException(`FileSizeValidationPipe: O arquivo é muito grande!`);
        }
      }
      return value; //o retorno em um pipe, substitui o valor original
    }

    if (value.size > MX_SIZE) {
      throw new BadRequestException(`FileSizeValidationPipe: O arquivo é muito grande!`);
    }
    return value; //o retorno em um pipe, substitui o valor original

  }
}
