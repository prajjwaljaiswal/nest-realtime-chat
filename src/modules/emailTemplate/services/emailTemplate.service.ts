/* eslint-disable prettier/prettier */
import { HttpException, HttpStatus } from '@nestjs/common';
import { Op } from 'sequelize';
//import { Parser } from '@json2csv/plainjs';
import { Injectable } from '@nestjs/common';
import { SeqeulizeService } from '@providers/sequelize/sequelize.service';
import { DEFAULT_LIMIT } from '@common/constants/global.constants';
import { GetResponse } from '@common/global-interfaces';
import { GetAllEmailTemplateDTO } from '../dto/createEmailTemplate';
import { EmailTemplate } from '@src/models/emailTemplate.model';

@Injectable()
export class EmailTemplateService {
  constructor(private readonly db: SeqeulizeService) {}

  async GetAllEmailTemplate(payload: GetAllEmailTemplateDTO) {
    try {
      const pageNumber = Math.max(1, Number(payload.page) || 1);
      const pageLength = Math.max(1, Number(payload.limit) || DEFAULT_LIMIT);

      const totalEmails = await this.db.count(EmailTemplate);
      const maxPageNumber = Math.ceil(totalEmails / pageLength);

      if (maxPageNumber !== 0 && pageNumber > maxPageNumber) {
        throw new HttpException('Invalid Page Number.', HttpStatus.BAD_REQUEST);
      }

      const offset = (pageNumber - 1) * pageLength;
      const whereCondition: any = {};

      // Ensure filtering only by name
      if (payload.keyword) {
        whereCondition[Op.or] = [
          { title: { [Op.iLike]: `%${payload.keyword}%` } },
          { slug: { [Op.iLike]: `%${payload.keyword}%` } },
        ];
      }

      const emailLength = await this.db.count(EmailTemplate, {
        where: whereCondition,
      });

      // Extract sorting field and order
      let orderField = 'updatedAt'; // default field
      let orderDirection = 'DESC'; // default direction

      if (payload.sort) {
        const [field, direction] = payload.sort.split('_');

        // Validate field and direction
        const validFields = ['title', 'subject', 'slug', 'createdAt']; // Add your valid fields here
        if (validFields.includes(field)) {
          orderField = field;
        }
        if (direction.toUpperCase() === 'DESC') {
          orderDirection = 'DESC';
        }
      }

      const emailPages = await this.db.getAll(EmailTemplate, {
        where: whereCondition,
        order: [[orderField, orderDirection]],
        limit: pageLength,
        offset: offset,
      });

      const result: GetResponse = {
        page: pageNumber,
        limit: pageLength,
        total: emailLength,
        result: emailPages,
      };

      return result;
    } catch (error) {
      console.error('Error in GetAllEmailTemplate:', error);
      throw new HttpException(
        'Internal Server Error',
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }

  // async GetAllEmailTemplate(payload: GetAllEmailTemplateDTO) {
  //   try {
  //     const page = payload?.page || DEFAULT_PAGE;
  //     const limit = payload?.limit || DEFAULT_LIMIT;

  //     let whereCondition = {};

  //     let sortField = 'createdAt';
  //     let sortOrder = 'ASC';

  //     if (payload?.sort) {
  //       const [field, direction] = payload.sort.split('_');

  //       if (['title', 'slug'].includes(field)) {
  //         sortField = field;
  //       }
  //       sortOrder = direction.toUpperCase() === 'DESC' ? 'DESC' : 'ASC';
  //     }

  //     const searchString = payload?.keyword;

  //     if (searchString) {
  //       const searchFields = ['title', 'slug']; // Updated search fields
  //       const searchCondition = searchingAllFields(searchFields, searchString);
  //       whereCondition = { ...whereCondition, ...searchCondition };
  //     }

  //     const { rows: data, count } = await this.db.findAndCount(EmailTemplate, {
  //       attributes: this.selectFields,
  //       where: whereCondition,
  //       limit,
  //       offset: limit * (page - 1),
  //       order: [[sortField, sortOrder]],
  //     });

  //     const result: GetResponse = {
  //       page: page,
  //       limit: limit,
  //       total: count,
  //       result: data,
  //     };
  //     return result;
  //   } catch (error: any) {
  //     console.error('Error in getAllEmailTemplate:', error);
  //     throw error;
  //   }
  // }

  // async GetAllEmailTemplate(payload: GetAllEmailTemplateDTO) {
  //   try {
  //     const pageNumber = Math.max(1, Math.floor(payload.page || 1));
  //     const pageLength = Math.max(
  //       1,
  //       Math.floor(payload.limit || DEFAULT_LIMIT),
  //     );
  //     const offset = (pageNumber - 1) * pageLength;
  //     const totalEmailTemplates = await this.db.count(EmailTemplate);
  //     const maxPageNumber = Math.ceil(totalEmailTemplates / pageLength);

  //     if (maxPageNumber !== 0 && pageNumber > maxPageNumber) {
  //       throw new HttpException('Invalid Page Number.', HttpStatus.BAD_REQUEST);
  //     }

  //     const whereCondition: any = {};

  //     // Allow filtering by title, subject, or slug
  //     if (payload.keyword) {
  //       whereCondition[Op.or] = [
  //         { title: { [Op.like]: `%${payload.keyword}%` } },
  //         { subject: { [Op.like]: `%${payload.keyword}%` } },
  //         { slug: { [Op.like]: `%${payload.keyword}%` } },
  //       ];
  //     }

  //     const emailTemplateLength = await this.db.count(EmailTemplate, {
  //       where: whereCondition,
  //     });

  //     // Extract sorting field and order
  //     let orderField = 'createdAt'; // default field
  //     let orderDirection = 'ASC'; // default direction

  //     if (payload.sort) {
  //       const [field, direction] = payload.sort.split('_');
  //       orderField = field; // set the field for ordering
  //       orderDirection = direction.toUpperCase() === 'DESC' ? 'DESC' : 'ASC'; // ensure valid direction
  //     }

  //     const emailTemplates = await this.db.getAll(EmailTemplate, {
  //       where: whereCondition,
  //       order: [[orderField, orderDirection]], // Ensure correct syntax
  //       limit: pageLength,
  //       offset: offset,
  //     });

  //     const result: GetResponse = {
  //       page: pageNumber,
  //       limit: pageLength,
  //       total: emailTemplateLength,
  //       result: emailTemplates,
  //     };

  //     return result;
  //   } catch (error) {
  //     console.error('Error in GetAllEmailTemplate:', error);
  //     throw new HttpException(
  //       'Internal Server Error',
  //       HttpStatus.INTERNAL_SERVER_ERROR,
  //     );
  //   }
  // }

  // async GetCMSpage(slug: string) {
  //   const pageData = await this.db.get(CMS, {
  //     where: {
  //       slug: slug,
  //     },
  //   });

  //   if (!pageData) {
  //     throw new HttpException(
  //       'There is no such page with this title..',
  //       HttpStatus.BAD_REQUEST,
  //     );
  //   }

  //   return {
  //     message: 'Fetched Data Successfully',
  //     status: true,
  //     code: HttpStatus.OK,
  //     data: pageData,
  //   };
  // }

  async addEmailTemplate(payload) {
    try {
      await this.db.create(EmailTemplate, {
        title: payload.title,
        subject: payload.subject,
        content: payload.content,
        status: payload.status,
        slug: payload.slug,
      });

      return {
        status: true,
        code: HttpStatus.CREATED,
        message: 'Comment Created',
      };
    } catch (error) {
      throw error;
    }
  }

  async updateEmailTemplate(updateEmailTemplateData, slug) {
    try {
      const email = await this.db.get(EmailTemplate, {
        where: { slug: slug },
      });

      if (!email) {
        throw new HttpException(
          'Email template not found',
          HttpStatus.NOT_FOUND
        );
      }

      email.title = updateEmailTemplateData.title || email.title; // Use existing value if not provided
      email.content = updateEmailTemplateData.content || email.content;
      email.subject = updateEmailTemplateData.subject || email.subject;
      email.status =
        updateEmailTemplateData.status !== undefined
          ? updateEmailTemplateData.status
          : email.status; // Check for undefined

      await email.save();

      return {
        message: 'Email template updated successfully',
        status: true,
        code: HttpStatus.OK,
        data: email,
      };
    } catch (error) {
      console.error('Error updating email template:', error);
      throw new HttpException(
        'Internal Server Error',
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }

  async changePageStatus(id) {
    const email = await this.db.getByPk(EmailTemplate, id);

    if (!email) {
      throw new HttpException('No email found', HttpStatus.NOT_FOUND);
    }

    if (email.status) {
      email.status = false;
    } else {
      email.status = true;
    }
    await email.save();

    return {
      status: true,
      code: HttpStatus.OK,
      message: 'Status Updated',
    };
  }

  async deleteEmailTemplate(id) {
    const email = await this.db.getByPk(EmailTemplate, id);

    if (!email) {
      throw new HttpException('No page found', HttpStatus.NOT_FOUND);
    }
    await email.destroy();
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
