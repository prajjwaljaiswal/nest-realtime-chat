import { BadRequestException, Injectable } from '@nestjs/common';
import { SeqeulizeService } from '@providers/sequelize/sequelize.service';
import { Document } from '../../models/document.model';
import { optionalDocumentParams, UpdateDocumentDto } from './dto/document.dto';
import {
  DEFAULT_LIMIT,
  DEFAULT_PAGE,
} from '@common/constants/global.constants';
import { searchingAllFields } from '@common/global-helpers/all.helpers';
import * as fs from 'fs';
import * as path from 'path';
import { GetResponse } from '@common/global-interfaces';
import { FileService } from '@providers/files/files.service';
import { DocumentCategory } from '@src/models/documentCategory';
import { Op } from 'sequelize';

@Injectable()
export class DocumentService {
  constructor(
    private readonly db: SeqeulizeService, // Database service to interact with the Document model
    private readonly fileUpload: FileService // Service to handle file uploads
  ) {}

  /**
   * Fetches a list of documents based on optional filters and pagination.
   * @param parameter - Parameters for filtering and pagination.
   * @returns The paginated list of documents with metadata (total count, page, limit).
   */
  async getDocument(parameter: optionalDocumentParams) {
    try {
      // Set pagination default values if not provided
      const page = parameter?.page || DEFAULT_PAGE;
      const limit = Number(parameter?.limit) || DEFAULT_LIMIT;

      let whereClause = {}; // Initialize the where clause for filtering
      if (parameter?.documentId) {
        whereClause = {
          documentId: parameter.documentId,
        };
      }

      // const includeClause: any[] = []; // Placeholder for any related entities to include in the query (if any)
      let sortField = 'createdAt'; // Default field to sort by
      let sortOrder = 'DESC'; // Default sort order

      // If sorting is provided, update the sorting field and order
      if (parameter?.sort) {
        const [field, direction] = parameter.sort.split('_');
        sortField = field;
        sortOrder = direction.toUpperCase() === 'DESC' ? 'DESC' : 'ASC';
      }

      const searchString = parameter?.keyword; // Search keyword, if provided

      // If a search keyword is provided, create the search condition for the query
      if (searchString) {
        const searchFields = ['documentName']; // Specify the fields to search in
        const searchCondition = searchingAllFields(searchFields, searchString);
        whereClause = { ...whereClause, ...searchCondition };
      }

      // Query the database for documents with the specified filters, pagination, and sorting
      const { rows: data, count } = await this.db.findAndCount(Document, {
        where: whereClause,
        include: [{ model: DocumentCategory }],
        limit,
        offset: limit * (page - 1),
        order: [[sortField, sortOrder]],
      });

      // Return the result in a paginated format
      const result: GetResponse = {
        page: page,
        limit: limit,
        total: count,
        result: data,
      };
      return result;
    } catch (error) {
      // Handle errors if any (to be enhanced with specific error handling)
    }
  }

  /**
   * Creates a new document entry and uploads its file.
   * @param documentName - The name of the document.
   * @param documentFile - The file to be uploaded.
   * @returns Success message upon successful creation.
   */
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  async createDocument(
    documentFile: Express.Multer.File[],
    documentCategory: string
  ) {
    //console.log({ documentCategory });
    const categoryData = await this.db.get(DocumentCategory, {
      where: {
        id: documentCategory,
      },
    });
    // Upload the document file using the file upload service

    for (const document of documentFile) {
      const documentURL = await this.fileUpload.uploadFileDocument(
        document as Express.Multer.File,
        categoryData.slug,
        'documents'
      );
      await this.db.create(Document, {
        documentName: document.originalname,
        documentURL: documentURL.replaceAll('\\', '/'),
        categoryId: documentCategory,
      });
    }

    return {
      message: 'Document created successfully!',
    };
  }

  /**
   * Updates an existing document by uploading a new file and updating its details.
   * @param parameter - The document update details.
   * @param documentFile - The new file to be uploaded.
   * @returns Success message if the update is successful.
   */
  async updateDocument(
    parameter: UpdateDocumentDto,
    documentFile: Express.Multer.File
  ) {
    const categoryData = await this.db.get(DocumentCategory, {
      where: {
        id: parameter.documentCategory,
      },
    });

    if (!categoryData) throw new BadRequestException('No category found');
    const documentUploadObj = {
      documentName: parameter.documentName,
      categoryId: categoryData.id,
    } as {
      documentName: string;
      categoryId: string;
      documentURL?: string;
    };
    // If a file is uploaded, update the document URL with the new file
    if (documentFile) {
      documentUploadObj.documentURL = (
        await this.fileUpload.uploadFileDocument(documentFile, categoryData.id, 'documents')
      )?.replaceAll('\\', '/');
    }

    // Update the document in the database using the provided data
    const [dbResult] = await this.db.update(Document, documentUploadObj, {
      where: { id: parameter.documentId },
    });

    // Return success message if the document was updated
    if (dbResult > 0) {
      return { message: 'Document updated successfully!' };
    }
  }

  /**
   * Deletes an existing document from the database.
   * @param parameter - The document ID to be deleted.
   * @returns Success message if the document is deleted successfully.
   */
  async deleteDocument(ids: any) {
    // Fetch the documents by their IDs
    const documents = await this.db.get(Document, {
      where: {
        id: {
          [Op.in]: ids,
        },
      },
    });

    // Make sure documents is always an array
    const docsArray = Array.isArray(documents) ? documents : [documents];

    if (docsArray.length === 0) {
      throw new BadRequestException('No document found');
    }
    for (const doc of docsArray) {
      const filePath = path.resolve(doc.documentURL);
      if (fs.existsSync(filePath)) {
        try {
          fs.unlinkSync(filePath);
          //console.log(`File deleted from local storage: ${filePath}`);
        } catch (error) {
          console.error('Error deleting file from local storage:', error);
        }
      }
    }

    // Delete documents from the database
    await this.db.delete(Document, {
      where: {
        id: {
          [Op.in]: ids,
        },
      },
    });

    return {
      message: 'Document deleted successfully!',
    };
  }
}

// If the document is not found, throw an error
