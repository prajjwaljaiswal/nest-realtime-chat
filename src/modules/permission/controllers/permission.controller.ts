import {
  Body,
  Controller,
  Delete,
  Param,
  Post,
  UseInterceptors,
} from '@nestjs/common';

import { ApiBody, ApiTags } from '@nestjs/swagger';
// import { Public } from '@common/decorators/roles.decorator';
import { NoFilesInterceptor } from '@nestjs/platform-express';
import {
  CreatePermissionDTO,
  GetAllPermissionDTO,
  GetByIdDTO,
  UpdatePermissionDTO,
  UpdateStatusDTO,
} from '../dto/createPermission';
import { PermissionService } from '../services/permission.service';

@ApiTags('Admin')
@Controller('permission')
export class PermissionController {
  constructor(private readonly permissionService: PermissionService) {}

  @Post('/list')
  @UseInterceptors(NoFilesInterceptor())
  @ApiBody({ type: GetAllPermissionDTO })
  async getPermission(@Body() payload: any) {
    return await this.permissionService.GetAllPermission(payload);
  }

  @Post('add-new-permission')
  async CreateNewPermission(@Body() permissionData: CreatePermissionDTO) {
    return await this.permissionService.addPermission(permissionData);
  }

  @Post('edit/:id')
  async update(@Param() params: any, @Body() payload: UpdatePermissionDTO) {
    return await this.permissionService.updatePermission(payload, params.id);
  }

  @Post('change-status/:id')
  async changeStatus(@Param() params: any, @Body() payload: UpdateStatusDTO) {
    return await this.permissionService.changeStatus(params.id, payload.key);
  }

  @Post('getByModule')
  async getByModule(@Param() params: any, @Body() payload: GetByIdDTO) {
    return await this.permissionService.getByModule(
      payload.moduleName,
      payload.role
    );
  }

  @Delete('delete-permission/:id')
  async deletePermission(@Param() params: any) {
    return await this.permissionService.deletePermission(params.id);
  }
}
