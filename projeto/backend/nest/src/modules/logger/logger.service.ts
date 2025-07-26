import { Injectable, LoggerService } from '@nestjs/common';
import colours from './utils/colours';
import * as path from 'path';
import * as fs from 'fs-extra';
import LEVELS from './utils/levels';
import Semaphore from 'src/common/utils/semaphore';

//!proceso adaptado da 'logger' do projeto final do curso de Node
@Injectable()
export class CustomNestLogger implements LoggerService {
  private static semaphore = new Semaphore(1);

  private readonly defaultLevels = []; //['error', 'warn', 'log', 'debug', 'verbose'];
  private readonly enabledConsoleLevels: string[];
  private readonly enabledFileLevels: string[];
  private readonly logDirectory: string;
  private readonly maxLogFiles: number;
  private readonly maxFileSize: number;

  constructor() {
    this.enabledConsoleLevels = process.env.LOG_CONSOLE_LEVELS?.split(',') || this.defaultLevels;
    this.enabledFileLevels = process.env.LOG_FILE_LEVELS?.split(',') || this.defaultLevels;
    this.logDirectory = process.env.LOG_DIRECTORY || path.join(process.cwd(), 'logs');
    this.maxLogFiles = parseInt(process.env.MAX_LOG_FILES || '7'); // Manter 7 dias
    this.maxFileSize = parseInt(process.env.MAX_LOG_FILE_SIZE || '5242880'); // 5MB por padrão

    if (this.enabledFileLevels.length > 0) {
      this.ensureLogDirectory();
    }
  }

  /**********************************************************************/
  /*                       PUBLIC METHODS                               */
  /**********************************************************************/
  log(msg: any, ...params: any[]) { this.handle('log', msg, ...params); }
  error(msg: any, ...params: any[]) { this.handle('error', msg, ...params); }
  warn(msg: any, ...params: any[]) { this.handle('warn', msg, ...params); }
  debug(msg: any, ...params: any[]) { this.handle('debug', msg, ...params); }
  verbose(msg: any, ...params: any[]) { this.handle('verbose', msg, ...params); }

  /**********************************************************************/
  /*                       PRIVATE METHODS                              */
  /**********************************************************************/
  private handle(level: keyof typeof LEVELS, message: any, ...optionalParams: any[]) {
    const timestamp = new Date().toLocaleString();
    const { color, fn } = LEVELS[level];

    //+ Log no console
    if (this.enabledConsoleLevels.includes(level)) {
      const consoleMsg = `[${timestamp}]${color}[${level.toUpperCase()}]${colours.reset} ${colours.fg.cyan}${message}${colours.reset}`;
      fn(consoleMsg, ...optionalParams);
    }

    //+ Log no arquivo
    if (this.enabledFileLevels.includes(level)) {
      const fileMsg = `[${timestamp}][${level.toUpperCase()}] ${message}`;
      CustomNestLogger.semaphore.acquire().then(async () => {
        try {
          await this.writeToFile(level, fileMsg, optionalParams);
        } finally {
          CustomNestLogger.semaphore.release();
        }
      });
    }
  }

  private async writeToFile(level: string, message: string, optionalParams: any[]) {
    try {
      const fullMessage = this.prepareMessage(level, message, optionalParams);
      await this.handleFile(fullMessage);
    } catch (error) {
      console.error('Erro ao escrever no arquivo de log:', error);
    }
  }

  private prepareMessage(level: string, message: string, optionalParams: any[]): string {
    // Adiciona parâmetros extras se existirem
    let fullMessage = message;

    if (optionalParams.length > 0) {
      const paramsString = optionalParams.map(param =>
        typeof param === 'object' ? JSON.stringify(param) : String(param)
      ).join(' ');
      fullMessage += ` ${paramsString}`;
    }

    fullMessage += '\n';
    return fullMessage;
  }

  private async handleFile(message: string) {
    const today = new Date().toISOString().split('T')[0]; // YYYY-MM-DD
    const fileName = `${today}.log`;
    const filePath = path.join(this.logDirectory, fileName);

    let fileSize = 0;
    if (await fs.pathExists(filePath)) {
      const stats = await fs.stat(filePath);
      fileSize = stats.size;
    }

    if (fileSize >= this.maxFileSize) {
      let partitionNumber = 1;
      // Buscar arquivos que comecem com ${today}_ pra ver qual a maior 'partitionNumber'
      const files = await fs.readdir(this.logDirectory);
      for (const file of files) {
        if (file.startsWith(today)) {
          const match = file.match(new RegExp(`^${today}_(\\d+)\\.log$`));
          if (match) {
            const currentPartition = parseInt(match[1], 10);
            partitionNumber = Math.max(partitionNumber, currentPartition + 1);
          }
        }
      }
      // Renomeia o arquivo atual para incluir a partição
      const newFileName = `${today}_${partitionNumber.toString().padStart(3, '0')}.log`;
      await fs.rename(filePath, path.join(this.logDirectory, newFileName));
    }

    // Escreve no arquivo (append)
    await fs.appendFile(filePath, message, 'utf8');

    // Limpa arquivos antigos se necessário
    await this.cleanOldLogFiles();
  }

  private async cleanOldLogFiles() {
    const files = await fs.readdir(this.logDirectory);

    // Remove arquivos antigos se exceder o limite
    if (files.length > this.maxLogFiles) {
      files.sort(this.sortFilesByDate.bind(this)); // Bind 'this' to ensure correct context
      const filesToDelete = files.slice(0, files.length - this.maxLogFiles);
      for (const file of filesToDelete) {
        await fs.unlink(path.join(this.logDirectory, file));
      }
    }
  }

  private sortFilesByDate(fileA: string, fileB: string): number {
    const aDate = fs.statSync(path.join(this.logDirectory, fileA)).mtime.getTime();
    const bDate = fs.statSync(path.join(this.logDirectory, fileB)).mtime.getTime();
    return aDate - bDate; // Ordem crescente
  }

  private ensureLogDirectory() {
    try {
      fs.ensureDirSync(this.logDirectory);
    } catch (error) {
      console.error('Erro ao criar diretório de logs:', error);
    }
  }
}