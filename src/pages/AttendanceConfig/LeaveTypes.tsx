/**
 * 请假类型 — LeaveType
 */

import { PlusOutlined, ReloadOutlined } from '@ant-design/icons';
import { Tag } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import React, { useCallback, useEffect, useState } from 'react';
import EntityCreateModal from '@/components/EntityCreateModal';
import {
  type FilterConfig,
  OmnibarListPage,
  type ToolbarAction,
} from '@/components/OmnibarPage';
import { leaveTypeService } from '@/services/domains/leave';
import { OT } from '@/services/ontology/object-types';
import { qb } from '@/services/ontology/query';
import type { LeaveType } from '@/types/ontology/prh/entities/leave_type';

const AttendanceConfigLeaveTypes: React.FC = () => {
  const [filterValues, setFilterValues] = useState<Record<string, any>>({});
  const [data, setData] = useState<LeaveType[]>([]);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(20);
  const [total, setTotal] = useState(0);
  const [createOpen, setCreateOpen] = useState(false);

  const load = useCallback(
    async (p = page, s = pageSize) => {
      setLoading(true);
      try {
        const builder = qb(OT.LeaveType).orderBy('createAt', 'DESC').page(p, s);
        if (filterValues.keyword) builder.like('name', filterValues.keyword);
        const env = await leaveTypeService.list(builder.build() as any);
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

  const filters: FilterConfig[] = [
    {
      key: 'keyword',
      label: '名称',
      type: 'input',
      placeholder: '请假类型名称',
    },
  ];

  const toolbarActions: ToolbarAction[] = [
    {
      key: 'create',
      type: 'primary',
      icon: <PlusOutlined />,
      label: '新建请假类型',
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

  const columns: ColumnsType<LeaveType> = [
    {
      title: '编号',
      dataIndex: 'id',
      width: 110,
      render: (v: string) => `#${v.slice(-6)}`,
    },
    { title: '类型名称', dataIndex: 'name', width: 200 },
    {
      title: '需要证明材料',
      dataIndex: 'supportDoc',
      width: 130,
      render: (v: boolean) =>
        v ? <Tag color="orange">需要</Tag> : <Tag>不需要</Tag>,
    },
    {
      title: '启用',
      dataIndex: 'enable',
      width: 80,
      render: (v: boolean) =>
        v ? <Tag color="green">启用</Tag> : <Tag>停用</Tag>,
    },
  ];

  return (
    <div style={{ height: '100%' }}>
      <OmnibarListPage<LeaveType>
        filters={filters}
        filterValues={filterValues}
        onFilterChange={setFilterValues}
        onSearch={() => load(1, pageSize)}
        toolbarActions={toolbarActions}
        data={data}
        columns={columns}
        loading={loading}
        rowKey="id"
        showIndex
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
        title="新建请假类型"
        service={leaveTypeService as any}
        width={520}
        fields={[
          {
            name: 'name',
            label: '类型名称',
            type: 'input',
            required: true,
            span: 2,
          },
          { name: 'supportDoc', label: '需要证明材料', type: 'switch' },
        ]}
      />
    </div>
  );
};

export default AttendanceConfigLeaveTypes;
