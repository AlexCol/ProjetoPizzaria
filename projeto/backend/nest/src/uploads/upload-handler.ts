import * as path from "path";
import * as fs from "fs-extra";

export type UploadFileType = {
  file: string;
  extension: string;
}

export class UploadHandler {
  static saveFile(stringifiedFile: string, folder: string, fileName: string): string | undefined {
    const toDirectory = process.env.SAVE_FILE_DIR == 'true';
    const toDatabase = process.env.SAVE_FILE_DB == 'true';

    if (!toDirectory && !toDatabase)
      return undefined;

    if (toDatabase) //se é pra salvar em db, o dado deve vir já pronto em base64 para ser salvo no banco, sem processamento adicional necessario
      return stringifiedFile;

    try {
      const fileData: UploadFileType = JSON.parse(stringifiedFile);
      const completeFileName = `${fileName}.${fileData.extension}`;

      let basePath = __dirname;
      if (process.env.DIRECTORY)
        basePath = path.join(process.env.DIRECTORY);

      const filePath = path.join(basePath, 'files', folder, completeFileName);

      // Verifica se o diretório existe, se não existir cria
      if (!fs.existsSync(path.dirname(filePath))) {
        fs.mkdirSync(path.dirname(filePath), { recursive: true });
      }

      // Converte base64 para buffer e salva o arquivo
      const buffer = Buffer.from(fileData.file, 'base64');
      fs.writeFileSync(filePath, buffer);

      return completeFileName;
    } catch (error) {
      throw new Error(`Error saving file: ${error.message}`);

    }
  }
}