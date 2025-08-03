
import { Socket } from "socket.io-client";
import { SocketClient } from "./client";
import readlineSync from 'readline-sync';
import express, { Request, Response } from "express";

function waitForConnection(socket: Socket): Promise<void> {
  return new Promise((resolve, reject) => {
    socket.on('connect', () => resolve());
    socket.on('connect_error', (err) => reject(err));
  });
}

async function main() {
  const app = express();
  const PORT = 3333;

  const client = new SocketClient();

  app.use(express.json());

  app.post('/', async (req: Request, res: Response) => {
    const { service, data } = req.body;
    if (!service || !data) {
      return res.status(400).send('Service and data parameters are required');
    }
    await client.commands.sendGenericCommand(service, data);
    res.sendStatus(200);
  });

  try {
    await waitForConnection(client.socket);
    console.log('Conectado ao servidor.');
  } catch (error) {
    console.error('Erro ao conectar:', error);
    // O servidor Express vai iniciar mesmo com erro de conexão
  }
  app.listen(PORT, () => {
    console.log(`Servidor rodando na porta ${PORT}`);
  });
}

main();
