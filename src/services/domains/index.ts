/**
 * 域服务统一导出
 *
 * 业务页面只 import 这里:
 *   import { residentService, attendanceService, alertService, factService } from '@/services/domains';
 */

export * from './auth';
export * from './resident';
export * from './household';
export * from './attendance';
export * from './leave';
export * from './eligibility';
export * from './migrant-work';
export * from './change';
export * from './approval';
export * from './basedoc';
export * from './arche';
export * from './resource';
export * from './facts';
export * from './alert';
export * from './fence';
export * from './notification';
export * from './sys-config';
export * from './rbac';
export * from './saved-filter';
export * from './approval-flow';
