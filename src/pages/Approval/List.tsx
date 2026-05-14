/**
 * 审批总览(全部审批类申请的合并视图)
 *
 * 不在路由表中,但保留兼容旧链接;并提供一个"全部审批"的统一入口。
 */

import React, { useEffect, useState } from 'react';
import { Card, Space, Table, Tabs, Tag } from 'antd';
import { useNavigate } from '@umijs/max';
import { qb } from '@/services/ontology/query';
import { invokeQuery } from '@/services/ontology/client';
import { OT } from '@/services/ontology/object-types';
import { EnumLabels, StatusColors } from '@/utils/enum-options';

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
  const [active, setActive] = useState<string>('UNDER_APPROVAL');
  const [rows, setRows] = useState<ApprovalRow[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    let cancel = false;
    (async () => {
      setLoading(true);
      try {
        const all = await Promise.all(
          SOURCES.map(async (s) => {
            const env = await invokeQuery<any>(
              s.objectType,
              qb(s.objectType).eq('status', active).page(1, 100).build(),
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
        if (!cancel) setRows(all.flat());
      } finally {
        if (!cancel) setLoading(false);
      }
    })();
    return () => {
      cancel = true;
    };
  }, [active]);

  return (
    <div style={{ padding: 24 }}>
      <Card title="审批总览">
        <Tabs
          activeKey={active}
          onChange={setActive}
          items={[
            { key: 'UNDER_APPROVAL', label: '审批中' },
            { key: 'COMPLETED', label: '已完成' },
            { key: 'CANCELLED', label: '已撤销' },
          ]}
        />
        <Table<ApprovalRow>
          rowKey={(r) => `${r.type}-${r.id}`}
          loading={loading}
          dataSource={rows}
          pagination={{ pageSize: 20 }}
          columns={[
            { title: '编号', dataIndex: 'id', width: 200, render: (v: string) => `#${v.slice(-6)}` },
            {
              title: '类型',
              dataIndex: 'type',
              width: 130,
              render: (t: string) => (
                <Tag>{SOURCES.find((s) => s.type === t)?.label ?? t}</Tag>
              ),
            },
            { title: '居民/申请人', dataIndex: 'resident', width: 160 },
            {
              title: '状态',
              dataIndex: 'status',
              width: 110,
              render: (status: any) => (
                <Tag color={(StatusColors.ApplicationStatus as any)[status]}>
                  {EnumLabels.ApplicationStatus[status as keyof typeof EnumLabels.ApplicationStatus] ??
                    status}
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
                <Space>
                  <a onClick={() => navigate(`/approval/detail/${row.type}/${row.id}`)}>详情</a>
                </Space>
              ),
            },
          ]}
        />
      </Card>
    </div>
  );
};

export default ApprovalList;
