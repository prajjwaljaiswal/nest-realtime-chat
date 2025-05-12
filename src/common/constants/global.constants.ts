//eslint-disable-next-line
require('dotenv').config();

export const JWT_SECRET = process.env.JWT_SIGNATURE;
export const JWT_EXPIRY_SECONDS = 3600;

export enum ROLES_ENUM {
  SUPERADMIN = 'SUPERADMIN',
  ADMIN = 'ADMIN',
  SOLICITOR = 'SOLICITOR',
  EXPERT = 'EXPERT',
}
export const PASSWORD_CHANGE_EXPIRE = 60;
export const ROLES = {
  SUPERADMIN: 'SUPERADMIN',
  ADMIN: 'ADMIN',
  SOLICITOR: 'SOLICITOR',
  EXPERT: 'EXPERT',
};
export const DEFAULT_PAGE = 1;
export const DEFAULT_LIMIT = 20;
export const DEFAULT_SORT_BY = 'updatedAt';

export const API_PREFIX = '/api/v1';

//Regex
export const PHONE_REGEX = /^[0-9\s+-.()]+$/;

export const SLUG_SEPARATOR = '-';

export const HAZARD_TYPE = {
  GENERAL_HAZARD: 'General Hazards',
  JOB_HAZARD: 'Job Hazards',
  CHEMICAL_HAZARD: 'Chemicals',
  GENERAL_SAFETY: 'General Safety',
};
