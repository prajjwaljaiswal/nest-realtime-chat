import { envConfig } from '@common/configs/env.config';
//---------------------------------------------------------
/**
 * Custom graphql factory
 *
 */
export const graphqlModuleFactory = async () => {
  const graphqlEnvironmentOptions = envConfig().graphql;
  // const logger = new Logger();
  return {
    ...graphqlEnvironmentOptions,

    context: ({ req }) => ({ req }),
    // context: ({ req, connection }) => {
    //   if (!connection) {
    //     // Http request
    //     return {
    //       token: undefined as string | undefined,
    //       req: req as Request,
    //     };
    //   } else {
    //     // USE THIS TO PROVIDE THE RIGHT CONTEXT FOR I18N
    //     return {
    //       token: undefined as string | undefined,
    //       req: connection.context as Request,
    //     };
    //   }
    // },
    debug: true,
    formatError: (error: any) => {
      //console.log('klg-31', error);

      let newErrors = error.message;
      try {
        newErrors = JSON.parse(error.message);
      } catch (error) {}

      const graphQLFormattedError = {
        message: error.extensions?.response?.message || newErrors,
        code:
          error.extensions?.originalError?.error ||
          error.extensions?.code ||
          'SERVER_ERROR',
        name: error.extensions?.name || error.name,

        statusCode:
          error?.extensions?.status ||
          error?.extensions?.originalError?.statusCode ||
          500,
      };
      return graphQLFormattedError;
    },
  };
};
