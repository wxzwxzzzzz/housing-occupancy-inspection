/**
 * 公租房保障监管 (cn.byteawake.prh) — 保障居民
 * Generated from ontology/byteawake-prh.cn.byteawake.prh.xml
 */

import type { OntologyObject, IAuditInfo, ITenant, ILogicDelete } from '../../ap/oms';
import type { User } from '../../ap/arche';
import type { Gender, MaritalStatus, GuaranteeType, ResidentStatus, TerminationReason } from '../enums';

/** 保障居民 */
export interface Resident extends OntologyObject, IAuditInfo, ITenant, ILogicDelete {
  /** 姓名 */
  fullName: string;
  /** 身份证号 */
  idCardNo: string;
  /** 手机号 */
  phone?: string;
  /** 邮箱 */
  email?: string;
  /** 性别 */
  gender?: Gender;
  /** 出生日期 */
  birthDate?: string;
  /** 婚姻状况 */
  maritalStatus?: MaritalStatus;
  /** 保障类型 */
  guaranteeType?: GuaranteeType;
  /** 居民状态 */
  status: ResidentStatus;
  /** 身份证正面照片 */
  idCardFrontPhoto?: string;
  /** 身份证背面照片 */
  idCardBackPhoto?: string;
  /** 人脸照片 */
  facePhoto?: string;
  /** 户口本照片 */
  householdBookPhoto?: string;
  /** 银行流水照片 */
  bankFlowPhoto?: string;
  /** 婚姻证明照片 */
  marriageCertPhoto?: string;
  /** 收入证明照片 */
  incomeCertPhoto?: string;
  /** 社保证明照片 */
  socialSecurityPhoto?: string;
  /** 关联系统用户 */
  user?: User;
  /** 归档原因 */
  archiveReason?: TerminationReason;
  /** 归档日期 */
  archiveDate?: string;
  /** 归档备注 */
  archiveNote?: string;
  [key: string]: unknown;
}
