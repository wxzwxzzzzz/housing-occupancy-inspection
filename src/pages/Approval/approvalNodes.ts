import { RectNode, RectNodeModel } from '@logicflow/core';

// ========================
// 自定义审批节点基类
// ========================
export class BaseApprovalNodeModel extends RectNodeModel {
  setAttributes() {
    this.width = 120;
    this.height = 50;
    this.radius = 6;
  }

  getNodeStyle() {
    const style = super.getNodeStyle();
    const { properties } = this;

    // 根据节点类型设置不同颜色
    let fill = '#E6F7FF';
    let stroke = '#1890FF';

    switch (properties.nodeType) {
      case 'start':
        fill = '#F6FFED';
        stroke = '#52C41A';
        break;
      case 'end':
        fill = '#FFF1F0';
        stroke = '#FF4D4F';
        break;
      case 'check':
        fill = '#FFF7E6';
        stroke = '#FA8C16';
        break;
      case 'approve':
        fill = '#E6F7FF';
        stroke = '#1890FF';
        break;
      default:
        break;
    }

    return {
      ...style,
      fill,
      stroke,
      strokeWidth: 2,
    };
  }
}

export class BaseApprovalNodeView extends RectNode {}

// 审批节点类型定义
export const approvalNodeTypes = [
  { type: 'approve-start', text: '开始', nodeType: 'start' },
  { type: 'approve-material', text: '材料校验', nodeType: 'check' },
  { type: 'approve-initial', text: '初审', nodeType: 'approve' },
  { type: 'approve-review', text: '复审', nodeType: 'approve' },
  { type: 'approve-final', text: '终审', nodeType: 'approve' },
  { type: 'approve-alert', text: '预警校验', nodeType: 'check' },
  { type: 'approve-reject', text: '驳回', nodeType: 'end' },
  { type: 'approve-end', text: '结束', nodeType: 'end' },
];

// 注册自定义节点 - 需要传入 LogicFlow 实例
export const registerApprovalNodes = (lf: any) => {
  approvalNodeTypes.forEach((node) => {
    try {
      lf.register({
        type: node.type,
        view: BaseApprovalNodeView,
        model: BaseApprovalNodeModel,
      });
      console.log(`成功注册节点: ${node.type}`);
    } catch (error) {
      // 节点可能已经注册过，忽略错误
      console.warn(`节点 ${node.type} 已注册或注册失败:`, error);
    }
  });
};
