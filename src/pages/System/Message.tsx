import React, { useCallback, useEffect, useState } from 'react';
import { Badge, Card, Col, Row, Statistic, Tag } from 'antd';
import { CheckCircleOutlined, ReloadOutlined, MessageOutlined, BellOutlined } from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
import { invokeAction, invokeQuery } from '@/services/ontology/client';
import { qb } from '@/services/ontology/query';
import {
  OmnibarListPage,
  type FilterConfig,
  type ToolbarAction,
} from '@/components/OmnibarPage';

const MSG_TYPE = 'cn.byteawake.prh.Message';

const LEVEL_COLOR: Record<string, string> = {
  info: 'blue',
  success: 'green',
  warning: 'orange',
  error: 'red',
};

const LEVEL_LABEL: Record<string, string> = {
  info: '通知',
  success: '成功',
  warning: '警告',
  error: '错误',
};

interface MessageRow {
  id: string;
  title: string;
  content: string;
  level: string;
  read: boolean;
  createAt: string;
}

const SystemMessage: React.FC = () => {
  const [filterValues, setFilterValues] = useState<Record<string, any>>({});
  const [data, setData] = useState<MessageRow[]>([]);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(20);
  const [total, setTotal] = useState(0);
  const [selectedKeys, setSelectedKeys] = useState<React.Key[]>([]);

  const load = useCallback(
    async (p = page, s = pageSize, override?: Record<string, any>) => {
      setLoading(true);
      try {
        const v = override ?? filterValues;
        const builder = qb(MSG_TYPE).orderBy('createAt', 'DESC').page(p, s);
        if (v.level) builder.eq('level', v.level);
        if (v.read !== undefined && v.read !== '' && v.read !== null) {
          builder.eq('read', v.read === 'true' || v.read === true);
        }
        if (v.keyword) builder.like('title', v.keyword);
        const env = await invokeQuery<MessageRow>(MSG_TYPE, builder.build());
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
  }, []);

  const unreadCount = data.filter((r) => !r.read).length;
  const totalShown = data.length;

  // 顶部统计:总数 / 未读 / 警告 / 错误
  const stats = {
    total: totalShown,
    unread: unreadCount,
    warning: data.filter((r) => r.level === 'warning').length,
    error: data.filter((r) => r.level === 'error').length,
  };

  const markRead = async (row: MessageRow) => {
    await invokeAction({
      objectType: MSG_TYPE,
      actionName: 'modify',
      payload: { id: row.id, read: true },
    });
    load();
  };

  const markAllRead = async () => {
    const unread = data.filter((r) => !r.read);
    if (unread.length === 0) return;
    await Promise.all(
      unread.map((row) =>
        invokeAction({
          objectType: MSG_TYPE,
          actionName: 'modify',
          payload: { id: row.id, read: true },
        }),
      ),
    );
    load();
  };

  const markSelectedRead = async () => {
    if (selectedKeys.length === 0) return;
    await Promise.all(
      selectedKeys.map((id) =>
        invokeAction({
          objectType: MSG_TYPE,
          actionName: 'modify',
          payload: { id: String(id), read: true },
        }),
      ),
    );
    setSelectedKeys([]);
    load();
  };

  const filters: FilterConfig[] = [
    { key: 'keyword', label: '关键字', type: 'input', placeholder: '消息标题' },
    {
      key: 'level',
      label: '类型',
      type: 'quick',
      options: [
        { value: '', label: '全部' },
        { value: 'info', label: '通知' },
        { value: 'success', label: '成功' },
        { value: 'warning', label: '警告' },
        { value: 'error', label: '错误' },
      ],
    },
    {
      key: 'read',
      label: '已读',
      type: 'quick',
      options: [
        { value: '', label: '全部' },
        { value: 'false', label: '未读' },
        { value: 'true', label: '已读' },
      ],
    },
  ];

  const toolbarActions: ToolbarAction[] = [
    {
      key: 'markSelected',
      label: '标记已读',
      icon: <CheckCircleOutlined />,
      disabled: selectedKeys.length === 0,
      onClick: markSelectedRead,
    },
    {
      key: 'markAll',
      type: 'primary',
      label: '全部标为已读',
      disabled: unreadCount === 0,
      onClick: markAllRead,
    },
    { divider: true },
    {
      key: 'refresh',
      type: 'icon',
      icon: <ReloadOutlined />,
      title: '刷新',
      onClick: () => load(),
    },
  ];

  const columns: ColumnsType<MessageRow> = [
    {
      title: '标题',
      dataIndex: 'title',
      width: 280,
      render: (v: string, record) => (
        <span style={{ display: 'inline-flex', alignItems: 'center', gap: 8 }}>
          {!record.read && <Badge status="processing" />}
          <span style={{ fontWeight: record.read ? 400 : 600 }}>{v}</span>
        </span>
      ),
    },
    {
      title: '类型',
      dataIndex: 'level',
      width: 100,
      render: (v: string) => (
        <Tag color={LEVEL_COLOR[v] ?? 'default'}>{LEVEL_LABEL[v] ?? v}</Tag>
      ),
    },
    {
      title: '内容',
      dataIndex: 'content',
      ellipsis: true,
    },
    {
      title: '状态',
      dataIndex: 'read',
      width: 90,
      render: (v: boolean) =>
        v ? (
          <Tag color="default">已读</Tag>
        ) : (
          <Tag color="blue">未读</Tag>
        ),
    },
    {
      title: '时间',
      dataIndex: 'createAt',
      width: 180,
      render: (v: string) => (v ? new Date(v).toLocaleString() : '-'),
    },
    {
      title: '操作',
      key: 'action',
      width: 120,
      render: (_: any, record: MessageRow) => (
        <span className="opp-row-actions">
          {!record.read && (
            <span
              className="opp-row-action"
              onClick={(e) => {
                e.stopPropagation();
                markRead(record);
              }}
            >
              标记已读
            </span>
          )}
        </span>
      ),
    },
  ];

  const topSlot = (
    <Row gutter={12}>
      <Col xs={12} sm={6}>
        <Card size="small">
          <Statistic
            title="消息总数"
            value={stats.total}
            prefix={<MessageOutlined style={{ color: '#1677ff' }} />}
          />
        </Card>
      </Col>
      <Col xs={12} sm={6}>
        <Card size="small">
          <Statistic
            title="未读"
            value={stats.unread}
            valueStyle={{ color: '#1677ff' }}
            prefix={<BellOutlined />}
          />
        </Card>
      </Col>
      <Col xs={12} sm={6}>
        <Card size="small">
          <Statistic
            title="警告"
            value={stats.warning}
            valueStyle={{ color: '#faad14' }}
          />
        </Card>
      </Col>
      <Col xs={12} sm={6}>
        <Card size="small">
          <Statistic title="错误" value={stats.error} valueStyle={{ color: '#ff4d4f' }} />
        </Card>
      </Col>
    </Row>
  );

  return (
    <div style={{ padding: 16, height: 'calc(100vh - 64px - 45px)' }}>
      <OmnibarListPage<MessageRow>
        topSlot={topSlot}
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
        onRowClick={(record) => {
          if (!record.read) markRead(record);
        }}
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

export default SystemMessage;
