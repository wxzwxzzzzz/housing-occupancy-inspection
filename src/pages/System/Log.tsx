import React, { useEffect, useState } from 'react';
import { Tag } from 'antd';
import { ReloadOutlined } from '@ant-design/icons';
import { invokeQuery } from '@/services/ontology/client';
import { qb } from '@/services/ontology/query';
import { OmnibarListPage, type FilterConfig, type ToolbarAction } from '@/components/OmnibarPage';

const LOG_TYPE = 'cn.byteawake.prh.OperationLog';

const ACTION_LABEL: Record<string, string> = {
  login: '登录',
  create: '创建',
  update: '更新',
  delete: '删除',
  approve: '审批',
};

interface LogRow {
  id: string;
  operator: string;
  action: string;
  target: string;
  ipAddress: string;
  operatedAt: string;
}

const SystemLog: React.FC = () => {
  const [rows, setRows] = useState<LogRow[]>([]);
  const [loading, setLoading] = useState(false);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(20);
  const [filterValues, setFilterValues] = useState<Record<string, any>>({});

  const load = async (
    p = page,
    s = pageSize,
    overrides?: Record<string, any>,
  ) => {
    setLoading(true);
    try {
      const v = overrides ?? filterValues;
      const builder = qb(LOG_TYPE).orderBy('operatedAt', 'DESC').page(p, s);
      if (v.operator) builder.like('operator', v.operator);
      if (v.action) builder.eq('action', v.action);
      const env = await invokeQuery<LogRow>(LOG_TYPE, builder.build());
      setRows(env.data);
      setTotal(env.page?.total ?? env.data.length);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load(1, pageSize);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const filters: FilterConfig[] = [
    { key: 'operator', label: '操作人', type: 'input', placeholder: '输入操作人' },
    {
      key: 'action',
      label: '操作类型',
      type: 'quick',
      options: [
        { value: '', label: '全部' },
        ...Object.entries(ACTION_LABEL).map(([value, label]) => ({ value, label })),
      ],
    },
  ];

  const toolbarActions: ToolbarAction[] = [
    {
      key: 'refresh',
      type: 'icon',
      icon: <ReloadOutlined />,
      title: '刷新',
      onClick: () => load(),
    },
  ];

  const columns = [
    { title: '操作人', dataIndex: 'operator', width: 140 },
    {
      title: '操作类型',
      dataIndex: 'action',
      width: 110,
      render: (v: string) => <Tag>{ACTION_LABEL[v] ?? v}</Tag>,
    },
    { title: '目标', dataIndex: 'target', width: 200 },
    { title: 'IP', dataIndex: 'ipAddress', width: 140 },
    {
      title: '时间',
      dataIndex: 'operatedAt',
      width: 200,
      render: (v: string) => (v ? new Date(v).toLocaleString() : '-'),
    },
  ];

  return (
    <div style={{ padding: 16, height: 'calc(100vh - 64px - 45px)' }}>
      <OmnibarListPage<LogRow>
        filters={filters}
        filterValues={filterValues}
        onFilterChange={setFilterValues}
        onSearch={() => load(1, pageSize)}
        toolbarActions={toolbarActions}
        data={rows}
        columns={columns}
        loading={loading}
        rowKey="id"
        showCheckbox={false}
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

export default SystemLog;
