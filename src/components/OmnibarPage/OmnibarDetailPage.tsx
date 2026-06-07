import React, { useEffect, useState } from 'react';
import { message } from 'antd';
import { EditOutlined, SaveOutlined, CloseOutlined } from '@ant-design/icons';
import type {
  DetailField,
  DetailSection,
  DetailTabItem,
  StatusBadge,
  ToolbarAction,
} from './types';
import DetailHeader from './parts/DetailHeader';
import DetailSections from './parts/DetailSections';
import DetailTabs from './parts/DetailTabs';
import DetailFooter from './parts/DetailFooter';
import './OmnibarPage.less';

export interface OmnibarDetailPageProps {
  // ============ 头部 ============
  title: React.ReactNode;
  statusBadge?: StatusBadge;
  onBack?: () => void;
  backLabel?: string;
  headerActions?: ToolbarAction[];

  // ============ 字段段(可选) ============
  /** 配置式字段段 */
  sections?: DetailSection[];
  /** 完全自定义内容(替代 sections) */
  sectionsContent?: React.ReactNode;

  // ============ Tab 区(必填) ============
  tabs: DetailTabItem[];
  defaultTabKey?: string;
  activeTabKey?: string;
  onTabChange?: (key: string) => void;
  tabActions?: ToolbarAction[];

  // ============ 底部 audit info ============
  footerFields?: DetailField[];

  // ============ 编辑能力(可选) ============
  /** 是否可编辑(默认 false)。设 true 后头部自动出现"编辑"按钮 */
  editable?: boolean;
  /** 完整记录,编辑保存时透传给 onSave({...record, ...values}) */
  record?: Record<string, any>;
  /** 保存时调用,组件不绑定任何 service。失败请抛错或返回 reject */
  onSave?: (values: Record<string, any>) => Promise<void>;
  /** 保存成功回调(用于 reload) */
  onSaved?: () => void;
  /** 受控 isEditing(可选,默认组件内部 state) */
  isEditing?: boolean;
  onEditingChange?: (editing: boolean) => void;
}

const OmnibarDetailPage: React.FC<OmnibarDetailPageProps> = ({
  title,
  statusBadge,
  onBack,
  backLabel,
  headerActions,

  sections,
  sectionsContent,

  tabs,
  defaultTabKey,
  activeTabKey,
  onTabChange,
  tabActions,

  footerFields,

  editable = false,
  record,
  onSave,
  onSaved,
  isEditing: controlledEditing,
  onEditingChange,
}) => {
  const [innerEditing, setInnerEditing] = useState(false);
  const editing = controlledEditing ?? innerEditing;
  const setEditing = (v: boolean) => {
    if (controlledEditing === undefined) setInnerEditing(v);
    onEditingChange?.(v);
  };

  const [formValues, setFormValues] = useState<Record<string, any>>({});
  const [saving, setSaving] = useState(false);

  // 进入编辑态时,formValues 用 record 初始化(浅拷贝),退出时清空
  useEffect(() => {
    if (editing) {
      setFormValues({ ...(record ?? {}) });
    } else {
      setFormValues({});
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [editing]);

  const handleSave = async () => {
    if (!onSave) {
      // 没传 onSave,直接退出编辑(假设外部完全控制)
      setEditing(false);
      return;
    }
    setSaving(true);
    try {
      await onSave(formValues);
      message.success('已保存');
      setEditing(false);
      onSaved?.();
    } catch (err: any) {
      message.error(err?.message ?? '保存失败');
    } finally {
      setSaving(false);
    }
  };

  // 头部按钮:编辑态用「保存/取消」覆盖原 headerActions,只读态在原 actions 前面追加「编辑」
  const finalHeaderActions: ToolbarAction[] = (() => {
    if (!editable) return headerActions ?? [];
    if (editing) {
      return [
        {
          key: '__save__',
          type: 'primary',
          label: '保存',
          icon: <SaveOutlined />,
          onClick: handleSave,
          disabled: saving,
        },
        {
          key: '__cancel__',
          label: '取消',
          icon: <CloseOutlined />,
          onClick: () => setEditing(false),
          disabled: saving,
        },
      ];
    }
    return [
      {
        key: '__edit__',
        type: 'primary',
        label: '编辑',
        icon: <EditOutlined />,
        onClick: () => setEditing(true),
      },
      ...(headerActions ?? []),
    ];
  })();

  return (
    <div className="omnibar-page opp-detail-page">
      <DetailHeader
        title={title}
        statusBadge={statusBadge}
        onBack={editing ? undefined : onBack}
        backLabel={backLabel}
        actions={finalHeaderActions}
      />

      {(sections || sectionsContent) && (
        <DetailSections
          sections={sections ?? []}
          editing={editing}
          formValues={formValues}
          onFormChange={setFormValues}
          record={record}
        >
          {sectionsContent}
        </DetailSections>
      )}

      {tabs.length > 0 && (
        <DetailTabs
          tabs={tabs}
          defaultActiveKey={defaultTabKey}
          activeKey={activeTabKey}
          onChange={onTabChange}
          actions={tabActions}
        />
      )}

      {footerFields && footerFields.length > 0 && <DetailFooter fields={footerFields} />}
    </div>
  );
};

export default OmnibarDetailPage;
