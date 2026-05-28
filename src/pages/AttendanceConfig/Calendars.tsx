/**
 * 资源日历 — ap.resource.Calendar
 */

import { ReloadOutlined } from '@ant-design/icons';
import { Tag } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import React, { useCallback, useEffect, useState } from 'react';
import {
  type FilterConfig,
  OmnibarListPage,
  type ToolbarAction,
} from '@/components/OmnibarPage';
import { calendarService } from '@/services/domains/resource';
import { OT } from '@/services/ontology/object-types';
import { qb } from '@/services/ontology/query';
import type { Calendar } from '@/types/ontology/ap/resource/calendar';

const AttendanceConfigCalendars: React.FC = () => {
  const [filterValues, setFilterValues] = useState<Record<string, any>>({});
  const [data, setData] = useState<Calendar[]>([]);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(20);
  const [total, setTotal] = useState(0);

  const load = useCallback(
    async (p = page, s = pageSize) => {
      setLoading(true);
      try {
        const builder = qb(OT.Calendar).orderBy('createAt', 'DESC').page(p, s);
        if (filterValues.keyword) builder.like('name', filterValues.keyword);
        const env = await calendarService.list(builder.build() as any);
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
    { key: 'keyword', label: '名称', type: 'input', placeholder: '日历名称' },
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

  const columns: ColumnsType<Calendar> = [
    { title: '编码', dataIndex: 'code', width: 140 },
    { title: '名称', dataIndex: 'name', width: 180 },
    { title: '时区', dataIndex: 'timezone', width: 140 },
    { title: '每日小时数', dataIndex: 'hoursPerDay', width: 110 },
    { title: '每周小时数', dataIndex: 'hoursPerWeek', width: 110 },
    { title: '调度类型', dataIndex: 'scheduleType', width: 110 },
    {
      title: '双周日历',
      dataIndex: 'twoWeeksCalendar',
      width: 100,
      render: (v: boolean) =>
        v ? <Tag color="processing">是</Tag> : <Tag>否</Tag>,
    },
    { title: '描述', dataIndex: 'description', ellipsis: true },
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
      <OmnibarListPage<Calendar>
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
    </div>
  );
};

export default AttendanceConfigCalendars;
