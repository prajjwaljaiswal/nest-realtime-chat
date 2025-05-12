import { WebSocketGateway, OnGatewayConnection, OnGatewayDisconnect, WebSocketServer, SubscribeMessage } from '@nestjs/websockets';
import { Socket } from 'socket.io';
import { SocketService } from './socket.service';

interface MessagePayload {
    message: string;
    sender?: string;
    timestamp?: Date;
    caseId: string;
}

@WebSocketGateway({
    cors: {
        origin: '*',
    },
})
export class SocketGateway implements OnGatewayConnection, OnGatewayDisconnect {
    @WebSocketServer()
    private server: Socket;

    constructor(private readonly socketService: SocketService) { }

    handleConnection(socket: Socket): void {
        console.log(`Client connected: ${socket.id}`);
        this.socketService.handleConnection(socket);
    }

    handleDisconnect(socket: Socket): void {
        console.log(`Client disconnected: ${socket.id}`);
    }

    @SubscribeMessage('message')
    handleMessage(socket: Socket, payload: MessagePayload): void {
        try {
            console.log('Received message:', payload);
            
            const messageData = {
                ...payload,
                sender: socket.id,
                timestamp: new Date(),
                caseId: payload.caseId,
            };

            // Emit to the room with name as caseId
            this.server.to(payload.caseId).emit('message', messageData);
            
        } catch (error) {
            console.error('Error handling message:', error);
            socket.emit('error', { message: 'Failed to process message' });
        }
    }

    @SubscribeMessage('join')
    handleJoin(socket: Socket, caseId: string): void {
        try {
            socket.join(caseId);
            console.log(`Client ${socket.id} joined room caseId: ${caseId}`);
            socket.emit('joined', { caseId });
        } catch (error) {
            console.error('Error joining room:', error);
            socket.emit('error', { message: 'Failed to join room' });
        }
    }

    @SubscribeMessage('leave')
    handleLeave(socket: Socket, room: string): void {
        try {
            socket.leave(room);
            console.log(`Client ${socket.id} left room: ${room}`);
            socket.emit('left', { room });
        } catch (error) {
            console.error('Error leaving room:', error);
            socket.emit('error', { message: 'Failed to leave room' });
        }
    }
}