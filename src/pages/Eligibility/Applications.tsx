/**
 * 保障资质申请 — EligibilityApplication
 *
 * 状态机:DRAFT → UNDER_APPROVAL → COMPLETED / CANCELLED
 * 完成后家庭进入候选(CANDIDATE),可发起实物配租 / 租赁补贴。
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
import { eligibilityApplicationService } from '@/services/domains/eligibility';
import { OT } from '@/services/ontology/object-types';
import { qb } from '@/services/ontology/query';
import { dictLabel, dictStore } from '@/stores/dictStore';
import type { EligibilityApplication } from '@/types/ontology/prh/entities/eligibility_application';
import { StatusColors } from '@/utils/enum-options';

const EligibilityApplications: React.FC = () => {
  const navigate = useNavigate();
  const [filterValues, setFilterValues] = useState<Record<string, any>>({});
  const [data, setData] = useState<EligibilityApplication[]>([]);
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
        const builder = qb(OT.EligibilityApplication)
          .orderBy('createAt', 'DESC')
          .page(p, s);
        if (filterValues.status) builder.eq('status', filterValues.status);
        if (filterValues.guaranteeType)
          builder.eq('guaranteeType', filterValues.guaranteeType);
        if (filterValues.applicationType)
          builder.eq('applicationType', filterValues.applicationType);
        const env = await eligibilityApplicationService.list(
          builder.build() as any,
        );
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
        options: dictStore.options('ApplicationStatus'),
      },
      {
        key: 'applicationType',
        label: '申请类型',
        type: 'select',
        options: dictStore.options('ApplicationType'),
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
      label: '新建资质申请',
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

  const columns: ColumnsType<EligibilityApplication> = [
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
    {
      title: '申请类型',
      dataIndex: 'applicationType',
      width: 120,
      render: (v: any) => dictLabel('ApplicationType', v),
    },
    {
      title: '保障类型',
      dataIndex: 'guaranteeType',
      width: 130,
      render: (v: any) => dictLabel('GuaranteeType', v),
    },
    {
      title: '状态',
      dataIndex: 'status',
      width: 110,
      render: (v: any) => (
        <Tag color={(StatusColors.ApplicationStatus as any)[v]}>
          {dictLabel('ApplicationStatus', v)}
        </Tag>
      ),
    },
    { title: '提交时间', dataIndex: 'submittedAt', width: 160 },
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
              navigate(`/eligibility/applications/detail/${record.id}`);
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
      <OmnibarListPage<EligibilityApplication>
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
          navigate(`/eligibility/applications/detail/${record.id}`)
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
        title="新建资质申请"
        service={eligibilityApplicationService as any}
        fields={[
          {
            name: 'household',
            label: '所属家庭',
            type: 'refer',
            required: true,
            referObjectType: OT.Household,
            referLabelField: 'applicantName',
            referSearchField: 'applicantName',
            extra: '只有"已激活"的家庭可发起申请',
            referExtraFilter: (b) => b.eq('status', 'ACTIVE'),
            span: 2,
          },
          {
            name: 'applicationType',
            label: '申请类型',
            type: 'select',
            required: true,
            dictName: 'ApplicationType',
          },
          {
            name: 'guaranteeType',
            label: '保障类型',
            type: 'select',
            required: true,
            dictName: 'GuaranteeType',
          },
        ]}
      />
    </div>
  );
};

export default EligibilityApplications;
