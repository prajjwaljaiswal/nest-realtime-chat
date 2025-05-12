import {
  Body,
  Controller,
  Get,
  Delete,
  // HttpException,
  // HttpStatus,
  Param,
  Post,
  UseInterceptors,
  // Query,
} from '@nestjs/common';

// import { CreateCMSDTO, GetAllCmsDTO } from '../dto/createCMSDTO';
import { DocumentCategoryService } from './documentCategory.service';
import { ApiBody, ApiTags } from '@nestjs/swagger';
import { Roles } from '@common/decorators/roles.decorator';
// import { NoFilesInterceptor } from '@nestjs/platform-express';
import {
  CreateCategoryDTO,
  GetAllCategoryDTO,
} from './dto/documentCategory.dto';
import { NoFilesInterceptor } from '@nestjs/platform-express';
//import { CMS } from '@src/models/cmsPages.model';

@ApiTags('Admin')
@Controller('document-category')
export class DocumentCategoryController {
  constructor(
    private readonly documentCategoryService: DocumentCategoryService
  ) {}

  @Roles('SUPERADMIN')
  @UseInterceptors(NoFilesInterceptor())
  @Post('/list')
  @ApiBody({ type: GetAllCategoryDTO })
  async getCategory(@Body() payload: GetAllCategoryDTO) {
    return await this.documentCategoryService.GetAllCategoryPage(payload);
  }

  @Roles('SUPERADMIN')
  @Post('/drop-down-list')
  @ApiBody({ type: GetAllCategoryDTO })
  async getCategoryDropList(@Body() payload: any) {
    return await this.documentCategoryService.GetDropDownList(payload);
  }

  @Roles('SUPERADMIN')
  @Post('/add-new')
  async CreateNewCategory(@Body() categoryData: CreateCategoryDTO) {
    return await this.documentCategoryService.addCategoryPage(categoryData);
  }

  @Roles('SUPERADMIN')
  @Get('/view/:id')
  async getCategoryViaSlug(@Param() params: any) {
    return await this.documentCategoryService.GetCategory(params.id);
  }

  @Roles('SUPERADMIN')
  @Post('edit/:id')
  async updateCategory(
    @Param() params: any,
    @Body() payload: CreateCategoryDTO
  ) {
    return await this.documentCategoryService.updateCategory(
      payload,
      params.id
    );
  }

  @Roles('SUPERADMIN')
  @Post('change-status/:id')
  async changeCategoryStatus(@Param() params: any) {
    return await this.documentCategoryService.changeCategoryStatus(params.id);
  }

  @Roles('SUPERADMIN')
  @Delete('delete-category/:id')
  async deleteDocumentCategory(@Param() params: any) {
    return await this.documentCategoryService.deleteCategory(params.id);
  }

  //   @Roles('SUPERADMIN')
  //   @Get('page-titles')
  //   async getCMSPageTitles() {
  //     return await this.cMSService.getPageTitles();
  //   }
}
