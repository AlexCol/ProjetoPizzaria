import { Socket } from "socket.io-client";

export function addResponses(socket: Socket) {
  socket.on('generic-command-response', (response) => {
    console.log('Resposta do comando genérico:', response);
  });
}