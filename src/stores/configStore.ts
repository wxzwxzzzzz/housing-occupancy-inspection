import { makeAutoObservable, runInAction } from 'mobx';
import {
  attendanceRuleService,
  attendanceSolutionService,
} from '@/services/domains/attendance';
import { leaveTypeService } from '@/services/domains/leave';
import type { AttendanceRule } from '@/types/ontology/prh/entities/attendance_rule';
import type { AttendanceSolution } from '@/types/ontology/prh/entities/attendance_solution';
import type { LeaveType } from '@/types/ontology/prh/entities/leave_type';

/** 监测/打卡相关的可配置项 */
export interface MonitorConfig {
  /** 当前激活的打卡方案 */
  solution: AttendanceSolution | null;
  /** 该方案下的告警规则 */
  rules: AttendanceRule[];
  /** 请假类型字典 */
  leaveTypes: LeaveType[];
}

class ConfigStore {
  config: MonitorConfig = {
    solution: null,
    rules: [],
    leaveTypes: [],
  };
  loading = false;

  constructor() {
    makeAutoObservable(this);
  }

  setLoading(loading: boolean) {
    this.loading = loading;
  }

  async fetchAll() {
    this.setLoading(true);
    try {
      const [solRes, ruleRes, ltRes] = await Promise.all([
        attendanceSolutionService.list({ page: { pageNo: 1, pageSize: 10 } }),
        attendanceRuleService.list({ page: { pageNo: 1, pageSize: 100 } }),
        leaveTypeService.list({ page: { pageNo: 1, pageSize: 100 } }),
      ]);
      runInAction(() => {
        this.config = {
          solution: solRes.data[0] ?? null,
          rules: ruleRes.data,
          leaveTypes: ltRes.data,
        };
      });
    } catch (err) {
      console.error('fetchAll config failed', err);
    } finally {
      runInAction(() => {
        this.loading = false;
      });
    }
  }

  async updateRule(rule: AttendanceRule & { id: string }) {
    await attendanceRuleService.modify(rule);
    await this.fetchAll();
  }
}

export default ConfigStore;
