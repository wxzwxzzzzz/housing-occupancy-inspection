/**
 * 通用申请单列表壳页
 *
 * 适配所有 ApplicationStatus 状态机的实体:
 *   Leave / AttendanceMakeup / MigrantWork / EligibilityApplication
 *   ResidenceChange / EmploymentChange / HouseholdMemberChange / EligibilityTermination
 *
 * 用法:
 *   <ApplicationListPage
 *     title="请假申请"
 *     objectType={OT.Leave}
 *     service={leaveService}
 *     detailRoute="/monitor/leaves/detail"
 *     baseColumns={[...]}
 *     defaultStatus="DRAFT"        // 可选,默认 'UNDER_APPROVAL'
 *     extraFilters={[...]}          // 可选,在 keyword/status 之外追加业务筛选
 *     allowCreate                  // 可选,显示新建按钮(默认 false)
 *     onCreate={() => ...}         // allowCreate=true 时触发
 *   />
 */

import {
  CheckOutlined,
  CloseOutlined,
  PlusOutlined,
  ReloadOutlined,
} from '@ant-design/icons';
import { useNavigate } from '@umijs/max';
import { Dropdown, Form, Input, Modal, message } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import EnhancedTag from '@/components/EnhancedTag';
import {
  type FilterConfig,
  OmnibarListPage,
  type ToolbarAction,
} from '@/components/OmnibarPage';
import { approvalService } from '@/services/domains/approval';
import type { EntityApi } from '@/services/ontology/crud';
import { qb } from '@/services/ontology/query';
import { ApplicationStatus } from '@/types/ontology/prh/enums';
import { EnumLabels, enumOptions, StatusColors } from '@/utils/enum-options';

export interface ApplicationListPageProps<
  T extends {
    id: string;
    status?: string;
    resident?: any;
    applicant?: any;
    household?: any;
  },
> {
  title: string;
  objectType: string;
  service: EntityApi<T>;
  /** 列表精简列(不含状态/操作,组件内自动追加) */
  baseColumns: ColumnsType<T>;
  /** 详情路由前缀,如 '/monitor/leaves/detail' */
  detailRoute: string;
  /** 默认筛选状态,默认 'UNDER_APPROVAL';传 'ALL' 即不限制 */
  defaultStatus?: string | 'ALL';
  /** 业务侧追加筛选项,会插到 keyword/status 之后 */
  extraFilters?: FilterConfig[];
  /** 业务侧追加默认查询条件(在 keyword/status 之外) */
  buildExtraQuery?: (
    builder: ReturnType<typeof qb>,
    values: Record<string, any>,
  ) => void;
  /** 是否显示新建按钮 */
  allowCreate?: boolean;
  /** 新建按钮回调 */
  onCreate?: () => void;
  /** 是否允许批量审批(默认 true) */
  allowApprove?: boolean;
  /** 关键字筛选的字段名,默认 'id' */
  keywordField?: string;
  /** 关键字筛选输入框的占位文案 */
  keywordPlaceholder?: string;
  /** 关联居民的字段名(用于"居民全貌"跳转),默认会按 resident → applicant 取 */
  residentField?: 'resident' | 'applicant' | 'household' | string;
}

export function ApplicationListPage<
  T extends {
    id: string;
    status?: string;
    resident?: any;
    applicant?: any;
    household?: any;
  },
