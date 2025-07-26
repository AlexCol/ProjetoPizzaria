import { Module, Global } from '@nestjs/common';
import { CustomNestLogger } from './logger.service';

@Global() // Torna disponível globalmente
@Module({
  providers: [CustomNestLogger],
  exports: [CustomNestLogger],
})
export class LoggerModule { }