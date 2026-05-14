import React, { useEffect, useMemo, useState } from 'react';
import { observer } from 'mobx-react-lite';
import {
  Badge,
  Button,
  Card,
  Col,
  DatePicker,
  Form,
  Input,
  message,
  Modal,
  Row,
  Select,
  Space,
  Statistic,
  Table,
  Tag,
  Tooltip,
} from 'antd';
import {
  AlertOutlined,
  CheckCircleOutlined,
  ClockCircleOutlined,
  DeleteOutlined,
  ExclamationCircleOutlined,
  ExportOutlined,
  EyeOutlined,
  ReloadOutlined,
  SearchOutlined,
} from '@ant-design/icons';
import { useNavigate } from '@umijs/max';
import { alertStore } from '@/stores';
import type { AlertItem } from '@/services/domains/alert';
import { EnumLabels, StatusColors, enumOptions } from '@/utils/enum-options';
import { AlertLevel } from '@/types/ontology/prh/enums';

const { RangePicker } = DatePicker;

interface SearchValues {
  keyword?: string;
  level?: AlertLevel;
  status?: AlertItem['status'];
  dateRange?: [any, any];
}

const AlertList: React.FC = observer(() => {
  const navigate = useNavigate();
  const [form] = Form.useForm<SearchValues>();
  const [filters, setFilters] = useState<SearchValues>({});

  useEffect(() => {
    alertStore.fetchAlerts({ pageSize: 100 });
  }, []);

  const filtered = useMemo(() => {
    let list = alertStore.alerts;
    if (filters.keyword) {
      const k = filters.keyword.toLowerCase();
      list = list.filter(
        (a) =>
          a.title.toLowerCase().includes(k) ||
          a.content.toLowerCase().includes(k) ||
          a.resident.toLowerCase().includes(k),
      );
    }
    if (filters.level) list = list.filter((a) => a.level === filters.level);
    if (filters.status) list = list.filter((a) => a.status === filters.status);
    if (filters.dateRange?.[0] && filters.dateRange[1]) {
      const start = filters.dateRange[0].valueOf();
      const end = filters.dateRange[1].valueOf();
      list = list.filter((a) => {
        const t = new Date(a.createTime).getTime();
        return t >= start && t <= end;
      });
    }
    return list;
  }, [filters, alertStore.alerts]);

  const stats = useMemo(() => {
    const list = alertStore.alerts;
    return {
      total: list.length,
      pending: list.filter((a) => a.status === 'pending').length,
      processing: list.filter((a) => a.status === 'processing').length,
      resolved: list.filter((a) => a.status === 'resolved').length,
      critical: list.filter((a) => a.level === 'ALERT_RED').length,
    };
  }, [alertStore.alerts]);

  const columns = [
    {
      title: '编号',
      dataIndex: 'id',
      key: 'id',
      width: 200,
      render: (id: string) => <span style={{ fontWeight: 500 }}>#{id.slice(-6)}</span>,
    },
    {
      title: '居民',
      dataIndex: 'resident',
      key: 'resident',
      width: 140,
    },
    {
      title: '预警类型',
      dataIndex: 'title',
      key: 'title',
      width: 220,
      render: (t: string) => <Tag>{t}</Tag>,
    },
    {
      title: '级别',
      dataIndex: 'level',
      key: 'level',
      width: 100,
      render: (level: AlertLevel) => (
        <Tag color={StatusColors.AlertLevel[level]}>
          {EnumLabels.AlertLevel[level] ?? level}
        </Tag>
      ),
    },
    {
      title: '触发时间',
      dataIndex: 'createTime',
      key: 'createTime',
      width: 200,
      render: (t: string) => (t ? new Date(t).toLocaleString() : '-'),
    },
    {
      title: '处理状态',
      dataIndex: 'status',
      key: 'status',
      width: 100,
      render: (status: AlertItem['status']) => {
        const cfg: Record<string, { text: string; badge: 'warning' | 'processing' | 'success' }> = {
          pending: { text: '待处理', badge: 'warning' },
          processing: { text: '处理中', badge: 'processing' },
          resolved: { text: '已解决', badge: 'success' },
        };
        const c = cfg[status];
        return <Badge status={c.badge} text={c.text} />;
      },
    },
    {
      title: '说明',
      dataIndex: 'content',
      key: 'content',
      ellipsis: { showTitle: false },
      render: (desc: string) => (
        <Tooltip title={desc}>
          <span>{desc}</span>
        </Tooltip>
      ),
    },
    {
      title: '操作',
      key: 'action',
      width: 180,
      fixed: 'right' as const,
      render: (_: any, record: AlertItem) => (
        <Space size="small">
          <Tooltip title="查看详情">
            <Button
              type="link"
              size="small"
              icon={<EyeOutlined />}
              onClick={() => navigate(`/monitor/alert/detail/${record.id}`)}
            />
          </Tooltip>
          {record.status !== 'resolved' && (
            <Tooltip title="处理">
              <Button
                type="link"
                size="small"
                onClick={() =>
                  Modal.confirm({
                    title: '处理预警',
                    content: `确认将 #${record.id.slice(-6)} 标记为已处理?`,
                    onOk: () => {
                      alertStore.updateAlert(record.id, { status: 'resolved' });
                      message.success('已处理');
                    },
                  })
                }
              >
                处理
              </Button>
            </Tooltip>
          )}
          <Tooltip title="移除">
            <Button
              type="link"
              size="small"
              danger
              icon={<DeleteOutlined />}
              onClick={() =>
                Modal.confirm({
                  title: '移除',
                  content: '确认从列表移除该条预警?(不会删除底层考勤记录)',
                  okType: 'danger',
                  onOk: () => alertStore.removeAlert(record.id),
                })
              }
            />
          </Tooltip>
        </Space>
      ),
    },
  ];

  return (
    <div style={{ padding: 24, background: '#f0f2f5', minHeight: 'calc(100vh - 64px)' }}>
      <Row gutter={16} style={{ marginBottom: 16 }}>
        <Col xs={24} sm={12} md={6} lg={4}>
          <Card size="small">
            <Statistic
              title="预警总数"
              value={stats.total}
              prefix={<AlertOutlined style={{ color: '#1890ff' }} />}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6} lg={4}>
          <Card size="small">
            <Statistic
              title="待处理"
              value={stats.pending}
              valueStyle={{ color: '#faad14' }}
              prefix={<ClockCircleOutlined />}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6} lg={4}>
          <Card size="small">
            <Statistic
              title="处理中"
              value={stats.processing}
              valueStyle={{ color: '#1890ff' }}
              prefix={<ExclamationCircleOutlined />}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6} lg={4}>
          <Card size="small">
            <Statistic
              title="已解决"
              value={stats.resolved}
              valueStyle={{ color: '#52c41a' }}
              prefix={<CheckCircleOutlined />}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6} lg={4}>
          <Card size="small">
            <Statistic
              title="红色预警"
              value={stats.critical}
              valueStyle={{ color: '#ff4d4f' }}
              prefix={<AlertOutlined />}
            />
          </Card>
        </Col>
      </Row>

      <Card style={{ marginBottom: 16 }}>
        <Form
          form={form}
          layout="inline"
          onFinish={(v) => setFilters(v)}
        >
          <Row gutter={[16, 16]} style={{ width: '100%' }}>
            <Col xs={24} sm={12} md={6}>
              <Form.Item name="keyword" style={{ marginBottom: 0, width: '100%' }}>
                <Input placeholder="居民/类型/说明" prefix={<SearchOutlined />} allowClear />
              </Form.Item>
            </Col>
            <Col xs={24} sm={12} md={6}>
              <Form.Item name="level" style={{ marginBottom: 0, width: '100%' }}>
                <Select
                  placeholder="预警级别"
                  allowClear
                  options={enumOptions(AlertLevel, EnumLabels.AlertLevel)}
                />
              </Form.Item>
            </Col>
            <Col xs={24} sm={12} md={6}>
              <Form.Item name="status" style={{ marginBottom: 0, width: '100%' }}>
                <Select
                  placeholder="处理状态"
                  allowClear
                  options={[
                    { label: '待处理', value: 'pending' },
                    { label: '处理中', value: 'processing' },
                    { label: '已解决', value: 'resolved' },
                  ]}
                />
              </Form.Item>
            </Col>
            <Col xs={24} sm={12} md={6}>
              <Form.Item name="dateRange" style={{ marginBottom: 0, width: '100%' }}>
                <RangePicker
                  showTime
                  style={{ width: '100%' }}
                  placeholder={['开始时间', '结束时间']}
                />
              </Form.Item>
            </Col>
            <Col span={24}>
              <Space>
                <Button type="primary" htmlType="submit" icon={<SearchOutlined />}>
                  查询
                </Button>
                <Button
                  onClick={() => {
                    form.resetFields();
                    setFilters({});
                  }}
                  icon={<ReloadOutlined />}
                >
                  重置
                </Button>
                <Button onClick={() => alertStore.fetchAlerts({ pageSize: 100 })}>
                  刷新
                </Button>
              </Space>
            </Col>
          </Row>
        </Form>
      </Card>

      <Card
        title={
          <Space>
            <AlertOutlined /> 预警列表
          </Space>
        }
        extra={
          <Button icon={<ExportOutlined />} onClick={() => message.info('请到「报表导出」页面执行')}>
            导出
          </Button>
        }
      >
        <Table
          rowKey="id"
          columns={columns}
          dataSource={filtered}
          loading={alertStore.loading}
          scroll={{ x: 1400 }}
          pagination={{
            pageSize: 10,
            showSizeChanger: true,
            showQuickJumper: true,
            showTotal: (total) => `共 ${total} 条`,
          }}
        />
      </Card>
    </div>
  );
});

export default AlertList;
