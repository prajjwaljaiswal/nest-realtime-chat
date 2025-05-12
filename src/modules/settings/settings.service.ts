import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { SeqeulizeService } from '@providers/sequelize/sequelize.service';
import { Settings as Model } from '@src/models/settings.model';
import { CreateDTO, UpdateDTO } from './dto/settings.dto';

@Injectable()
export class SettingsService {
  constructor(private readonly db: SeqeulizeService) {}

  async GetById() {
    try {
      const data = await this.db.get(Model, {});
      return data;
    } catch (error) {
      throw error;
    }
  }

  async Create(dto: CreateDTO) {
    try {
      let createdData = await this.db.create(Model, dto);
      return createdData;
    } catch (error) {
      throw error;
    }
  }

  async update(payload: UpdateDTO) {
    try {
      const data = await this.db.getByPk(Model, payload.id);

      if (!data) {
        throw new HttpException(`Settings not found`, HttpStatus.NOT_FOUND);
      }

      // Update fields if they are provided in the payload
      await data.update({
        ...payload,
      });

      return data;
    } catch (error) {
      throw error;
    }
  }
}
