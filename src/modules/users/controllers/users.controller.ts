import {
  Body,
  Controller,
  Delete,
  Get,
  Post,
  Put,
  Res,
  UploadedFiles,
  UseInterceptors,
  BadRequestException,
} from '@nestjs/common';
import { Response } from 'express';
import { UserService } from '../services/users.service';
import { ApiBearerAuth, ApiBody, ApiOperation, ApiTags } from '@nestjs/swagger';
import {
  CreateBulkUsers,
  CreateMobileUserDTO,
  CreateUserDTO,
  DeleteUserDTO,
  GetAllUsersDTO,
  UpdateMobileUserDTO,
  UpdateUserDTO,
  UserStatusDTO,
  ApprovalUserDTO,
} from '../dto/users.dto';
import { Public } from '@common/decorators/roles.decorator';
import { AuthUser } from '@common/decorators/authUser.decorator';
import { Roles } from '@common/decorators/roles.decorator';
import { Users } from '@src/models/user.model';
import { FilesInterceptor, NoFilesInterceptor } from '@nestjs/platform-express';
import { storage } from '@common/global-helpers/all.helpers';
import { join } from 'path';
import { unlinkSync } from 'fs';

@Controller('users')
export class UsersController {
  constructor(
    private readonly userService: UserService,
  ) {}

  @Public()
  @Post('add')
  @ApiOperation({ description: 'User Add' })
  @ApiBody({ type: CreateUserDTO })
  async addUser(@Body() payload: CreateUserDTO) {
    return await this.userService.createUser(payload);
  }


  @Post('user-list')
  @ApiBearerAuth('Authorization')
  @ApiTags('Admin')
  @ApiOperation({
    summary: 'Get users listing in admin panel',
    description: 'Get users listing in admin panel',
  })
  @UseInterceptors(NoFilesInterceptor())
  @ApiOperation({ description: 'Get users listings' })
  @ApiBody({ type: GetAllUsersDTO })
  async getUser(@AuthUser() user: Users, @Body() payload: GetAllUsersDTO) {
    return await this.userService.getAllUsers(user.id, payload);
  }

  @Roles('SUPERADMIN')
  @Put('update')
  @ApiOperation({ description: 'User Update' })
  @ApiBody({ type: UpdateUserDTO })
  async updateUser(@Body() payload: UpdateUserDTO) {
    const id = payload.id;
    delete payload.id;
    return await this.userService.updateUser(id, payload);
  }

  @Post('update-status')
  @ApiOperation({ description: 'User Status Update' })
  @ApiBody({ type: UserStatusDTO })
  async updateStatus(@Body() payload: UserStatusDTO) {
    return this.userService.updateStatus(payload);
  }

  @Delete('delete')
  @ApiOperation({ description: 'User Delete' })
  @ApiBody({ type: DeleteUserDTO })
  async delete(@Body() payload: DeleteUserDTO) {
    return await this.userService.delete(payload);
  }

  @Delete('delete-user')
  @ApiTags('Admin')
  @Roles('SUPERADMIN')
  @ApiOperation({ description: 'Delete user account' })
  @ApiBody({ type: DeleteUserDTO })
  async deleteUser(@Body() payload: DeleteUserDTO) {
    return await this.userService.deleteUser(payload);
  }

  
  @Get('get-all-count')
  async getTotalCount(@AuthUser() user: Users) {
    return await this.userService.getTotalCount();
  }

  @Get('download')
  @ApiOperation({ description: 'Download CSV Data' })
  async downloadCSVFile(@Res() res: Response): Promise<void> {
    try {
      const filePath = await this.userService.downloadCSVFile();

      res.setHeader('Content-Type', 'text/csv');

      return res.sendFile(filePath);
    } catch (error) {
      console.error('Error in downloadCSVFile controller:', error);
      throw error;
    }
  }

  @Get('download')
  downloadFile(@Res() res: Response) {
    // Path to the file to be downloaded
    const filePath = join(__dirname, '..', 'public', 'uploads', 'csvFile.csv');

    res.download(filePath, 'csvFile.csv', (err) => {
      if (err) {
        console.error('Error downloading the file:', err);
        res.status(500).send('An error occurred while downloading the file.');
      }
    });
  }
}
