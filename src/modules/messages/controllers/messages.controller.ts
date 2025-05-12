import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Delete,
  Put,
  UseInterceptors,
  UploadedFiles,
} from '@nestjs/common';
import { Roles } from '@common/decorators/roles.decorator';
import { ApiBearerAuth, ApiBody, ApiOperation, ApiTags } from '@nestjs/swagger';
import {
  CreateMessageDto,
  DeleteMessageDto,
  GetMessageDto,
  UpdateMessageDto,
} from '../messages.dto/messages.dto';
import { MessagesService } from '../services/messages.service';
import { FileFieldsInterceptor, FileInterceptor, NoFilesInterceptor } from '@nestjs/platform-express';
import { AuthUser } from '@common/decorators/authUser.decorator';
import { Users } from '@src/models/user.model';
import { validateFile } from '@common/global-helpers/all.helpers';

@ApiTags('Messages Manager')
@ApiBearerAuth('Authorization')
@Controller('messages')
export class MessagesController {
  constructor(private readonly messagesService: MessagesService) {}

  // Define allowed file types for document uploads
  private readonly uploadMessageFileType = ['image/jpeg', 'image/png', 'application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];

  @Post('create-message')
  @Roles('EXPERT', 'SOLICITOR')
  @UseInterceptors(
      FileFieldsInterceptor([
        { name: 'messageDocumentFiles', maxCount: 10 }
      ])
    )
  @ApiOperation({ description: 'Create Message' })
  async create(
    @UploadedFiles()
    files: {
      messageDocumentFiles?: Express.Multer.File[]
    } = {},
    @Body() payload: CreateMessageDto
  ) {
    // Validate the uploaded file (check size, type, etc.)
    await validateFile(
      {
        messageDocumentFiles: files.messageDocumentFiles || [],
      },
      {
        messageDocumentFiles: {
          required: false,
          maxSize: 10, // 10MB max size
          allowedTypes: this.uploadMessageFileType, // Allowed file types
        },
      }
    );
    return this.messagesService.createMessage(payload, files.messageDocumentFiles);
  }

  @Post('get-messages')
  @Roles('EXPERT', 'SOLICITOR', 'SUPERADMIN')
  @UseInterceptors(NoFilesInterceptor())
  @ApiOperation({ description: 'Get list of all the messages' })
  @ApiBody({ type: CreateMessageDto })
  findAllMessages(@Body() payload: GetMessageDto) {
    return this.messagesService.findAllMessages(payload);
  }

  @Put('update-message/:id')
  @Roles('EXPERT', 'SOLICITOR')
  @ApiOperation({ description: 'Update Message' })
  @ApiBody({ type: UpdateMessageDto })
  update(@Param('id') id: string, @AuthUser() user: Users, @Body() payload: UpdateMessageDto) {
    return this.messagesService.updateMessage(id, user.id, payload);
  }

  @Post('mark-read-messages')
  @Roles('EXPERT', 'SOLICITOR')
  @ApiOperation({ description: 'Update Message status to read' })
  @ApiBody({ type: UpdateMessageDto })
  markAsReadMessages(@AuthUser() user: Users) {
    return this.messagesService.markAsReadMessages(user.id);
  }

  @Delete('delete-message')
  @ApiOperation({ description: 'Delete Message' })
  @ApiBody({ type: DeleteMessageDto })
  async delete(@Body() payload: DeleteMessageDto, @AuthUser() user: Users) {
    return await this.messagesService.deleteMessage(user.id, payload);
  }
}
