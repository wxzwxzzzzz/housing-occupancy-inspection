/**
 * 租赁补贴 — RentalSubsidy
 *
 * 状态机:DRAFT → SUBSIDY_ACTIVE → SUBSIDY_SUSPENDED / SUBSIDY_TERMINATED / SUBSIDY_EXPIRED
 * 前置:家庭必须为候选(CANDIDATE)状态
 */

import { PlusOutlined, ReloadOutlined } from '@ant-design/icons';
import { useNavigate } from '@umijs/max';
import { Tag } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import EntityCreateModal from '@/components/EntityCreateModal';
import {
  type FilterConfig,
  OmnibarListPage,
  type ToolbarAction,
} from '@/components/OmnibarPage';
import { rentalSubsidyService } from '@/services/domains/eligibility';
import { OT } from '@/services/ontology/object-types';
import { qb } from '@/services/ontology/query';
import { dictLabel, dictStore } from '@/stores/dictStore';
import type { RentalSubsidy } from '@/types/ontology/prh/entities/rental_subsidy';

const StatusColor: Record<string, string> = {
  SUBSIDY_ACTIVE: 'green',
  SUBSIDY_SUSPENDED: 'orange',
  SUBSIDY_TERMINATED: 'red',
  SUBSIDY_EXPIRED: 'default',
};

const EligibilitySubsidies: React.FC = () => {
  const navigate = useNavigate();
  const [filterValues, setFilterValues] = useState<Record<string, any>>({});
  const [data, setData] = useState<RentalSubsidy[]>([]);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(20);
  const [total, setTotal] = useState(0);
  const [selectedKeys, setSelectedKeys] = useState<React.Key[]>([]);
  const [createOpen, setCreateOpen] = useState(false);

  const load = useCallback(
    async (p = page, s = pageSize) => {
      setLoading(true);
      try {
        const builder = qb(OT.RentalSubsidy)
          .orderBy('createAt', 'DESC')
          .page(p, s);
        if (filterValues.status) builder.eq('status', filterValues.status);
        const env = await rentalSubsidyService.list(builder.build() as any);
        setData(env.data);
        setTotal(env.page?.total ?? env.data.length);
      } finally {
        setLoading(false);
      }
    },
    [filterValues, page, pageSize],
  );

  useEffect(() => {
    load(1, pageSize);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [JSON.stringify(filterValues)]);

  const filters: FilterConfig[] = useMemo(
    () => [
      {
        key: 'status',
        label: '状态',
        type: 'select',
        options: dictStore.options('SubsidyStatus'),
      },
    ],
    [],
  );

  const toolbarActions: ToolbarAction[] = [
    {
      key: 'create',
      type: 'primary',
      icon: <PlusOutlined />,
      label: '新建补贴',
      onClick: () => setCreateOpen(true),
    },
    {
      key: 'refresh',
      type: 'icon',
      icon: <ReloadOutlined />,
      title: '刷新',
      onClick: () => load(page, pageSize),
    },
  ];

  const columns: ColumnsType<RentalSubsidy> = [
    {
      title: '编号',
      dataIndex: 'id',
      width: 110,
      render: (v: string) => `#${v.slice(-6)}`,
    },
    {
      title: '所属家庭',
      dataIndex: 'household',
      width: 140,
      render: (v: string) => (v ? `家庭#${String(v).slice(-6)}` : '-'),
    },
    { title: '月补贴金额', dataIndex: 'monthlyAmount', width: 120 },
    { title: '起始日期', dataIndex: 'startDate', width: 120 },
    { title: '截止日期', dataIndex: 'endDate', width: 120 },
    { title: '收款账户', dataIndex: 'bankAccount', width: 160, ellipsis: true },
    { title: '开户行', dataIndex: 'bankName', width: 160, ellipsis: true },
    {
      title: '状态',
      dataIndex: 'status',
      width: 110,
      render: (v: any) => (
        <Tag color={StatusColor[v]}>{dictLabel('SubsidyStatus', v)}</Tag>
      ),
    },
    {
      title: '操作',
      key: 'rowAction',
      width: 120,
      render: (_, record) => (
        <span className="opp-row-actions">
          <span
            className="opp-row-action"
            onClick={(e) => {
              e.stopPropagation();
              navigate(`/eligibility/subsidies/detail/${record.id}`);
            }}
          >
            查看
          </span>
        </span>
      ),
    },
  ];

  return (
    <div style={{ height: '100%' }}>
      <OmnibarListPage<RentalSubsidy>
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
        onRowClick={(record) =>
          navigate(`/eligibility/subsidies/detail/${record.id}`)
        }
        total={total}
        page={page}
        pageSize={pageSize}
        onPageChange={(p, s) => {
          setPage(p);
          setPageSize(s);
          load(p, s);
        }}
      />
      <EntityCreateModal
        open={createOpen}
        onClose={() => setCreateOpen(false)}
        onSuccess={() => load(1, pageSize)}
        title="新建补贴"
        service={rentalSubsidyService as any}
        fields={[
          {
            name: 'household',
            label: '所属家庭',
            type: 'refer',
            required: true,
            referObjectType: OT.Household,
            referLabelField: 'applicantName',
            referExtraFilter: (b) => b.eq('status', 'CANDIDATE'),
            extra: '只能选择"候选"状态的家庭',
            span: 2,
          },
          {
            name: 'monthlyAmount',
            label: '月补贴金额(元)',
            type: 'number',
            required: true,
            rules: [{ min: 1, message: '补贴金额必须大于 0' }],
          },
          {
            name: 'startDate',
            label: '起始日期',
            type: 'date',
            required: true,
          },
          { name: 'endDate', label: '截止日期', type: 'date' },
          { name: 'bankAccount', label: '收款账户', type: 'input' },
          { name: 'bankName', label: '开户行', type: 'input' },
        ]}
      />
    </div>
  );
};

export default EligibilitySubsidies;
