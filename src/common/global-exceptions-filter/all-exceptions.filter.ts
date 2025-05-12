import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  UnauthorizedException,
} from '@nestjs/common';
import { BaseExceptionFilter } from '@nestjs/core';
import { Response } from 'express';
// import { Prisma } from '@prisma/client';
import { BadRequestException } from '@nestjs/common';
import { GqlArgumentsHost, GqlExceptionFilter } from '@nestjs/graphql';

class InvalidFormException extends BadRequestException {
  constructor(
    private errors: { [key: string]: string },
    message: string
  ) {
    super(message);
  }

  getErrorMessage(): string {
    return this.message;
  }

  getFieldErrors(): { [key: string]: string } {
    return this.errors;
  }
}

@Catch(UnauthorizedException)
export class UnauthorizedExceptionFilter implements GqlExceptionFilter {
  catch(exception: UnauthorizedException, host: GqlArgumentsHost) {
    const response = host.switchToHttp().getResponse();
    const statusCode = exception.getStatus();
    const message = exception.message || 'Unauthorized';
    response.status(statusCode).json({
      errors: [
        {
          message,
          extensions: {
            code:
              statusCode === 401 ? 'UNAUTHENTICATED' : 'INTERNAL_SERVER_ERROR',
            originalError: {
              statusCode,
              message,
            },
          },
        },
      ],
    });
  }
}

@Catch(InvalidFormException)
export class InvalidFormExceptionFilter implements ExceptionFilter {
  catch(exception: any, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const status = exception.getStatus();

    response.status(status).send({
      statusCode: status,
      errors: exception.getFieldErrors(),
    });
  }
}

// Avoid always try catch
@Catch()
export class AllExceptionsFilter extends BaseExceptionFilter {
  catch(exception: any, host: ArgumentsHost) {
    switch (host.getType() as string) {
      case 'http':
        //console.log({ exception });
        const ctx = host.switchToHttp();
        const response = ctx.getResponse<Response>();
        const status = exception?.getStatus ? exception?.getStatus() : 500;
        const message = exception?.getResponse
          ? exception?.getResponse()?.message
          : 'Internal Server Error';
        // if (
        //   exception instanceof Prisma.PrismaClientKnownRequestError ||
        //   exception instanceof Prisma.PrismaClientValidationError
        // ) {
        //   message = 'Prisma Validation failed';
        // }
        // Catch error direct if is http request
        return response.status(status).send({
          statusCode: status,
          message,
          error: exception.getResponse
            ? exception.getResponse()?.error
            : exception.message,
        });

      case 'graphql':
        // Catch graphql request error with apollo-error-converter
        // Fill name, code, type fields for Apollo Error Converter
        if (!exception.type) {
          exception.type = exception.constructor?.name || exception.message;
        }
        if (!exception.code) {
          exception.code = exception.status;
        }
        return exception;
      default:
        super.catch(exception, host);
        return;
    }
  }
}
