/**
 * 考勤规则 — AttendanceRule
 */

import { ReloadOutlined } from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
import React, { useCallback, useEffect, useState } from 'react';
import {
  type FilterConfig,
  OmnibarListPage,
  type ToolbarAction,
} from '@/components/OmnibarPage';
import { attendanceRuleService } from '@/services/domains/attendance';
import { OT } from '@/services/ontology/object-types';
import { qb } from '@/services/ontology/query';
import type { AttendanceRule } from '@/types/ontology/prh/entities/attendance_rule';
import { AttendancePeriod, AttendanceType } from '@/types/ontology/prh/enums';
import { EnumLabels, enumOptions } from '@/utils/enum-options';

const AttendanceConfigRules: React.FC = () => {
  const [filterValues, setFilterValues] = useState<Record<string, any>>({});
  const [data, setData] = useState<AttendanceRule[]>([]);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(20);
  const [total, setTotal] = useState(0);

  const load = useCallback(
    async (p = page, s = pageSize) => {
      setLoading(true);
      try {
        const builder = qb(OT.AttendanceRule)
          .orderBy('createAt', 'DESC')
          .page(p, s);
        if (filterValues.attendanceType)
          builder.eq('attendanceType', filterValues.attendanceType);
        if (filterValues.period) builder.eq('period', filterValues.period);
        const env = await attendanceRuleService.list(builder.build() as any);
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
      key: 'attendanceType',
      label: '出勤类型',
      type: 'select',
      options: enumOptions(AttendanceType, EnumLabels.AttendanceType),
    },
    {
      key: 'period',
      label: '考核周期',
      type: 'select',
      options: enumOptions(AttendancePeriod, EnumLabels.AttendancePeriod),
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

  const columns: ColumnsType<AttendanceRule> = [
    {
      title: '编号',
      dataIndex: 'id',
      width: 110,
      render: (v: string) => `#${v.slice(-6)}`,
    },
    {
      title: '所属方案',
      dataIndex: 'solution',
      width: 140,
      render: (v: string) => (v ? `#${String(v).slice(-6)}` : '-'),
    },
    {
      title: '出勤类型',
      dataIndex: 'attendanceType',
      width: 120,
      render: (v: any) =>
        EnumLabels.AttendanceType[
          v as keyof typeof EnumLabels.AttendanceType
        ] ?? v,
    },
    { title: '打卡次数', dataIndex: 'checkInCount', width: 100 },
    {
      title: '考核周期',
      dataIndex: 'period',
      width: 110,
      render: (v: any) =>
        EnumLabels.AttendancePeriod[
          v as keyof typeof EnumLabels.AttendancePeriod
        ] ?? v,
    },
  ];

  return (
    <div style={{ height: '100%' }}>
      <OmnibarListPage<AttendanceRule>
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

export default AttendanceConfigRules;
