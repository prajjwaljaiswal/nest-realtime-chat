import { Module } from '@nestjs/common';
import { SocketService } from './socket.service';
import { SeqeulizeService } from '@providers/sequelize/sequelize.service';
import { SocketGateway } from './socket.gateway';

@Module({
  providers: [SocketGateway, SeqeulizeService, SocketService]
})
export class SocketModule { }
