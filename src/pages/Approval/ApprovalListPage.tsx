/**
 * 通用审批列表壳页 — 基于 OmnibarListPage
 *
 * 三个壳页(Material/Leave/Filing)无需改动,继续传 baseColumns + detailRoute。
 * Y/N 快捷键和审批 Modal 移到详情页(MaterialDetail / LeaveDetail / FilingDetail)。
 */

import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { Dropdown, Button, message } from 'antd';
import { MoreOutlined, ReloadOutlined } from '@ant-design/icons';
import { useNavigate } from '@umijs/max';
import type { ColumnsType } from 'antd/es/table';
import { qb } from '@/services/ontology/query';
import type { EntityApi } from '@/services/ontology/crud';
import { ApplicationStatus } from '@/types/ontology/prh/enums';
import { EnumLabels, StatusColors, enumOptions } from '@/utils/enum-options';
import EnhancedTag from '@/components/EnhancedTag';
import {
  OmnibarListPage,
  type FilterConfig,
  type ToolbarAction,
} from '@/components/OmnibarPage';

interface ApprovalListPageProps<T extends { id: string; status?: string; resident?: any }> {
  title: string;
  objectType: string;
  service: EntityApi<T>;
  /** 列表精简列(不含状态/操作,组件内自动追加) */
  baseColumns: ColumnsType<T>;
  /** 详情路由前缀,如 '/approval/material/detail' */
  detailRoute: string;
}

export function ApprovalListPage<T extends { id: string; status?: string; resident?: any }>(
  props: ApprovalListPageProps<T>,
) {
  const { title, objectType, service, baseColumns, detailRoute } = props;
  const navigate = useNavigate();

  const [filterValues, setFilterValues] = useState<Record<string, any>>({
    status: 'UNDER_APPROVAL',
  });
  const [data, setData] = useState<T[]>([]);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(20);
  const [total, setTotal] = useState(0);
  const [selectedKeys, setSelectedKeys] = useState<React.Key[]>([]);

  const load = useCallback(
    async (p = page, s = pageSize, override?: Record<string, any>) => {
      setLoading(true);
      try {
        const v = override ?? filterValues;
        const builder = qb(objectType).orderBy('createAt', 'DESC').page(p, s);
        if (v.status) builder.eq('status', v.status);
        if (v.keyword) builder.like('id', v.keyword);
        const env = await service.list(builder.build() as any);
        setData(env.data);
        setTotal(env.page?.total ?? env.data.length);
      } finally {
        setLoading(false);
      }
    },
    [objectType, service, filterValues, page, pageSize],
  );

  useEffect(() => {
    load(1, pageSize);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filterValues.status]);

  const filters: FilterConfig[] = [
    { key: 'keyword', label: '编号', type: 'input', placeholder: '输入申请编号' },
    {
      key: 'status',
      label: '状态',
      type: 'select',
      options: enumOptions(ApplicationStatus, EnumLabels.ApplicationStatus),
    },
  ];

  const toolbarActions: ToolbarAction[] = [
    {
      key: 'refresh',
      type: 'icon',
      icon: <ReloadOutlined />,
      title: '刷新',
      onClick: () => load(page, pageSize),
    },
  ];

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
          const residentId =
            (record as any).resident ?? (record as any).applicant ?? null;
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
              {residentId && (
                <span
                  className="opp-row-action"
                  onClick={(e) => {
                    e.stopPropagation();
                    window.open(`/residents/${residentId}`, '_blank');
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
                <span className="opp-row-action-more" onClick={(e) => e.stopPropagation()}>
                  ⋯
                </span>
              </Dropdown>
            </span>
          );
        },
      },
    ],
    [baseColumns, detailRoute, navigate],
  );

  return (
    <div style={{ height: '100%' }}>
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
    </div>
  );
}

export default ApprovalListPage;
