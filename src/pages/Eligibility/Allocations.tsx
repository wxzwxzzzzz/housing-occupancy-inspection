/**
 * 实物配租 — HousingAllocation
 *
 * 状态机:DRAFT → ALLOC_ACTIVE → ALLOC_TERMINATED / ALLOC_EXPIRED
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
import { housingAllocationService } from '@/services/domains/eligibility';
import { OT } from '@/services/ontology/object-types';
import { qb } from '@/services/ontology/query';
import { dictLabel, dictStore } from '@/stores/dictStore';
import type { HousingAllocation } from '@/types/ontology/prh/entities/housing_allocation';

const StatusColor: Record<string, string> = {
  DRAFT: 'default',
  ALLOC_ACTIVE: 'green',
  ALLOC_TERMINATED: 'red',
  ALLOC_EXPIRED: 'orange',
};

const EligibilityAllocations: React.FC = () => {
  const navigate = useNavigate();
  const [filterValues, setFilterValues] = useState<Record<string, any>>({});
  const [data, setData] = useState<HousingAllocation[]>([]);
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
        const builder = qb(OT.HousingAllocation)
          .orderBy('createAt', 'DESC')
          .page(p, s);
        if (filterValues.status) builder.eq('status', filterValues.status);
        if (filterValues.keyword)
          builder.like('projectName', filterValues.keyword);
        const env = await housingAllocationService.list(builder.build() as any);
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
      { key: 'keyword', label: '项目', type: 'input', placeholder: '项目名称' },
      {
        key: 'status',
        label: '状态',
        type: 'select',
        options: dictStore.options('AllocationStatus'),
      },
    ],
    [],
  );

  const toolbarActions: ToolbarAction[] = [
    {
      key: 'create',
      type: 'primary',
      icon: <PlusOutlined />,
      label: '新建配租',
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

  const columns: ColumnsType<HousingAllocation> = [
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
    { title: '项目名称', dataIndex: 'projectName', width: 180, ellipsis: true },
    {
      title: '楼栋/单元/房号',
      key: 'addr',
      width: 160,
      render: (_, r: any) =>
        [r.buildingNo, r.unitNo, r.roomNo].filter(Boolean).join('-') || '-',
    },
    { title: '面积(㎡)', dataIndex: 'area', width: 90 },
    { title: '月租金', dataIndex: 'monthlyRent', width: 100 },
    { title: '起租', dataIndex: 'leaseStartDate', width: 110 },
    { title: '到期', dataIndex: 'leaseEndDate', width: 110 },
    {
      title: '状态',
      dataIndex: 'status',
      width: 110,
      render: (v: any) => (
        <Tag color={StatusColor[v]}>{dictLabel('AllocationStatus', v)}</Tag>
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
              navigate(`/eligibility/allocations/detail/${record.id}`);
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
      <OmnibarListPage<HousingAllocation>
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
        scroll={{ x: 1400 }}
        onRowClick={(record) =>
          navigate(`/eligibility/allocations/detail/${record.id}`)
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
        title="新建配租"
        service={housingAllocationService as any}
        width={720}
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
            name: 'projectName',
            label: '项目名称',
            type: 'input',
            required: true,
          },
          { name: 'buildingNo', label: '楼栋号', type: 'input' },
          { name: 'unitNo', label: '单元号', type: 'input' },
          { name: 'roomNo', label: '房号', type: 'input' },
          { name: 'area', label: '面积(㎡)', type: 'number' },
          { name: 'monthlyRent', label: '月租金(元)', type: 'number' },
          {
            name: 'leaseStartDate',
            label: '起租日期',
            type: 'date',
            required: true,
          },
          { name: 'leaseEndDate', label: '到期日期', type: 'date' },
        ]}
      />
    </div>
  );
};

export default EligibilityAllocations;
