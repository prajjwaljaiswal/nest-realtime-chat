import { envConfig } from '@common/configs/env.config';
import { IPayloadUserJwt } from '@common/global-interfaces';
import { Injectable } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class PasswordService {
  constructor(private jwtService: JwtService) {}
  private salt_number = 10;

  public async validatePassword(password: string, hashedPassword: string) {
    return await bcrypt.compare(password, hashedPassword);
  }

  public async hashPassword(password: string) {
    const salt = await bcrypt.genSalt(this.salt_number);
    return await bcrypt.hash(password, salt);
  }

  public async generateAuthTokenFromLogin(payload: IPayloadUserJwt) {
    const envJwt = envConfig().jwtOptions;
    let accessTokenExpiresIn = envJwt.tokenExpiresOnRemeberMe;
    const refreshTokenExpiresIn = envJwt.accessTokenExpiresIn;

    if (payload.rememberme) {
      accessTokenExpiresIn = envJwt.accessTokenExpiresIn;
    }
    return {
      accessToken: await this.jwtService.signAsync(payload, {
        expiresIn: accessTokenExpiresIn,
      }),
      refreshToken: await this.jwtService.signAsync(payload, {
        expiresIn: refreshTokenExpiresIn,
      }),
      tokenExpiry: new Date(
        Date.now() + accessTokenExpiresIn * 1000
      ).toISOString(),
    };
  }
}
