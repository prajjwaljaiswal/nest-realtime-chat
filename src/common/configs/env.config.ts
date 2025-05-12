import dotenv from 'dotenv';
import { join } from 'path';
import { Algorithm } from 'jsonwebtoken';
import { JwtModuleOptions } from '@nestjs/jwt';

export const envConfig = (): EnvConfig => {
  const mode = process.env.NODE_ENV;

  dotenv.config();
  // if (!mode || mode === 'development') {
  // } else {
  //   dotenv.config({ path: `.env.${mode}` });
  // }

  const port = parseInt(process.env.PORT) || 5025;

  return {
    mode,
    port,
    isDevelopment: process.env.NODE_ENV === 'development',
    isProduction: process.env.NODE_ENV === 'production',
    serverUrl: process.env.SERVER_URL || `http://localhost:8000`,
    clientUrl: process.env.CLIENT_URL || `http://localhost:3002`,
    sessionSecret: process.env.SESSION_SECRET || `123456`,
    cookieSecret: process.env.COOKIE_SECRET || `123456`,
    secret: '1234567894561456789413testsecert',
    uploadPath: 'public/uploads/',
    redis: {
      port: process.env.REDIS_PORT,
      host: process.env.REDIS_HOST,
      ttl: 15, // seconds
    },
    graphql: {
      // typePaths: ['./**/*.graphql'],
      autoSchemaFile: join(process.cwd(), 'src/schema.graphql'),
      playground: true,
      // definitions: {
      //   path: join(process.cwd(), 'src/graphql.ts'),
      // },
      sortSchema: true,
      tracing: false,
    },
    jwtOptions: {
      privateKey: process.env.JWT_PRIVATE_KEY,
      publicKey: process.env.JWT_PUBLIC_KEY,
      secret: process.env.JWT_PRIVATE_KEY,
      secretOrPrivateKey: process.env.JWT_PRIVATE_KEY,
      signOptions: {
        algorithm: process.env.JWT_ALGORITHM as Algorithm,
        expiresIn: Number(process.env.JWT_EXPIRE_TIME),
      },
      accessTokenExpiresIn: 60 * 60 * 24 * 7, //7 Days
      refreshTokenExpiresIn: 60 * 60 * 24 * 30, // 30 days
      tokenExpiresOnRemeberMe: 60 * 60 * 24 * 1,
    },
    security: {
      expiresIn: 3600 * 24, // 24h
      bcryptSaltOrRound: 10,
    },
  };
};

export interface IJwtOptions extends JwtModuleOptions {
  accessTokenExpiresIn: number;
  refreshTokenExpiresIn: number;
  tokenExpiresOnRemeberMe: number;
}
export interface EnvConfig {
  mode: string;
  port: number;
  isDevelopment: boolean;
  isProduction: boolean;
  serverUrl: string;
  clientUrl: string;
  sessionSecret: string;
  cookieSecret: string;
  secret: string;
  uploadPath: string;
  redis: {
    port: string;
    host: string;
    ttl: number;
  };
  graphql: {
    // typePaths: string[];
    autoSchemaFile: string;
    playground: boolean;
    // definitions: {
    //   path: string;
    // };
    sortSchema: boolean;
    tracing: boolean;
  };
  jwtOptions: IJwtOptions;
  security: {
    expiresIn: number;
    bcryptSaltOrRound: number;
  };
}
