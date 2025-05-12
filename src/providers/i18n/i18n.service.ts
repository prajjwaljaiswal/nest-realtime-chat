import { Injectable } from '@nestjs/common';
import fs from 'fs';
import { join } from 'path';

@Injectable()
export class I18nService {
  constructor() {
    this.translate()('en');
  }
  async getFiles() {
    const languages = fs.readdirSync(join(process.cwd(), `/src/common/i18n`));
    const combinedLanguage = {};
    for (const lang of languages) {
      const files = await fs.readdirSync(
        join(process.cwd(), `/src/common/i18n/${lang}`)
      );
      combinedLanguage[lang] = {};
      for (const model of files) {
        const langJson = fs.readFileSync(
          join(process.cwd(), `/src/common/i18n/${lang}/${model}`),
          { encoding: 'utf8', flag: 'r' }
        );

        try {
          combinedLanguage[lang] = {
            ...combinedLanguage[lang],
            ...JSON.parse(langJson),
          };
        } catch (error) {
          console.log('klg-28', error);
        }
      }
    }
    return combinedLanguage;
    // this.allLanguageJSON = combinedLanguage;
  }

  translate() {
    try {
      let languages = {};
      return async (lang: string) => {
        if (languages.hasOwnProperty(lang)) return languages[lang];
        languages = await this.getFiles();
      };
    } catch (error) {
      throw error;
    }
  }
}