>(props: ApplicationListPageProps<T>) {
  const {
    title,
    objectType,
    service,
    baseColumns,
    detailRoute,
    defaultStatus = 'UNDER_APPROVAL',
    extraFilters,
    buildExtraQuery,
    allowCreate,
    onCreate,
    allowApprove = true,
    keywordField = 'id',
    keywordPlaceholder = '输入申请编号',
    residentField,
  } = props;
  const navigate = useNavigate();

  const initialStatus = defaultStatus === 'ALL' ? undefined : defaultStatus;
  const [filterValues, setFilterValues] = useState<Record<string, any>>(
    initialStatus ? { status: initialStatus } : {},
  );
  const [data, setData] = useState<T[]>([]);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(20);
  const [total, setTotal] = useState(0);
  const [selectedKeys, setSelectedKeys] = useState<React.Key[]>([]);
  const [batchModal, setBatchModal] = useState<'approve' | 'reject' | null>(
    null,
  );
  const [batchSubmitting, setBatchSubmitting] = useState(false);
  const [batchForm] = Form.useForm();

  const load = useCallback(
    async (p = page, s = pageSize, override?: Record<string, any>) => {
      setLoading(true);
      try {
        const v = override ?? filterValues;
        const builder = qb(objectType).orderBy('createAt', 'DESC').page(p, s);
        if (v.status) builder.eq('status', v.status);
        if (v.keyword) builder.like(keywordField, v.keyword);
        buildExtraQuery?.(builder, v);
        const env = await service.list(builder.build() as any);
        setData(env.data);
        setTotal(env.page?.total ?? env.data.length);
      } finally {
        setLoading(false);
      }
    },
    [
      buildExtraQuery,
      filterValues,
      keywordField,
      objectType,
      page,
      pageSize,
      service,
    ],
  );

  useEffect(() => {
    load(1, pageSize);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filterValues.status, JSON.stringify(filterValues)]);

  const filters: FilterConfig[] = useMemo(() => {
    const base: FilterConfig[] = [
      {
        key: 'keyword',
        label: '编号',
        type: 'input',
        placeholder: keywordPlaceholder,
      },
      {
        key: 'status',
        label: '状态',
        type: 'select',
        options: enumOptions(ApplicationStatus, EnumLabels.ApplicationStatus),
      },
    ];
    return extraFilters ? [...base, ...extraFilters] : base;
  }, [extraFilters, keywordPlaceholder]);

  const toolbarActions: ToolbarAction[] = useMemo(() => {
    const actions: ToolbarAction[] = [
      {
        key: 'refresh',
        type: 'icon',
        icon: <ReloadOutlined />,
        title: '刷新',
        onClick: () => load(page, pageSize),
      },
    ];
    if (allowCreate) {
      actions.unshift({
        key: 'create',
        type: 'primary',
        icon: <PlusOutlined />,
        label: '新建',
        onClick: () => onCreate?.(),
      });
    }
    if (allowApprove && selectedKeys.length > 0) {
      // 校验选中行是否都是 UNDER_APPROVAL
      const selectedRecords = data.filter((d) =>
        selectedKeys.includes((d as any).id),
      );
      const allPending = selectedRecords.every(
        (d) => (d as any).status === 'UNDER_APPROVAL',
      );
      if (allPending) {
        actions.unshift(
          {
            key: 'batch-reject',
            danger: true,
            icon: <CloseOutlined />,
            label: `驳回 (${selectedKeys.length})`,
            onClick: () => setBatchModal('reject'),
          },
          {
            key: 'batch-approve',
            type: 'primary',
            icon: <CheckOutlined />,
            label: `批准 (${selectedKeys.length})`,
            onClick: () => setBatchModal('approve'),
          },
        );
      }
    }
    return actions;
  }, [
    allowCreate,
    allowApprove,
    data,
    load,
    onCreate,
    page,
    pageSize,
    selectedKeys,
  ]);

  const columns: ColumnsType<T> = useMemo(
    () => [
      ...baseColumns,
      {
        title: '状态',
        dataIndex: 'status',
        width: 120,
        render: (status: any, record: any) => (
          <EnhancedTag
            color={(StatusColors.ApplicationStatus as any)[status]}
            label={
              EnumLabels.ApplicationStatus[
                status as keyof typeof EnumLabels.ApplicationStatus
              ] ?? status
            }
            context={{
              submittedAt: record.submittedAt,
              submittedBy: record.submittedBy,
              approver: record.approver,
              approvalTime: record.approvalTime,
              approvalOpinion: record.approvalOpinion,
            }}
          />
        ),
      },
      {
        title: '操作',
        key: 'rowAction',
        width: 200,
        render: (_: any, record: T) => {
          const recordAny = record as any;
          const linkedResident =
            residentField !== undefined
              ? recordAny[residentField]
              : (recordAny.resident ?? recordAny.applicant ?? null);
          return (
            <span className="opp-row-actions">
              <span
                className="opp-row-action"
                onClick={(e) => {
                  e.stopPropagation();
                  navigate(`${detailRoute}/${record.id}`);
                }}
              >
                查看
              </span>
              {linkedResident && (
                <span
                  className="opp-row-action"
                  onClick={(e) => {
                    e.stopPropagation();
                    window.open(
                      `/profile/residents/${linkedResident}`,
                      '_blank',
                    );
                  }}
                >
                  居民全貌
                </span>
              )}
              <Dropdown
                trigger={['click']}
                menu={{
                  items: [
                    {
                      key: 'copy-id',
                      label: '复制申请编号',
                      onClick: () =>
                        navigator.clipboard
                          .writeText(record.id)
                          .then(() => message.success('已复制')),
                    },
                  ],
                }}
              >
                <span
                  className="opp-row-action-more"
                  onClick={(e) => e.stopPropagation()}
                >
                  ⋯
                </span>
              </Dropdown>
            </span>
          );
        },
      },
    ],
    [baseColumns, detailRoute, navigate, residentField],
  );

  return (
    <div style={{ height: '100%' }} data-application-page={title}>
      <OmnibarListPage<T>
        filters={filters}
        filterValues={filterValues}
        onFilterChange={setFilterValues}
        onSearch={() => load(1, pageSize)}
        toolbarActions={toolbarActions}
        data={data}
        columns={columns}
        loading={loading}
        rowKey="id"
        selectedKeys={selectedKeys}
        onSelectionChange={setSelectedKeys}
        showCheckbox
        showIndex
        onRowClick={(record: T) => navigate(`${detailRoute}/${record.id}`)}
        total={total}
        page={page}
        pageSize={pageSize}
        onPageChange={(p, s) => {
          setPage(p);
          setPageSize(s);
          load(p, s);
        }}
      />

      <Modal
        title={
          batchModal === 'approve'
            ? `批量审批通过 (${selectedKeys.length})`
            : `批量驳回 (${selectedKeys.length})`
        }
        open={!!batchModal}
        onCancel={() => {
          setBatchModal(null);
          batchForm.resetFields();
        }}
        onOk={async () => {
          try {
            const v = await batchForm.validateFields();
            setBatchSubmitting(true);
            const action =
              batchModal === 'approve'
                ? approvalService.approve
                : approvalService.reject;
            await Promise.all(
              selectedKeys.map((id) =>
                action(objectType, String(id), v.opinion),
              ),
            );
            message.success(
              `已${batchModal === 'approve' ? '通过' : '驳回'} ${selectedKeys.length} 条`,
            );
            setBatchModal(null);
            batchForm.resetFields();
            setSelectedKeys([]);
            load(page, pageSize);
          } catch (err: any) {
            if (err?.errorFields) return;
            message.error(err?.message ?? '批量操作失败');
          } finally {
            setBatchSubmitting(false);
          }
        }}
        confirmLoading={batchSubmitting}
        okType={batchModal === 'reject' ? 'danger' : 'primary'}
        okText="确认"
        cancelText="取消"
        styles={{ footer: { textAlign: 'right' } }}
      >
        <Form form={batchForm} layout="vertical" preserve={false}>
          <Form.Item
            label={batchModal === 'approve' ? '审批意见' : '驳回原因'}
            name="opinion"
            rules={
              batchModal === 'reject'
                ? [{ required: true, message: '请填写驳回原因' }]
                : []
            }
          >
            <Input.TextArea rows={4} placeholder="请输入..." />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
}

export default ApplicationListPage;
