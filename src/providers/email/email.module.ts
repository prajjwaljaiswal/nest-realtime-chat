import { Module } from '@nestjs/common';
import { MailerModule } from '@nestjs-modules/mailer';
import { HandlebarsAdapter } from '@nestjs-modules/mailer/dist/adapters/handlebars.adapter';
import { EmailService } from './email.service';
import { SequelizeModule } from '@providers/sequelize/sequelize.module';

@Module({
  imports: [
    MailerModule.forRoot({
      transport: {
        host: 'mail.24livehost.com', // SMTP server address
        port: 587, // SMTP port
        ignoreTls: true, //
        secure: false, // Use false for non-SSL connection (should be true if using SSL)
        auth: {
          user: 'testna10@24livehost.com', // Correct email address, no 'mailto:'
          pass: '{B9klb4vh}C', // Ensure correct password (and avoid unnecessary characters if possible)
        },
      },
      defaults: {
        from: '"Expert Witness Gateway" <support@nestapp.com>', // From email, no 'mailto:' prefix
      },
      template: {
        dir: process.cwd() + '/src/providers/email/templates', // Ensure this is correct path to your templates
        adapter: new HandlebarsAdapter(),
        options: {
          strict: true, // Enforces stricter template rendering (e.g., no undefined variables)
        },
      },
    }),
    SequelizeModule,
  ],
  providers: [EmailService],
  exports: [EmailService],
})
export class EmailModule {}
