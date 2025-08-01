import * as path from "path";
import * as fs from "fs-extra";
import { Inject, Injectable } from "@nestjs/common";
import { UploadFileType } from "./types/upload-file";
import { CustomNestLogger } from "../logger/logger.service";

@Injectable()
export class UploadFileService {
  private readonly toDirectory: boolean;
  private readonly toDatabase: boolean;
  private readonly uploadPath: string;

  constructor(
    private readonly logger: CustomNestLogger,
  ) {
    this.toDirectory = process.env.SAVE_FILE_DIR == 'true';
    this.toDatabase = process.env.SAVE_FILE_DB == 'true';
    this.uploadPath = `${process.env.DIRECTORY || process.cwd()}/files`;
  }

  async saveFile(stringifiedFile: string, folder: string, fileName: string): Promise<string | undefined> {

    if (!this.toDirectory && !this.toDatabase)
      return undefined;

    if (!this.toDirectory && this.toDatabase) //se é pra salvar em db, o dado deve vir já pronto em base64 para ser salvo no banco, sem processamento adicional necessario
      return stringifiedFile;

    try {
      const fileData: UploadFileType = JSON.parse(stringifiedFile);
      const completeFileName = `${fileName}.${fileData.extension}`;

      const filePath = path.join(this.uploadPath, folder, completeFileName);

      // Verifica se o diretório existe, se não existir cria
      if (!await fs.exists(path.dirname(filePath)))
        await fs.mkdir(path.dirname(filePath), { recursive: true });

      // Converte base64 para buffer e salva o arquivo
      const buffer = Buffer.from(fileData.file, 'base64');
      await fs.writeFile(filePath, buffer);

      return completeFileName;
    } catch (error) {
      throw new Error(`Error saving file: ${error.message}`);
    }
  }

  async excludeFile(fileName: string, folder: string): Promise<void> {
    if (!this.toDirectory)
      return;

    //caminho raiz (working directory) do projeto
    const filePath = path.join(this.uploadPath, folder, fileName);
    try {
      if (await fs.exists(filePath))
        await fs.unlink(filePath);
    } catch (error) {
      throw new Error(`Error excluding file: ${error.message}`);
    }
  }

  async updateFile(stringifiedFile: string, folder: string, newFileName: string, oldFileName?: string | null) {
    if (oldFileName)
      await this.excludeFile(oldFileName, folder);
    return await this.saveFile(stringifiedFile, folder, newFileName);
  }

  async getFile(fileName: string, folder: string) {
    if (!fileName)
      return undefined;

    try {
      if (!this.toDirectory && !this.toDatabase)
        return undefined;

      if (!this.toDirectory && this.toDatabase) //se é pra salvar em db, o dado deve vir já pronto em base64 para ser salvo no banco, sem processamento adicional necessario
        return fileName || undefined;

      const filePath = path.join(this.uploadPath, folder, fileName);
      const file = await fs.readFile(filePath);
      const base64File = file.toString('base64');

      return base64File;
    } catch (error) {
      if (error.code === 'ENOENT') {
        this.logger.warn(`File not found: ${fileName} in folder: ${folder}`);
        return undefined; // Retorna undefined se o arquivo não for encontrado
      }

      if (error.code === 'ENAMETOOLONG') {
        this.logger.warn(`File name too long: ${fileName.length}`);
        return undefined; // Retorna undefined se o nome do arquivo for muito longo
      }

      this.logger.error(`Error getting file: ${error.message.toString().substring(0, 200)}`);
      return undefined; // Retorna undefined se o arquivo não for encontrado ou ocorrer um erro
    }
  }
}