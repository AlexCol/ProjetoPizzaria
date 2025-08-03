import { Socket } from "socket.io-client";
import { EventData, GenericCommandData, ServerResponse } from "./types";

export function addEvents(socket: Socket) {
  // Evento de conexão
  socket.on('connect', (): void => {
    console.log('✅ Conectado ao servidor Socket.IO');
  });

  // Tratamento de erro de conexão
  socket.on('connect_error', (error: Error): void => {
    console.error('❌ Erro de conexão:', error.message);

    // Verifica se é erro de autenticação
    if (error.message.includes('Authentication') || error.message.includes('Unauthorized')) {
      console.error('🔒 Erro de autenticação - Token inválido ou expirado');
      console.log('💡 Verificar o token JWT no código');

      // Opcional: Desabilitar reconexão automática em caso de erro de auth
      socket.disconnect();
      return;
    }

    console.log('🔄 Tentando reconectar...');
  });

  // Evento de erro genérico
  socket.on('error', (error: any): void => {
    console.error('❌ Erro no socket:', error);
  });

  // Evento de reconexão
  socket.on('reconnect', (attemptNumber: number): void => {
    console.log(`🔄 Reconectado após ${attemptNumber} tentativa(s)`);
  });

  // Evento de tentativa de reconexão
  socket.on('reconnect_attempt', (attemptNumber: number): void => {
    console.log(`🔄 Tentativa de reconexão #${attemptNumber}`);
  });

  // Evento quando falha ao reconectar
  socket.on('reconnect_failed', (): void => {
    console.error('❌ Falha ao reconectar - máximo de tentativas atingido');
    console.log('💡 Verifique se o servidor está rodando e o token está válido');
  });

  // Recebe eventos 'events'
  socket.on('events', (data: EventData): void => {
    console.log('📨 Recebido evento "events":', data);
  });

  // Evento de desconexão
  socket.on('disconnect', (reason: string): void => {
    console.log('🔌 Desconectado do servidor. Motivo:', reason);

    // Se foi desconexão pelo servidor devido a erro de auth
    if (reason === 'io server disconnect') {
      console.log('⚠️ Servidor desconectou o cliente (possível erro de autenticação)');
    }
  });
}