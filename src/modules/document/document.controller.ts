import {
  Body,
  Controller,
  Delete,
  Post,
  Put,
  UploadedFile,
  UploadedFiles,
  UseInterceptors,
} from '@nestjs/common';
import { DocumentService } from './document.service';
import {
  documentDto,
  CreateDocumentDto,
  optionalDocumentParams,
  UpdateDocumentDto,
} from './dto/document.dto';
import {
  FileInterceptor,
  FilesInterceptor,
  NoFilesInterceptor,
} from '@nestjs/platform-express';
import { ApiBody, ApiOperation, ApiTags } from '@nestjs/swagger';
import { validateFile } from '@common/global-helpers/all.helpers';

@Controller('document')
export class documentController {
  // Define allowed file types for document uploads
  private readonly uploadFileType = [
    'application/pdf',
    'image/jpeg',
    'image/png',
    'application/vnd.ms-excel',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'text/csv',
  ];

  constructor(private readonly documentServices: DocumentService) {}

  /**
   * Endpoint to fetch documents with optional filters, sorting, and pagination.
   * @param payload - Optional parameters to filter and paginate the documents.
   * @returns Paginated list of documents.
   */
  @Post('getDocument')
  @UseInterceptors(NoFilesInterceptor()) // No file upload in this request
  @ApiTags('Document') // Tag to categorize the endpoint in Swagger
  @ApiOperation({ description: 'API TO GET DOCUMENT' }) // Operation description for Swagger
  @ApiBody({ type: optionalDocumentParams }) // Body parameters for the request
  async getCoupon(@Body() payload: optionalDocumentParams) {
    return await this.documentServices.getDocument(payload); // Call service method to get documents
  }

  /**
   * Endpoint to create a new document by uploading a file.
   * @param body - The document name.
   * @param documentFile - The file to be uploaded.
   * @returns Success message upon document creation.
   */
  @Post('createDocument')
  @ApiTags('Document') // Tag for Swagger
  @ApiOperation({ description: 'API TO CREATE DOCUMENT' }) // Description of the operation
  @ApiBody({ type: CreateDocumentDto }) // Body type for document creation
  @UseInterceptors(FilesInterceptor('documentFile')) // Intercept and handle file upload
  async createDocument(
    @Body() body: { documentCategory?: string }, // Document name passed in the request body
    @UploadedFiles() documentFile: Express.Multer.File[] // Uploaded file
  ) {
    // Validate the uploaded file (check size, type, etc.)
    await validateFile(
      {
        documentFile: documentFile,
      },
      {
        documentFile: {
          required: true,
          maxSize: 15,
          allowedTypes: this.uploadFileType, // Allowed file types
        },
      }
    );
    //console.log('documentFiles', documentFile);
    // Call service to create the document
    return await this.documentServices.createDocument(
      documentFile,
      body.documentCategory
    );
  }

  /**
   * Endpoint to update an existing document by uploading a new file.
   * @param documentFile - The new file to upload.
   * @param body - Document update details (e.g., name).
   * @returns Success message upon successful update.
   */
  @Put('updateDocument')
  @ApiTags('Document') // Tag for Swagger
  @ApiOperation({ description: 'API TO UPDATE DOCUMENT' }) // Operation description for Swagger
  @ApiBody({ type: documentDto }) // Body parameters for document update
  @UseInterceptors(FileInterceptor('documentFile')) // Handle file upload
  async updateDocument(
    @UploadedFile() documentFile: Express.Multer.File, // The uploaded document file
    @Body() body: UpdateDocumentDto // Document details to be updated
  ) {
    //console.log(`document.controller-84`, body); // Log the body for debugging (remove in production)

    // Validate the uploaded file (check size, type, etc.)
    await validateFile(
      {
        documentFile: documentFile,
      },
      {
        documentFile: {
          required: false,
          maxSize: 2, // 2MB max size
          allowedTypes: this.uploadFileType, // Allowed file types
        },
      }
    );

    // Call the service method to update the document
    return await this.documentServices.updateDocument(
      {
        documentId: body.documentId,
        documentName: body.documentName,
        documentCategory: body.documentCategory,
      },
      documentFile
    );
  }

  /**
   * Endpoint to delete a document.
   * @param data - The document ID to be deleted.
   * @returns Success message upon successful deletion.
   */
  @Delete('deleteDocument')
  @ApiTags('Document') // Tag for Swagger
  @ApiOperation({ description: 'API TO DELETE DOCUMENT' }) // Operation description for Swagger
  async deleteDocument(@Body() data: any) {
    // Call the service method to delete the document
    //console.log('DASTASTGaZsdfiUASyfda', data);
    return await this.documentServices.deleteDocument(data.documentId);
  }
}
