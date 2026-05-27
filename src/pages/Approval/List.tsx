/**
 * 审批总览(全部审批类申请的合并视图) — OmnibarPage 三段式
 */

import React, { useCallback, useEffect, useState } from 'react';
import { Tag } from 'antd';
import { ReloadOutlined } from '@ant-design/icons';
import { useNavigate } from '@umijs/max';
import type { ColumnsType } from 'antd/es/table';
import { qb } from '@/services/ontology/query';
import { invokeQuery } from '@/services/ontology/client';
import { OT } from '@/services/ontology/object-types';
import { EnumLabels, StatusColors } from '@/utils/enum-options';
import {
  OmnibarListPage,
  type FilterConfig,
  type ToolbarAction,
} from '@/components/OmnibarPage';

interface ApprovalRow {
  id: string;
  type: string;
  resident?: string;
  status: string;
  submittedAt?: string;
}

const SOURCES = [
  { type: 'leave', label: '请假', objectType: OT.Leave },
  { type: 'migrant', label: '备案', objectType: OT.MigrantWork },
  { type: 'material', label: '资格申请', objectType: OT.EligibilityApplication },
  { type: 'makeup', label: '补卡', objectType: OT.AttendanceMakeup },
  { type: 'residence-change', label: '居住变更', objectType: OT.ResidenceChange },
  { type: 'employment-change', label: '就业变更', objectType: OT.EmploymentChange },
  { type: 'member-change', label: '成员变更', objectType: OT.HouseholdMemberChange },
  { type: 'termination', label: '资格终止', objectType: OT.EligibilityTermination },
];

const ApprovalList: React.FC = () => {
  const navigate = useNavigate();
  const [filterValues, setFilterValues] = useState<Record<string, any>>({
    status: 'UNDER_APPROVAL',
    type: '',
  });
  const [data, setData] = useState<ApprovalRow[]>([]);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(20);
  const [total, setTotal] = useState(0);
  const [selectedKeys, setSelectedKeys] = useState<React.Key[]>([]);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const v = filterValues;
      const status = v.status || 'UNDER_APPROVAL';
      const want = SOURCES.filter((s) => !v.type || s.type === v.type);

      const all = await Promise.all(
        want.map(async (s) => {
          const env = await invokeQuery<any>(
            s.objectType,
            qb(s.objectType).eq('status', status).page(1, 100).build(),
          );
          return env.data.map<ApprovalRow>((r) => ({
            id: r.id,
            type: s.type,
            resident: r.resident ?? r.applicant ?? '-',
            status: r.status,
            submittedAt: r.submittedAt,
          }));
        }),
      );
      let rows = all.flat();
      if (v.keyword) {
        const kw = String(v.keyword).toLowerCase();
        rows = rows.filter(
          (r) =>
            r.id.toLowerCase().includes(kw) ||
            String(r.resident ?? '').toLowerCase().includes(kw),
        );
      }
      setData(rows);
      setTotal(rows.length);
    } finally {
      setLoading(false);
    }
  }, [filterValues]);

  useEffect(() => {
    load();
  }, [load]);

  const filters: FilterConfig[] = [
    { key: 'keyword', label: '关键字', type: 'input', placeholder: '编号 / 申请人' },
    {
      key: 'status',
      label: '状态',
      type: 'quick',
      options: [
        { value: 'UNDER_APPROVAL', label: '审批中' },
        { value: 'COMPLETED', label: '已完成' },
        { value: 'CANCELLED', label: '已撤销' },
      ],
    },
    {
      key: 'type',
      label: '类型',
      type: 'select',
      options: [
        { value: '', label: '全部' },
        ...SOURCES.map((s) => ({ value: s.type, label: s.label })),
      ],
    },
  ];

  const toolbarActions: ToolbarAction[] = [
    {
      key: 'refresh',
      type: 'icon',
      icon: <ReloadOutlined />,
      title: '刷新',
      onClick: load,
    },
  ];

  const columns: ColumnsType<ApprovalRow> = [
    {
      title: '编号',
      dataIndex: 'id',
      width: 200,
      render: (v: string) => `#${v.slice(-6)}`,
    },
    {
      title: '类型',
      dataIndex: 'type',
      width: 130,
      render: (t: string) => <Tag>{SOURCES.find((s) => s.type === t)?.label ?? t}</Tag>,
    },
    { title: '居民/申请人', dataIndex: 'resident', width: 160 },
    {
      title: '状态',
      dataIndex: 'status',
      width: 110,
      render: (status: any) => (
        <Tag color={(StatusColors.ApplicationStatus as any)[status]}>
          {EnumLabels.ApplicationStatus[
            status as keyof typeof EnumLabels.ApplicationStatus
          ] ?? status}
        </Tag>
      ),
    },
    {
      title: '提交时间',
      dataIndex: 'submittedAt',
      width: 200,
      render: (v?: string) => (v ? new Date(v).toLocaleString() : '-'),
    },
    {
      title: '操作',
      key: 'op',
      width: 120,
      render: (_: any, row: ApprovalRow) => (
        <span className="opp-row-actions">
          <span
            className="opp-row-action"
            onClick={(e) => {
              e.stopPropagation();
              navigate(`/approval/detail/${row.type}/${row.id}`);
            }}
          >
            详情
          </span>
        </span>
      ),
    },
  ];

  // 客户端分页(数据已全部加载)
  const paged = data.slice((page - 1) * pageSize, page * pageSize);

  return (
    <div style={{ height: '100%' }}>
      <OmnibarListPage<ApprovalRow>
        filters={filters}
        filterValues={filterValues}
        onFilterChange={setFilterValues}
        onSearch={() => {
          setPage(1);
          load();
        }}
        toolbarActions={toolbarActions}
        data={paged}
        columns={columns}
        loading={loading}
        rowKey={(r) => `${r.type}-${r.id}`}
        selectedKeys={selectedKeys}
        onSelectionChange={setSelectedKeys}
        showCheckbox
        showIndex
        onRowClick={(row) => navigate(`/approval/detail/${row.type}/${row.id}`)}
        total={total}
        page={page}
        pageSize={pageSize}
        onPageChange={(p, s) => {
          setPage(p);
          setPageSize(s);
        }}
      />
    </div>
  );
};

export default ApprovalList;
