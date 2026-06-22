/**
 * 保障家庭 — Household
 *
 * 状态机:DRAFT → ACTIVE → CANDIDATE / ARCHIVED
 * CANDIDATE 是关键状态:可发起 实物配租 / 租赁补贴。
 *
 * 列字段对齐 XML 的核心 attributes:
 *   applicantName / applicant / guaranteeType / householdSize / waitlistNo /
 *   activeApplicationId / status / createAt
 * 其余(归档原因/归档日期/审计)放在详情页。
 */

import { PlusOutlined, ReloadOutlined } from '@ant-design/icons';
import { useNavigate } from '@umijs/max';
import { Tag } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  type FilterConfig,
  OmnibarListPage,
  type ToolbarAction,
} from '@/components/OmnibarPage';
import { householdService } from '@/services/domains/household';
import { OT } from '@/services/ontology/object-types';
import { qb } from '@/services/ontology/query';
import { dictLabel, dictStore } from '@/stores/dictStore';
import type { Household } from '@/types/ontology/prh/entities/household';
import { StatusColors } from '@/utils/enum-options';
import HouseholdCreateModal from './HouseholdCreateModal';

const ProfileHouseholds: React.FC = () => {
  const navigate = useNavigate();
  const [filterValues, setFilterValues] = useState<Record<string, any>>({});
  const [data, setData] = useState<Household[]>([]);
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
        const builder = qb(OT.Household).orderBy('createAt', 'DESC').page(p, s);
        if (filterValues.keyword)
          builder.like('applicantName', filterValues.keyword);
        if (filterValues.status) builder.eq('status', filterValues.status);
        if (filterValues.guaranteeType)
          builder.eq('guaranteeType', filterValues.guaranteeType);
        const env = await householdService.list(builder.build() as any);
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
        key: 'keyword',
        label: '主申请人',
        type: 'input',
        placeholder: '主申请人姓名',
      },
      {
        key: 'status',
        label: '家庭状态',
        type: 'select',
        options: dictStore.options('HouseholdStatus'),
      },
      {
        key: 'guaranteeType',
        label: '保障类型',
        type: 'select',
        options: dictStore.options('GuaranteeType'),
      },
    ],
    [],
  );

  const toolbarActions: ToolbarAction[] = [
    {
      key: 'create',
      type: 'primary',
      icon: <PlusOutlined />,
      label: '新增',
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

  const columns: ColumnsType<Household> = [
    {
      title: '编号',
      dataIndex: 'id',
      width: 110,
      fixed: 'left',
      render: (v: string) => `#${v.slice(-6)}`,
    },
    { title: '主申请人', dataIndex: 'applicantName', width: 130 },
    { title: '家庭人口数', dataIndex: 'householdSize', width: 100 },
    {
      title: '保障类型',
      dataIndex: 'guaranteeType',
      width: 130,
      render: (v: any) => dictLabel('GuaranteeType', v),
    },
    {
      title: '轮候序号',
      dataIndex: 'waitlistNo',
      width: 100,
      render: (v: any) => (v ? `#${v}` : '-'),
    },
    {
      title: '当前申请单',
      dataIndex: 'activeApplicationId',
      width: 140,
      render: (v: string) => (v ? `#${String(v).slice(-6)}` : '-'),
    },
    {
      title: '家庭状态',
      dataIndex: 'status',
      width: 110,
      render: (v: any) => (
        <Tag color={(StatusColors.HouseholdStatus as any)[v]}>
          {dictLabel('HouseholdStatus', v)}
        </Tag>
      ),
    },
    {
      title: '创建时间',
      dataIndex: 'createAt',
      width: 160,
      render: (v: string) =>
        v ? String(v).slice(0, 19).replace('T', ' ') : '-',
    },
    {
      title: '操作',
      key: 'rowAction',
      width: 120,
      fixed: 'right',
      render: (_, record) => (
        <span className="opp-row-actions">
          <span
            className="opp-row-action"
            onClick={(e) => {
              e.stopPropagation();
              navigate(`/profile/households/detail/${record.id}`);
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
      <OmnibarListPage<Household>
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
        scroll={{ x: 1300 }}
        onRowClick={(record) =>
          navigate(`/profile/households/detail/${record.id}`)
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
      <HouseholdCreateModal
        open={createOpen}
        onClose={() => setCreateOpen(false)}
        onSuccess={() => load(1, pageSize)}
      />
    </div>
  );
};

export default ProfileHouseholds;
