/* eslint-disable prettier/prettier */
import {
  BadRequestException,
  HttpException,
  HttpStatus,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { DocumentCategory } from '../../models/documentCategory';
import { Op } from 'sequelize';
// import { Parser } from '@json2csv/plainjs';
import { SeqeulizeService } from '@providers/sequelize/sequelize.service';
import { DEFAULT_LIMIT } from '@common/constants/global.constants';
import { GetResponse } from '@common/global-interfaces';
import { GetAllCategoryDTO } from './dto/documentCategory.dto';
import { Document } from '@src/models/document.model';

@Injectable()
export class DocumentCategoryService {
  constructor(private readonly db: SeqeulizeService) {}

  async GetAllCategoryPage(payload: GetAllCategoryDTO) {
    try {
      const pageNumber = Math.max(1, Math.floor(payload.page || 1));
      const pageLength = Math.max(
        1,
        Math.floor(Number(payload.limit) || DEFAULT_LIMIT)
      );
      const offset = (pageNumber - 1) * pageLength;
      const maxPageNumber = Math.ceil(
        (await this.db.count(DocumentCategory)) / pageLength
      );

      if (maxPageNumber !== 0 && pageNumber > maxPageNumber) {
        throw new BadRequestException('Invalid Page Number.');
      }

      const whereCondition: any = {};
      if (payload.keyword) {
        whereCondition[Op.or] = [
          { name: { [Op.iLike]: `%${payload.keyword}%` } },
        ];
      }

      const quesAnsPagesLength = await this.db.count(DocumentCategory, {
        where: whereCondition,
      });

      // Extract sorting field and order
      let orderField = 'createdAt'; // default field
      let orderDirection = 'ASC'; // default direction

      if (payload.sort) {
        const [field, direction] = payload.sort.split('_');
        orderField = field; // set the field for ordering
        orderDirection = direction.toUpperCase() === 'DESC' ? 'DESC' : 'ASC'; // ensure valid direction
      }

      const quesAnsPages = await this.db.getAll(DocumentCategory, {
        where: whereCondition,
        order: [[orderField, orderDirection]], // Ensure correct syntax
        limit: pageLength,
        offset: offset,
      });

      const result: GetResponse = {
        page: pageNumber,
        limit: pageLength,
        total: quesAnsPagesLength,
        result: quesAnsPages,
      };

      return result;
    } catch (error) {
      console.error('Error in GetAllQuestions:', error); // Add error logging for clarity
      throw new HttpException(
        'Internal Server Error',
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }

  async GetDropDownList(payload: GetAllCategoryDTO) {
    try {
      const pageNumber = Math.max(1, Math.floor(payload.page || 1));
      const pageLength = Math.max(
        1,
        Math.floor(payload.limit || DEFAULT_LIMIT)
      );
      const offset = (pageNumber - 1) * pageLength;
      const maxPageNumber = Math.ceil(
        (await this.db.count(DocumentCategory)) / pageLength
      );

      if (maxPageNumber !== 0 && pageNumber > maxPageNumber) {
        throw new BadRequestException('Invalid Page Number.');
      }

      const whereCondition: any = {
        status: true,
      };
      if (payload.keyword) {
        whereCondition[Op.or] = [
          { name: { [Op.iLike]: `%${payload.keyword}%` } },
        ];
      }

      const categoryPagesLength = await this.db.count(DocumentCategory, {
        where: whereCondition,
      });

      // Extract sorting field and order
      let orderField = 'createdAt'; // default field
      let orderDirection = 'ASC'; // default direction

      if (payload.sort) {
        const [field, direction] = payload.sort.split('_');
        orderField = field; // set the field for ordering
        orderDirection = direction.toUpperCase() === 'DESC' ? 'DESC' : 'ASC'; // ensure valid direction
      }

      const categoryPages = await this.db.getAll(DocumentCategory, {
        where: whereCondition,
        order: [[orderField, orderDirection]], // Ensure correct syntax
        limit: pageLength,
        offset: offset,
      });

      const result: GetResponse = {
        page: pageNumber,
        limit: pageLength,
        total: categoryPagesLength,
        result: categoryPages,
      };

      return result;
    } catch (error) {
      console.error('Error in GetAllCategoryPage:', error); // Add error logging for clarity
      throw new HttpException(
        'Internal Server Error',
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }

  // async GetAllCMSPage(
  //   pageNumber: number,
  //   pageLength: number,
  //   sortKey: string,
  //   sortOrder: string,
  //   searchKey: string,
  // ) {
  //   try {
  //     pageNumber = Math.max(1, Math.floor(pageNumber));
  //     pageLength = Math.max(1, Math.floor(pageLength));
  //     const offset = (pageNumber - 1) * pageLength;
  //     const maxPageNumber = Math.ceil((await this.db.count(CMS)) / pageLength);

  //     if (pageNumber !== 1 && pageNumber > maxPageNumber) {
  //       throw new HttpException('Invalid Page Number.', HttpStatus.BAD_REQUEST);
  //     }

  //     let whereCondition = {};

  //     if (searchKey) {
  //       whereCondition = {
  //         [Op.or]: [
  //           { title: { [Op.like]: `%${searchKey}%` } },
  //           { slug: { [Op.like]: `%${searchKey}%` } },
  //         ],
  //       };
  //     }

  //     const cmsPagesLength = await this.db.count(CMS, {
  //       where: whereCondition,
  //     });

  //     const cmsPages = await this.db.getAll(CMS, {
  //       where: whereCondition,
  //       order: [[sortKey, sortOrder.toLowerCase() === 'asc' ? 'ASC' : 'DESC']],
  //       limit: pageLength,
  //       offset: offset,
  //     });

  //     return {
  //       message: 'Fetched Data Successfully',
  //       status: true,
  //       code: HttpStatus.OK,
  //       data: {
  //         result: cmsPages,
  //         total: Math.max(cmsPagesLength, cmsPages.length),
  //       },
  //     };
  //   } catch (error) {
  //     throw error;
  //   }
  // }

  async GetCategory(id) {
    const categoryData = await this.db.get(DocumentCategory, {
      where: {
        id: id,
      },
    });

    if (!categoryData) {
      throw new BadRequestException('There is no such page with this name...');
    }

    return categoryData;
  }

  async addCategoryPage(categoryData) {
    try {
      const existCategory = await this.db.get(DocumentCategory, {
        where: {
          name: categoryData.name,
        },
      });

      if (existCategory) {
        throw new BadRequestException(
          'Category Already Exists, Duplicate Value'
        );
      }

      const createSlug = (name) => {
        return name.toLowerCase().trim().replace(/\s+/g, '-');
      };
      const slug = createSlug(categoryData.name);
      await this.db.create(DocumentCategory, {
        name: categoryData.name,
        status: categoryData.status,
        slug: slug,
      });

      return {
        status: true,
        code: HttpStatus.CREATED,
        message: 'Category Created',
      };
    } catch (error) {
      throw error;
    }
  }

  async updateCategory(updateCategoryData, id) {
    try {
      const category = await this.db.getByPk(DocumentCategory, id);

      if (!category) {
        throw new NotFoundException('No category found');
      }

      category.name = updateCategoryData.name;
      category.status = updateCategoryData.status;
      await category.save();

      return {
        message: 'Fetched Data Successfully',
        status: true,
        code: HttpStatus.OK,
        data: category,
      };
    } catch (error) {
      throw error;
    }
  }

  async changeCategoryStatus(id) {
    const category = await this.db.getByPk(DocumentCategory, id);

    if (!category) {
      throw new NotFoundException('No category found');
    }

    if (category.status) {
      category.status = false;
    } else {
      category.status = true;
    }
    await category.save();

    return {
      status: true,
      code: HttpStatus.OK,
      message: 'Status Updated',
    };
  }

  async deleteCategory(id) {
    const category = await this.db.getByPk(DocumentCategory, id);

    if (!category) {
      throw new NotFoundException('No category found');
    }
    // Step 2: Check if the category has any associated documents
    const documentsCount = await this.db.count(Document, {
      where: { categoryId: id },
    });
    if (documentsCount > 0) {
      throw new BadRequestException(
        'Cannot delete category, it contains documents'
      );
    }
    await category.destroy();
    return {
      status: true,
      code: HttpStatus.OK,
      message: 'Deleted',
    };
  }

  // public async getCSVData() {
  //   try {
  //     const data = await this.db.getAll(CMS, {
  //       attributes: [
  //         'title',
  //         'slug',
  //         'content',
  //         'subTitle',
  //         'metaTitle',
  //         'shortDescription',
  //         'metaDescription',
  //       ],
  //       raw: true,
  //     });
  //     const parser = new Parser();
  //     const csv = parser.parse(data);

  //     return csv;
  //   } catch (error) {
  //     console.error('Error creating Workbook:', error);
  //   }
  // }

  // public async getPageTitles() {
  //   try {
  //     const pageTitles = await this.db.getAll(CMS, {
  //       attributes: ['title'],
  //       raw: true,
  //     });
  //     const res = [];
  //     for (const title of pageTitles) {
  //       res.push(title.title);
  //     }

  //     return {
  //       data: {
  //         result: res,
  //       },
  //       status: true,
  //       code: HttpStatus.OK,
  //       message: 'Fetched',
  //     };
  //   } catch (error) {
  //     throw error;
  //   }
  // }
}
