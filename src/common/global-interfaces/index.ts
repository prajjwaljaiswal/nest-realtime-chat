export * from './http-interface';
export type ROLES = 'SUPERADMIN' | 'ADMIN' | 'SOLICITOR' | 'EXPERT';
export type APPROVE_STATUS = 'PENDING' | 'APPROVED' | 'REJECTED';
export type CASE_STATUS = 'ACTIVE' | 'HOLD' | 'REOPEN' | 'CLOSED';
export enum CASE_DOCUMENT_TYPE {
  CASE_DOCUMENT = 'CASE_DOCUMENT',
  LOI_DOCUMENT = 'LOI_DOCUMENT',
  EXPERT_REPORT = 'EXPERT_REPORT',
  OTHER = 'OTHER',
}
export enum CASE_JOB_TYPES {
  MAIN_REPORT = 'MAIN_REPORT',
  ADDENDUM_REPORT = 'ADDENDUM_REPORT',
  COURT_ATTENDANCE = 'COURT_ATTENDANCE',
  COURT_TESTIMONY = 'COURT_TESTIMONY',
}
export enum JOB_STATUS {
  PENDING = 'PENDING',
  IN_PROGRESS = 'IN_PROGRESS',
  COMPLATED = 'COMPLATED',
  CANCELLED = 'CANCELLED',
  REJECTED = 'REJECTED'
}
export type CASE_DATE_TYPE = 'MEETING' | 'COURT';
export type CASE_INVITATION_STATUS = 'PENDING' | 'ACCEPTED' | 'REJECTED';
export type UNINVITATION_SOLICITOR_STATUS = 'PENDING' | 'INVITED';
export type LLA_APPROVAL_STATUS = 'PENDING' | 'ACCEPTED' | 'REJECTED';
export type SOLICITOR_ROLE = 'LEAD' | 'SUPPORTER';
export type USER_DOCUMENT_TYPES = 'CV' | 'REGULATORY' | 'REGISTRATION_BODY' | 'REGISTRATION_NUMBER' | 'TRANING' | 'VAT_REGISTRATION';

export interface FileValidationRules {
  required?: boolean;
  maxSize?: number;
  allowedTypes?: string[];
}
export type Dialect =
  | 'postgres'
  | 'mysql'
  | 'sqlite'
  | 'mariadb'
  | 'mssql'
  | 'db2'
  | 'snowflake'
  | 'oracle';
