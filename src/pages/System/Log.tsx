import React, { useEffect, useState } from 'react';
import { Card, Input, Select, Space, Table, Tag } from 'antd';
import { SearchOutlined } from '@ant-design/icons';
import { invokeQuery } from '@/services/ontology/client';
import { qb } from '@/services/ontology/query';

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
  const [pageNo, setPageNo] = useState(1);
  const [pageSize, setPageSize] = useState(20);
  const [operator, setOperator] = useState('');
  const [action, setAction] = useState<string | undefined>();

  async function load(page = pageNo, size = pageSize) {
    setLoading(true);
    try {
      const builder = qb(LOG_TYPE).orderBy('operatedAt', 'DESC').page(page, size);
      if (operator) builder.like('operator', operator);
      if (action) builder.eq('action', action);
      const env = await invokeQuery<LogRow>(LOG_TYPE, builder.build());
      setRows(env.data);
      setTotal(env.page?.total ?? env.data.length);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load(1, pageSize);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div style={{ padding: 24 }}>
      <Card title="日志审计">
        <Space style={{ marginBottom: 16 }}>
          <Input
            placeholder="操作人"
            prefix={<SearchOutlined />}
            value={operator}
            onChange={(e) => setOperator(e.target.value)}
            allowClear
            onPressEnter={() => load(1, pageSize)}
            style={{ width: 200 }}
          />
          <Select
            placeholder="操作类型"
            allowClear
            value={action}
            onChange={(v) => setAction(v)}
            style={{ width: 160 }}
            options={Object.entries(ACTION_LABEL).map(([value, label]) => ({ value, label }))}
          />
          <a onClick={() => load(1, pageSize)}>查询</a>
        </Space>
        <Table<LogRow>
          rowKey="id"
          dataSource={rows}
          loading={loading}
          pagination={{
            current: pageNo,
            pageSize,
            total,
            onChange: (p, s) => {
              setPageNo(p);
              setPageSize(s);
              load(p, s);
            },
            showTotal: (t) => `共 ${t} 条`,
          }}
          columns={[
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
          ]}
        />
      </Card>
    </div>
  );
};

export default SystemLog;
