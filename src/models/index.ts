import { Lockout } from './lockout.model';
import { Users } from './user.model';
import { UserDocuments } from './userDocuments.model';
import { CMS } from './cmsPages.model';
import { EmailTemplate } from './emailTemplate.model';
import { Permission } from './permission.model';
import { Otp } from './otp.model';
import { Branding } from './branding.model';
import { CaseType } from './caseType.model';
import { Settings } from './settings.model';
import { Tutorial } from './tutorial.model';
import { FundingType } from './fundingType';
import { AdditionalWork } from './additionalWork.model';
import { RegisterBodies } from './registerBodies.model';
import { Specialities } from './specialities.model';
import { ExpertSpecialities } from './expertSpecialities.model';
import { ExpertCaseSpecialities } from './expertCaseSpecialities.model';
import { Cases } from './cases.model';
import { CaseDates } from './caseDates.models';
import { CaseDocuments } from './caseDocuments.model';
import { CaseSpecialities } from './caseSpecialities.model';
import { CaseSubjects } from './caseSubjects.model';
import { CaseSolicitors } from './caseSolicitors.model';
import { CaseUninvitedSolicitors } from './caseUninvitedSolicitors.model';
import { ExpertFeeStructure } from './expertFeeStructure.model';
import { CaseExperts } from './caseExperts.model';
import { CaseJobs } from './caseJobs.model';
import { CaseJobDocuments } from './caseJobDocuments.model';
import { Messages } from './messages.model';
import { MessageDocuments } from './messageDocuments.model';
import { CaseAdditionalWork } from './caseAdditionalWork.model';

const models = [
  Users,
  UserDocuments,
  Lockout,
  CMS,
  EmailTemplate,
  Permission,
  Otp,
  Branding,
  CaseType,
  Settings,
  Tutorial,
  FundingType,
  AdditionalWork,
  RegisterBodies,
  Specialities,
  ExpertSpecialities,
  ExpertCaseSpecialities,
  Cases,
  CaseDates,
  CaseDocuments,
  CaseSpecialities,
  CaseSubjects,
  CaseSolicitors,
  CaseUninvitedSolicitors,
  CaseExperts,
  ExpertFeeStructure,
  CaseJobs,
  CaseJobDocuments,
  Messages,
  MessageDocuments,
  CaseAdditionalWork
];
export default models;
