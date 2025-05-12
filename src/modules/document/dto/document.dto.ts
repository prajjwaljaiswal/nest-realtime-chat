import { IsNotEmpty, IsOptional, IsString } from 'class-validator';
import { GetAllUsersDTO } from '@modules/users/dto/users.dto';

/**
 * DTO for deleting a document by its ID.
 */
class documentDto {
  @IsString() // Validate that the documentId is a string
  @IsNotEmpty() // Ensure that the documentId is not empty
  documentId: string; // The unique identifier for the document to be deleted
}

/**
 * DTO for optional document parameters, extends GetAllUsersDTO
 * to add filtering and pagination options for document retrieval.
 */
class optionalDocumentParams extends GetAllUsersDTO {
  @IsString() // Validate that the documentId is a string (optional)
  @IsOptional() // Makes the documentId optional for this DTO
  documentId: string; // Optionally filter documents by documentId
}

/**
 * DTO for creating a new document.
 */
class CreateDocumentDto {
  @IsString() // Validate that the documentName is a string
  @IsNotEmpty() // Ensure that the documentName is not empty
  documentName: string; // The name of the document being created
}

/**
 * DTO for updating an existing document.
 */
class UpdateDocumentDto {
  @IsString() // Validate that the documentId is a string
  @IsNotEmpty() // Ensure that the documentId is not empty
  documentId: string; // The unique identifier of the document to be updated

  @IsString() // Validate that the documentName is a string (optional)
  @IsOptional() // Makes the documentName optional for this DTO
  documentName: string; // Optionally update the documentName

  @IsString() // Validate that the documentId is a string
  @IsNotEmpty() // Ensure that the documentId is not empty
  documentCategory: string;
}

export {
  documentDto, // Export the DTO for deleting a document
  CreateDocumentDto, // Export the DTO for creating a document
  optionalDocumentParams, // Export the DTO for optional document parameters
  UpdateDocumentDto, // Export the DTO for updating a document
};
