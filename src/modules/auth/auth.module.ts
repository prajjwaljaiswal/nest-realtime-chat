import { Module } from '@nestjs/common';
import { AuthService } from './services/auth.service';
import { PasswordService } from './services/password.service';
import { UserService } from '@modules/users/services/users.service';
import { EmailService } from '@providers/email/email.service';
import { JwtModule } from '@nestjs/jwt';
import { JWT_SECRET } from '@common/constants/global.constants';
import { JwtStrategy } from './guards/auth.jwt.strategy.guards';
import { SeqeulizeService } from '@providers/sequelize/sequelize.service';
import { AuthController } from './controllers/auth.controller';
import { FileService } from '@providers/files/files.service';

@Module({
  imports: [
    JwtModule.register({
      secret: JWT_SECRET,
      signOptions: { expiresIn: '60s' },
    }),
  ],
  providers: [
    AuthService,
    PasswordService,
    UserService,
    EmailService,
    JwtStrategy,
    SeqeulizeService,
    FileService
  ],
  controllers: [AuthController],
  exports: [PasswordService],
})
export class AuthModule {}
