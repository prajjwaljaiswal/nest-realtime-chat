// import { Injectable } from "@nestjs/common";
// import { envConfig, EnvConfig } from "@common/configs/env.config";
// import { MailerService, ISendMailOptions } from "@nestjs-modules/mailer";
// // import fs from 'fs';
// // import path from 'path';
// // import ejs from 'ejs';

// type MailOptions = ISendMailOptions & { template?: string };

// @Injectable()
// export class EmailService {
//   private _env: EnvConfig;
//   constructor(private mailer: MailerService) {
//     this._env = envConfig();
//   }
//   private sendMail(options: MailOptions) {
//     try {
//       if (this._env.mode !== "test") {
//         return this.mailer.sendMail(options);
//       }
//       return null;
//     } catch (error: any) {
//       console.log("SMTP Error Occured", error);
//       throw error;
//     }
//   }

//   async sendEmail(data: {
//     template: string;
//     email: string;
//     subject: string;
//     cc?: string;
//     body: any;
//   }): Promise<void> {
//     const envConf = envConfig();
//     console.log(
//       "`${envConf.clientUrl}assets/images/logoVipr.png` ",
//       `${envConf.clientUrl}assets/images/logoVipr.png`,
//     );
//     console.log(`email.service-40`, data);
//     this.sendMail({
//       template: `${data.template}.hbs`,
//       to: data.email,
//       subject: data.subject,
//       cc: data?.cc,
//       context: {
//         body: data.body,
//         serverUrl: envConf.serverUrl,
//         logoPath: `${envConf.clientUrl}assets/images/logoVipr.png`,
//         clientUrl: envConf.clientUrl,
//       },
//     });
//   }
// }

import { Injectable } from '@nestjs/common';
import { envConfig, EnvConfig } from '@common/configs/env.config';
import { MailerService, ISendMailOptions } from '@nestjs-modules/mailer';
import { SeqeulizeService } from '@providers/sequelize/sequelize.service';
import { EmailTemplate } from '@src/models/emailTemplate.model';

type MailOptions = ISendMailOptions & { template?: string };

@Injectable()
export class EmailService {
  private _env: EnvConfig;
  constructor(
    private readonly db: SeqeulizeService,
    private mailer: MailerService
  ) {
    this._env = envConfig();
  }
  private sendMail(options: MailOptions) {
    try {
      if (this._env.mode !== 'test') {
        return this.mailer.sendMail(options);
      }
      return null;
    } catch (error: any) {
      console.log('SMTP Error Occured', error);
      throw error;
    }
  }

  async sendEmail(data: {
    template: string;
    slug: string;
    email: string;
    subject: string;
    cc?: string;
    body: any;
  }): Promise<void> {
    const envConf = envConfig();

    // Fetch the template from the database by subject
    const template = await this.db.get(EmailTemplate, {
      where: { slug: data.slug },
    });

    if (!template) {
      throw new Error(`Email template not found for slug: ${data.slug}`);
    }

    // Replace placeholders (like {{{body.url}}}) with the actual data in body
    let renderedContent = template?.dataValues?.content;
    let renderSubject = template?.dataValues?.subject;
    // Replace placeholders in the subject
    for (const key in data.body) {
      const placeholder = new RegExp(`{{{\\s*body\\.${key}\\s*}}}`, 'g');

      renderedContent = renderedContent.replace(placeholder, data.body[key]);
      renderSubject = renderSubject.replace(placeholder, data.body[key]);
    }
    if(data?.email) {
      // Send email with the rendered content
      this.sendMail({
        to: data.email,
        subject: renderSubject,
        cc: data?.cc,
        html: renderedContent, // Use the 'html' option for raw HTML content
      });
    }
  }
}
