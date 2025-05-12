import { ExtractJwt, Strategy } from 'passport-jwt';
import { PassportStrategy } from '@nestjs/passport';
import { Injectable, UnauthorizedException } from '@nestjs/common';

import { JWT_SECRET } from '@common/constants/global.constants';
import { Users } from '@src/models/user.model';
import { SeqeulizeService } from '@providers/sequelize/sequelize.service';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(private db: SeqeulizeService) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: JWT_SECRET,
    });
  }

  async validate(payload: {
    userId: string;
    lastLogin: string;
  }): Promise<Users> {
    // TODO We need to expire token here
    const user = (
      await this.db.get(Users, {
        where: {
          id: payload.userId,
          lastLogin: payload?.lastLogin || new Date(),
          status: true,
          isDeleted: false,
        },
      })
    )?.toJSON();
    if (!user) {
      throw new UnauthorizedException();
    }

    return user;
  }
}
