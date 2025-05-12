import {
  // BadRequestException,
  UnprocessableEntityException,
  ValidationError,
  // ValidationPipe,
  // ValidationPipeOptions,
} from '@nestjs/common';
// import { GraphQLError } from 'graphql';

/**
 * The class-validator package does not support i18n and thus we will
 * translate the error messages ourselves.
 */
export const translateErrors = (validationErrors: ValidationError[]) => {
  // console.log('validation', JSON.stringify(validationErrors, null, 2));

  const error_messages = validationErrors.reduce((vl: any, val: any) => {
    vl[val.property] = val?.children?.length
      ? val?.children.reduce((childJson: any, childVal: any) => {
          // console.log('cccc', childVal, childJson);
          childJson[childVal.property] = Object.values(childVal.constraints);
          return childJson;
        }, {})
      : Object.values(val.constraints);
    return vl;
  }, {});
  // console.log('error_messages', error_messages);
  let message = 'Validation Error';
  const keys = Object.keys(error_messages);
  if (keys.length) {
    const messageField = error_messages[keys[0]];
    if (messageField.length) {
      message = messageField[0];
    }
  }
  const errrors = {
    message: message,
    error: error_messages,
  };
  return new UnprocessableEntityException(errrors);
};
