import { Module } from '@nestjs/common';
import { UsersController } from './controllers/users.controller';
import { UserService } from './services/users.service';
import { PasswordService } from '@modules/auth/services/password.service';
import { EmailService } from '@providers/email/email.service';
import { JwtService } from '@nestjs/jwt';
import { EmailModule } from '@providers/email/email.module';
import { SeqeulizeService } from '@providers/sequelize/sequelize.service';
import { CsvService } from './services/csv.service';

@Module({
  imports: [EmailModule],
  providers: [
    SeqeulizeService,
    UserService,
    PasswordService,
    EmailService,
    JwtService,
    CsvService,
  ],
  controllers: [UsersController],
})
export class UsersModule {}
