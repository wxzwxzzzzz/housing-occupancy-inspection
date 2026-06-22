/**
 * 考勤方案 — AttendanceSolution
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
import { attendanceSolutionService } from '@/services/domains/attendance';
import { OT } from '@/services/ontology/object-types';
import { qb } from '@/services/ontology/query';
import type { AttendanceSolution } from '@/types/ontology/prh/entities/attendance_solution';

const AttendanceConfigSolutions: React.FC = () => {
  const [filterValues, setFilterValues] = useState<Record<string, any>>({});
  const [data, setData] = useState<AttendanceSolution[]>([]);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(20);
  const [total, setTotal] = useState(0);
  const [createOpen, setCreateOpen] = useState(false);

  const load = useCallback(
    async (p = page, s = pageSize) => {
      setLoading(true);
      try {
        const builder = qb(OT.AttendanceSolution)
          .orderBy('priority', 'ASC')
          .page(p, s);
        if (filterValues.keyword) builder.like('name', filterValues.keyword);
        const env = await attendanceSolutionService.list(
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

  const filters: FilterConfig[] = [
    { key: 'keyword', label: '名称', type: 'input', placeholder: '方案名称' },
  ];

  const toolbarActions: ToolbarAction[] = [
    {
      key: 'create',
      type: 'primary',
      icon: <PlusOutlined />,
      label: '新建',
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

  const columns: ColumnsType<AttendanceSolution> = [
    { title: '编码', dataIndex: 'code', width: 140 },
    { title: '名称', dataIndex: 'name', width: 180 },
    { title: '描述', dataIndex: 'description', ellipsis: true },
    { title: '优先级', dataIndex: 'priority', width: 90 },
    {
      title: '关联日历',
      dataIndex: 'calendar',
      width: 140,
      render: (v: string) => (v ? `#${String(v).slice(-6)}` : '-'),
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
      <OmnibarListPage<AttendanceSolution>
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
        title="新建考勤方案"
        service={attendanceSolutionService as any}
        fields={[
          { name: 'code', label: '编码', type: 'input', required: true },
          { name: 'name', label: '名称', type: 'input', required: true },
          {
            name: 'calendar',
            label: '关联日历',
            type: 'refer',
            required: true,
            referObjectType: OT.Calendar,
            referLabelField: 'name',
            referExtraFilter: (b) => b.eq('enable', 'true'),
            span: 2,
          },
          { name: 'priority', label: '优先级', type: 'number' },
          { name: 'description', label: '描述', type: 'textarea', span: 2 },
        ]}
      />
    </div>
  );
};

export default AttendanceConfigSolutions;
