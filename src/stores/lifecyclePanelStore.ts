import { makeAutoObservable } from 'mobx';

/**
 * 状态机流程面板上下文 — 状态机类实体(补贴/配租)详情页注入当前流程,
 * 右侧 rail 据此显示「流程」入口并默认展开。
 *
 * 与审批面板(approvalPanelStore)的区别:
 *   - 审批面板:审批流实体(通过/驳回 + 审批记录时间线)
 *   - 流程面板:状态机实体(生命周期节点,当前状态高亮,无操作)
 *
 * 详情页 mount 时 setContext(title, steps, currentStatus),unmount 时 clear()。
 */

/** 单个流程节点 */
export interface LifecycleStep {
  /** 状态值,对应实体 status */
  status: string;
  /** 节点显示名 */
  label: string;
  /** 节点类型:main 主流程 / branch 分支(暂停等) / terminal 终态 */
  kind?: 'main' | 'branch' | 'terminal';
  /** 节点说明(可选) */
  desc?: string;
}

class LifecyclePanelStore {
  /** 面板标题,如「补贴状态流程」 */
  title: string | null = null;
  /** 流程节点定义 */
  steps: LifecycleStep[] = [];
  /** 当前状态值 */
  currentStatus: string | undefined = undefined;
  /** 状态值对应的字典名(用于翻译当前状态显示),如 'SubsidyStatus' */
  dictName: string | undefined = undefined;
  /** 强制重新渲染的版本号 */
  version = 0;

  constructor() {
    makeAutoObservable(this);
  }

  get active(): boolean {
    return !!this.title && this.steps.length > 0;
  }

  setContext(
    title: string,
    steps: LifecycleStep[],
    currentStatus?: string,
    dictName?: string,
  ) {
    this.title = title;
    this.steps = steps;
    this.currentStatus = currentStatus;
    this.dictName = dictName;
    this.version += 1;
  }

  clear() {
    this.title = null;
    this.steps = [];
    this.currentStatus = undefined;
    this.dictName = undefined;
  }
}

export default LifecyclePanelStore;
