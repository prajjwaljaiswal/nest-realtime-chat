import { GraphQLError } from 'graphql';

export class ErrorExceptions {
  public UserNotFound(message: string) {
    return new GraphQLError(message, {
      extensions: {
        code: 400,
        statusCode: 'Bad Input',
      },
    });
  }
}

export class GraphqlException extends GraphQLError {
  constructor(message: string, code: number) {
    super(message, undefined, undefined, undefined, undefined, undefined, {
      code: 'BAD_USER_INPUT', // add custom code to extensions object
      statusCode: code,
    });
    // this.extensions =  {
    //   code: 'BAD_USER_INPUT',
    //   statusCode: code,
    // },
  }
}
