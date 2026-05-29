import { makeAutoObservable } from 'mobx';

/**
 * 审批面板上下文 — 详情页注入当前单据,右侧 rail 据此显示「审批」入口并默认展开。
 *
 * 详情页 mount 时 setContext(objectType, bizRef, status),unmount 时 clear()。
 * BasicLayout 的右侧 rail 读取此 store:有 context 时显示审批图标组,
 * 且当 status===UNDER_APPROVAL 时默认展开审批面板。
 */
class ApprovalPanelStore {
  objectType: string | null = null;
  bizRef: string | null = null;
  status: string | undefined = undefined;
  /** 详情页提供的刷新回调 */
  onApproved: (() => void) | null = null;
  /** 用于强制重新拉取记录的版本号 */
  version = 0;

  constructor() {
    makeAutoObservable(this);
  }

  get active(): boolean {
    return !!this.objectType && !!this.bizRef;
  }

  get pending(): boolean {
    return this.status === 'UNDER_APPROVAL';
  }

  setContext(
    objectType: string,
    bizRef: string,
    status?: string,
    onApproved?: () => void,
  ) {
    this.objectType = objectType;
    this.bizRef = bizRef;
    this.status = status;
    this.onApproved = onApproved ?? null;
    this.version += 1;
  }

  clear() {
    this.objectType = null;
    this.bizRef = null;
    this.status = undefined;
    this.onApproved = null;
  }
}

export default ApprovalPanelStore;
