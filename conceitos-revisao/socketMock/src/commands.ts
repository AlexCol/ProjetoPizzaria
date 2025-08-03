import { Socket } from "socket.io-client";
import { EventData, GenericCommandData, ServerResponse } from "./types";

export function addCommands(socket: Socket) {
  function isConnected(): boolean {
    return socket.connected;
  }

  async function sendGenericCommand(service: string, data: any) {
    if (!isConnected()) {
      console.log('⚠️ Socket não está conectado. Comando não enviado.');
      return;
    }
    console.log('Enviando comando genérico...');
    console.log('Socket status:', socket.connected);
    const commandData: GenericCommandData = { service, data };

    // await socket.emit('generic-command', commandData, (response: any) => { 
    //   console.log('Resposta do generic-command:', response);
    // });
    const response = await socket.emitWithAck('generic-command', commandData); //aguarda a resposta
    if (response) {
      console.log('Resposta Ack:', response);
    }
  }

  function disconnect() {
    if (!isConnected()) {
      console.log('⚠️ Socket já está desconectado.');
      return;
    }
    socket.disconnect();
    console.log('🔌 Desconectado do servidor Socket.IO');
  }

  return {
    sendGenericCommand,
    disconnect
  };
}