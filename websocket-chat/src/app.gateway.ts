import { Logger } from '@nestjs/common';
import {
  OnGatewayConnection,
  OnGatewayDisconnect,
  OnGatewayInit,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';

@WebSocketGateway({
  cors: {
    origin: '*',
  },
})
export class AppGateway
  implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect
{
  @WebSocketServer()
  server: Server;

  usuariosConectados: any[] = [];

  private logger: Logger = new Logger('AppGateway');

  @SubscribeMessage('msgToServer')
  handleMessage(client: Socket, payload): void {
    const userObtido = this.usuariosConectados.find(
      (user) => user.id === client.id,
    );

    this.server.to([payload.id, client.id]).emit('msgToClient', {
      name: userObtido.username,
      text: payload.mensagem,
    });
  }

  @SubscribeMessage('msgToServerGeral')
  handleMessageGeral(client: Socket, payload): void {
    console.log('Entrou aqui');
    const userObtido = this.usuariosConectados.find(
      (user) => user.id === client.id,
    );

    this.server.emit('msgToClient', {
      name: userObtido.username,
      text: payload.mensagem,
    });
  }

  @SubscribeMessage('login')
  addUser(client: Socket, username: string) {
    client.data.username = username;
    this.usuariosConectados.push({
      username,
      id: client.id,
    });
    this.getUsers();
  }

  @SubscribeMessage('getUsers')
  getUsers() {
    this.server.emit('users', this.usuariosConectados);
  }

  handleDisconnect(client: Socket) {
    this.usuariosConectados = this.usuariosConectados.filter(
      (usuario) => usuario.id !== client.id,
    );
    this.getUsers();
    this.server.emit('logoutMsg', client.data.username);
    this.logger.log(`Client disconnected: ${client.id}`);
  }

  handleConnection(client: Socket) {
    this.logger.log(`Client connected: ${client.id}`);
  }

  afterInit(server: Server) {
    this.logger.log('Init');
  }
}
