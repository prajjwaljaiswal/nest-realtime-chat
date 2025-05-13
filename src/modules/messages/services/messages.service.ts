import {
  BadRequestException,
  HttpException,
  HttpStatus,
  Injectable,
} from '@nestjs/common';
import { SeqeulizeService } from '@providers/sequelize/sequelize.service';
import {
  CreateMessageDto,
  DeleteMessageDto,
  GetMessageDto,
  UpdateMessageDto,
} from '../messages.dto/messages.dto';
import { Messages } from '@src/models/messages.model';
import path from 'path';
import { FileService } from '@providers/files/files.service';
import { MessageDocuments } from '@src/models/messageDocuments.model';
import { Op } from 'sequelize';

@Injectable()
export class MessagesService {
  private title: any;

  constructor(
    private readonly sequelizeService: SeqeulizeService,
    private readonly fileUpload: FileService
  ) {
    this.title = 'message';
  }

  async createMessage(
    payload: CreateMessageDto,
    messageDocumentFiles: Express.Multer.File[]
  ) {
    if (!payload?.senderId) {
      throw new BadRequestException(`Sender ID not found`);
    }
    if (!payload?.receiverId) {
      throw new BadRequestException(`Receiver ID not found`);
    }
    const message = await this.sequelizeService.create(Messages, payload);

    if (messageDocumentFiles?.length) {
      for (const file of messageDocumentFiles) {
        const timestamp = Date.now();
        const fileExtension = path.extname(file.originalname);
        const randomSixDigit = Math.floor(100000 + Math.random() * 900000);
        const newFileName = `messageDocuments/${randomSixDigit}_${timestamp}${fileExtension}`;

        const fileUploadObj = {
          fileName: newFileName,
          originalName: file.originalname,
          fileURL: '',
        };

        // If a file is uploaded, upload it to S3 with the new file name
        if (file) {
          //console.log('file', file);
          fileUploadObj.fileURL = (
            await this.fileUpload.uploadFile(file, newFileName)
          )?.replaceAll('\\', '/');
        }

        // save file data to database
        await this.sequelizeService.create(MessageDocuments, {
          messageId: message.id,
          documentName: fileUploadObj.fileName,
        });
      }
    }
    // Fetch the message details with associated documents
    const messagesData = await this.sequelizeService.get(Messages, {
      where: {
        id: message.id,
      },
      include: [
        {
          model: MessageDocuments,
          as: 'messageDocuments',
          attributes: ['id', 'documentName'],
        },
      ],
    });

    // Convert Sequelize instance to plain object
    const plainMessageData = messagesData.toJSON();

    // Process message documents
    const updatedMessageDocuments = await Promise.all(
      plainMessageData.messageDocuments.map(async (document: any) => {
        const documentPath = await this.fileUpload.getFilePath(
          document.documentName
        ); // Generate S3 file path
        return {
          ...document, // Use plain object
          documentPath, // Add the new parameter
        };
      })
    );

    // Return the updated message data
    return {
      ...plainMessageData,
      messageDocuments: updatedMessageDocuments, // Use resolved documents
    };
  }

  async findAllMessages(payload: GetMessageDto) {

    if (!payload?.senderId) {
      throw new BadRequestException(`Expert ID not found`);
    }
    if (!payload?.receiverId) {
      throw new BadRequestException(`Solicitor ID not found`);
    }
    const messages = await this.sequelizeService.getAll(Messages, {
      where: {
        [Op.or]: [
          {
            senderId: payload.senderId,
            receiverId: payload.receiverId,
          },
          {
            senderId: payload.receiverId,
            receiverId: payload.senderId,
          },
        ],
      },
      include: [
        {
          model: MessageDocuments,
          as: 'messageDocuments',
          attributes: ['id', 'documentName'],
        },
      ],
      order: [['createdAt', 'ASC']],
    });
    // Add a new parameter `documentPath` to each messageDocument
    const updatedMessages = await Promise.all(
      messages.map(async (message: any) => {
        const plainMessage = message.toJSON(); // Convert Sequelize instance to plain object

        // Determine sender role
        if (plainMessage.senderId === plainMessage.solicitorId) {
          plainMessage.senderRole = 'expert';
        } else {
          plainMessage.senderRole = 'expert';
        }

        // Process message documents
        const updatedMessageDocuments = await Promise.all(
          plainMessage.messageDocuments.map(async (document: any) => {
            const documentPath = await this.fileUpload.getFilePath(
              document.documentName
            );
            const finalPath = (document?.documentName).split('/');
            const path = finalPath[finalPath.length - 1];

            document.documentName = path;
            return {
              ...document, // Use plain object
              documentPath, // Add the new parameter
            };
          })
        );

        return {
          ...plainMessage,
          messageDocuments: updatedMessageDocuments, // Use resolved documents
        };
      })
    );

    return { result: updatedMessages };
  }
  
  async countUnreadMessages(
    caseId: string,
    receiverId: string,
    senderId?: string
  ) {
    if (!caseId) {
      throw new BadRequestException(`Case ID not found`);
    }

    if (!receiverId) {
      throw new BadRequestException(`Receiver ID not found`);
    }

    const whereClause: any = {
      caseId,
      receiverId,
      isRead: false,
      isDeleted: false,
    };

    if (senderId) {
      whereClause.senderId = senderId;
    }

    const count = await this.sequelizeService.count(Messages, {
      where: whereClause,
    });

    return count;
  }

  async updateMessage(id: string, userId: string, payload: UpdateMessageDto) {
    const findResponse = await this.sequelizeService.get(Messages, {
      where: {
        id: id,
      },
    });
    if (!findResponse) throw new BadRequestException(`No ${this.title} found`);
    if (findResponse.senderId !== userId) {
      throw new BadRequestException(
        `You are not authorized to update this ${this.title}`
      );
    }
    const whereCondition = {
      where: {
        id: findResponse.id,
      },
    };
    const resData = await this.sequelizeService.update(
      Messages,
      payload,
      whereCondition
    );
    return resData;
  }

  async markAsReadMessages(userId: string) {
    const whereCondition = {
      where: {
        receiverId: userId,
        isRead: false,
      },
    };

    console.log('**********************', whereCondition);
    const resData = await this.sequelizeService.update(
      Messages,
      { isRead: true },
      whereCondition
    );
    return resData;
  }

  async deleteMessage(userId, payload: DeleteMessageDto) {
    try {
      if (!payload?.id.length) {
        throw new BadRequestException(`${this.title} ID not found`);
      }
      const messageData = await this.sequelizeService.findAndCount(Messages, {
        where: {
          id: {
            [Op.in]: Array.isArray(payload?.id) ? payload.id : [payload.id],
          },
        },
      });
      if (messageData.count !== payload?.id.length) {
        throw new BadRequestException(`No ${this.title} found`);
      }
      if (messageData.rows[0].senderId !== userId) {
        throw new BadRequestException(
          `You are not authorized to delete this ${this.title}`
        );
      }
      await this.sequelizeService.delete(Messages, {
        where: {
          id: {
            [Op.in]: Array.isArray(payload?.id) ? payload.id : [payload.id],
          },
        },
      });
      return {
        message: `${this.title} deleted successfully!`,
      };
    } catch (error: any) {
      throw error;
    }
  }
}
