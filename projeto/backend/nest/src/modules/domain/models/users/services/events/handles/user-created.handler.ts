import { EventsHandler, IEventHandler } from '@nestjs/cqrs';
import { CustomNestLogger } from 'src/modules/logger/logger.service';
import { UserCreatedEvent } from '../user-created.event';

@EventsHandler(UserCreatedEvent)
export class UserCreatedHandler implements IEventHandler<UserCreatedEvent> {
  constructor(private readonly logger: CustomNestLogger) { }

  handle(event: UserCreatedEvent) {
    this.logger.log(`👤 Novo usuário criado: ${event.email} (ID: ${event.userId})`);

    // Aqui você pode:
    // - Enviar email de boas-vindas
    // - Criar registros de auditoria
    // - Integrar com sistemas externos
    // - etc.
  }
}