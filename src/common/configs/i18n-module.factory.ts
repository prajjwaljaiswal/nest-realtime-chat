import { envConfig } from './env.config';
import { join } from 'path';

export const i18nModuleFactory = async () => {
  //console.log(process.cwd());
  //console.log(__dirname);
  //console.log(join(__dirname, '../i18n/'));
  //console.log(join(__dirname, '/i18n/'));
  return {
    fallbackLanguage: 'en',
    parserOptions: {
      path: join(process.cwd(), '/src/common/i18n/'),
      watch: envConfig().isDevelopment,
    },
  };
};
