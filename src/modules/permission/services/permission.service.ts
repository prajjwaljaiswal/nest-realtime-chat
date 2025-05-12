/* eslint-disable prettier/prettier */
import { HttpException, HttpStatus } from '@nestjs/common';
import { Op } from 'sequelize';
//import { Parser } from '@json2csv/plainjs';
import { Injectable } from '@nestjs/common';
import { SeqeulizeService } from '@providers/sequelize/sequelize.service';
import { DEFAULT_LIMIT } from '@common/constants/global.constants';
import { GetResponse } from '@common/global-interfaces';
import { GetAllPermissionDTO } from '../dto/createPermission';
import { Permission } from '@src/models/permission.model';

@Injectable()
export class PermissionService {
  constructor(private readonly db: SeqeulizeService) {}

  async GetAllPermission(payload: GetAllPermissionDTO) {
    try {
      const pageNumber = Math.max(1, Number(payload.page) || 1);
      const pageLength = Math.max(1, Number(payload.limit) || DEFAULT_LIMIT);

      const totalPermissions = await this.db.count(Permission);
      const maxPageNumber = Math.ceil(totalPermissions / pageLength);

      if (maxPageNumber !== 0) {
        if (pageNumber > maxPageNumber) {
          throw new HttpException(
            'Invalid Page Number.',
            HttpStatus.BAD_REQUEST
          );
        }
      }

      const offset = (pageNumber - 1) * pageLength;
      const whereCondition: any = {};

      if (payload.keyword) {
        whereCondition[Op.or] = [
          { name: { [Op.iLike]: `%${payload.keyword}%` } },
        ];
      }

      const permissionLength = await this.db.count(Permission, {
        where: whereCondition,
      });

      const permissionPages = await this.db.getAll(Permission, {
        where: whereCondition,
        order: [[payload.sort || 'createdAt', payload.sort ? 'ASC' : 'DESC']],
        limit: pageLength,
        offset: offset,
      });

      const result: GetResponse = {
        page: pageNumber,
        limit: pageLength,
        total: permissionLength,
        result: permissionPages,
      };

      return result;
    } catch (error) {
      console.error('Error in GetAllPermission:', error);
      throw error;
    }
  }

  async addPermission(permissionData) {
    try {
      await this.db.create(Permission, {
        name: permissionData.name,
        read: permissionData.read,
        create: permissionData.create,
        edit: permissionData.edit,
        delete: permissionData.delete,
        role: permissionData.role,
      });

      return {
        status: true,
        code: HttpStatus.CREATED,
        message: 'Permission Created',
      };
    } catch (error) {
      throw error;
    }
  }

  async updatePermission(updatePermissionData, id) {
    try {
      const permission = await this.db.getByPk(Permission, id);

      if (!permission) {
        throw new HttpException('No permission found', HttpStatus.NOT_FOUND);
      }

      permission.name = updatePermissionData.name;
      permission.read = updatePermissionData.read;
      permission.edit = updatePermissionData.edit;
      permission.delete = updatePermissionData.delete;
      permission.create = updatePermissionData.create;
      await permission.save();

      return {
        message: 'Fetched Data Successfully',
        status: true,
        code: HttpStatus.OK,
        data: permission,
      };
    } catch (error) {
      throw error;
    }
  }

  async getByModule(moduleName, role) {
    const result = await this.db.get(Permission, {
      where: {
        name: moduleName,
        role: role,
      },
      include: [
        {
          all: true,
        },
      ],
    });

    if (!result) {
      throw new HttpException('No permission found', HttpStatus.NOT_FOUND);
    }

    return {
      status: true,
      code: HttpStatus.OK,
      message: `Permission set found`,
      result,
    };
  }

  async changeStatus(id, key: 'read' | 'create' | 'edit' | 'delete') {
    const permission = await this.db.getByPk(Permission, id);

    if (!permission) {
      throw new HttpException('No email found', HttpStatus.NOT_FOUND);
    }

    if (key === 'read') {
      permission.read = !permission.read;
    }
    if (key === 'create') {
      permission.create = !permission.create;
    }
    if (key === 'edit') {
      permission.edit = !permission.edit;
    }
    if (key === 'delete') {
      permission.delete = !permission.delete;
    }
    await permission.save();

    return {
      status: true,
      code: HttpStatus.OK,
      message: `${key} Status Updated`,
    };
  }

  async deletePermission(id) {
    const permission = await this.db.getByPk(Permission, id);

    if (!permission) {
      throw new HttpException('No permission found', HttpStatus.NOT_FOUND);
    }
    await permission.destroy();
    return {
      status: true,
      code: HttpStatus.OK,
      message: 'Deleted',
    };
  }
}
