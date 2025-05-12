// import { Role } from '@common/@generated/prisma/role.enum';
// import { Request, Response } from 'express';
// export interface IHttpContext {
//   req?: IRequestWithUser;
//   res?: Response;
// }

// export interface IRequestWithUser extends Request {
//   user?: IUserFromRequest;
//   res?: Response;
//   session: any;
// }

// export interface IUserFromRequest {
//   id: string;
//   email: string;
//   role: Role;
// }

// export interface ISessionAuthToken {
//   accessToken: string;
//   refreshToken: string;
// }

export interface IPayloadUserJwt {
  userId: string;
  role?: string;
  email?: string;
  rememberme?: boolean;
  lastLogin?: string;
}

export interface GetResponse {
  result: { [key: string]: unknown }[] | unknown[];
  page: number;
  limit: number;
  total: number;
}
