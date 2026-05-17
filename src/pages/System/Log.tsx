import React, { useEffect, useState } from 'react';
import { Button, Card, Input, Pagination, Select, Space, Table, Tag } from 'antd';
import { ReloadOutlined, SearchOutlined } from '@ant-design/icons';
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

  async function load(
    page = pageNo,
    size = pageSize,
    overrides?: { operator?: string; action?: string },
  ) {
    setLoading(true);
    try {
      const op = overrides?.operator ?? operator;
      const act = overrides?.action ?? action;
      const builder = qb(LOG_TYPE).orderBy('operatedAt', 'DESC').page(page, size);
      if (op) builder.like('operator', op);
      if (act) builder.eq('action', act);
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
    <div
      style={{
        padding: 24,
        height: 'calc(100vh - 64px - 45px)', // Header + TabBar
        display: 'flex',
        flexDirection: 'column',
        boxSizing: 'border-box',
      }}
    >
      <Card
        title="日志审计"
        style={{ flex: 1, display: 'flex', flexDirection: 'column', minHeight: 0 }}
        styles={{
          body: {
            flex: 1,
            display: 'flex',
            flexDirection: 'column',
            minHeight: 0,
            overflow: 'hidden',
            padding: 0,
          },
        }}
      >
        {/* 工具栏 */}
        <Space
          style={{ padding: '16px 24px', flexShrink: 0, borderBottom: '1px solid #f0f0f0' }}
          wrap
        >
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
          <Button
            type="primary"
            icon={<SearchOutlined />}
            onClick={() => load(1, pageSize)}
          >
            查询
          </Button>
          <Button
            icon={<ReloadOutlined />}
            onClick={() => {
              setOperator('');
              setAction(undefined);
              setPageNo(1);
              load(1, pageSize, { operator: '', action: undefined });
            }}
          >
            重置
          </Button>
        </Space>

        {/* 表格区:flex:1 自滚动 + 表头粘性 */}
        <div
          className="md-list-scroll"
          style={{
            flex: 1,
            minHeight: 0,
            overflow: 'auto',
            position: 'relative',
            padding: '0 12px',
          }}
        >
          <Table<LogRow>
            rowKey="id"
            size="middle"
            dataSource={rows}
            loading={loading}
            sticky={{ offsetHeader: 0 }}
            pagination={false}
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
        </div>

        {/* 分页栏:固定底部 */}
        <div
          style={{
            padding: '8px 24px',
            borderTop: '1px solid #f0f0f0',
            display: 'flex',
            justifyContent: 'flex-end',
            flexShrink: 0,
          }}
        >
          <Pagination
            current={pageNo}
            pageSize={pageSize}
            total={total}
            size="small"
            showSizeChanger
            showTotal={(t) => `共 ${t} 条`}
            onChange={(p, s) => {
              setPageNo(p);
              setPageSize(s);
              load(p, s);
            }}
          />
        </div>
      </Card>
    </div>
  );
};

export default SystemLog;