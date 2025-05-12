import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from '@modules/auth/auth.module';
import { UsersModule } from '@modules/users/users.module';
import { APP_GUARD } from '@nestjs/core';
import { JwtAuthGuard } from '@modules/auth/guards/auth.jwt.guards';
import { RolesGuard } from '@modules/auth/guards/roles.guards';
import { SequelizeModule } from '@nestjs/sequelize';
import { SequelizeModule as DBModule } from '@providers/sequelize/sequelize.module';
import { EmailTemplateModule } from '@modules/emailTemplate/emailTemplate.module';
import { PermissionModule } from '@modules/permission/permission.module';
import { ConfigModule } from '@nestjs/config';

import { MessagesModule } from '@modules/messages/messages.module';

import { Dialect } from '@common/global-interfaces';
import { DocumentModule } from '@modules/document/document.module';
import { DocumentCategoryModule } from '@modules/documentCategory/documentCategory.module';

import { SocketModule } from '@modules/socket/socket.module';
@Module({
  imports: [
    SequelizeModule.forRoot({
      dialect: (process.env.DB_CONNECTOR || 'postgres') as Dialect,
      host: process.env.DB_HOST,
      port: Number(process.env.DB_PORT || 5432),
      username: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_DATABASE,
      autoLoadModels: true,
      synchronize: true,
    }),
    ConfigModule.forRoot({ isGlobal: true }),
    DBModule,
    AuthModule,
    UsersModule,
    EmailTemplateModule,
    PermissionModule,
    DocumentModule,
    MessagesModule,
    DocumentCategoryModule,
    SocketModule,
  ],
  controllers: [AppController],
  providers: [
    {
      provide: APP_GUARD,
      useClass: JwtAuthGuard,
    },
    {
      provide: APP_GUARD,
      useClass: RolesGuard,
    },
    AppService,
  ],
})
export class AppModule {}
