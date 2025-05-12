import {
  Body,
  Controller,
  Delete,
  Param,
  // Delete,
  // Get,
  // // HttpException,
  // // HttpStatus,
  // Param,
  Post,
  UseInterceptors,
  // Query,
} from '@nestjs/common';
import { EmailTemplateService } from '../services/emailTemplate.service';

import { ApiBody, ApiTags } from '@nestjs/swagger';
// import { Public } from '@common/decorators/roles.decorator';
import { NoFilesInterceptor } from '@nestjs/platform-express';
import {
  CreateEmailTemplateDTO,
  GetAllEmailTemplateDTO,
  UpdateEmailTemplateDTO,
} from '../dto/createEmailTemplate';

@ApiTags('Admin')
@Controller('/emailTemplate')
export class EmailTemplateController {
  constructor(private readonly emailTemplateService: EmailTemplateService) {}

  @Post('/list')
  @UseInterceptors(NoFilesInterceptor())
  @ApiBody({ type: GetAllEmailTemplateDTO })
  async getEmailTemplate(@Body() payload: any) {
    return await this.emailTemplateService.GetAllEmailTemplate(payload);
  }

  @Post('add-new-emailTemplate')
  async CreateNewCMSPage(@Body() emailTemplateData: CreateEmailTemplateDTO) {
    return await this.emailTemplateService.addEmailTemplate(emailTemplateData);
  }

  // @Get('cms/view/:slug')
  // async getCMSPage(@Param() params: any) {
  //   return await this.cMSService.GetCMSpage(params.slug);
  // }

  // @Get('cms/view/public/:slug')
  // @Public()
  // async getCMSPagePublic(@Param() params: any) {
  //   return await this.cMSService.GetCMSpage(params.slug);
  // }

  @Post('edit/:slug')
  async update(@Param() params: any, @Body() payload: UpdateEmailTemplateDTO) {
    return await this.emailTemplateService.updateEmailTemplate(
      payload,
      params.slug
    );
  }

  @Post('change-status/:id')
  async changeEmailStatus(@Param() params: any) {
    return await this.emailTemplateService.changePageStatus(params.id);
  }

  @Delete('delete-emailTemplate/:id')
  async deleteCMSPage(@Param() params: any) {
    return await this.emailTemplateService.deleteEmailTemplate(params.id);
  }

  // @Get('/cms/page-titles')
  // async getCMSPageTitles() {
  //   console.log('title');

  //   return await this.cMSService.getPageTitles();
  // }
}
