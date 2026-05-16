import React, { useEffect, useMemo, useState } from 'react';
import {
  Button,
  Card,
  Col,
  DatePicker,
  Descriptions,
  Form,
  Input,
  message,
  Modal,
  Row,
  Select,
  Space,
  Statistic,
  Tag,
  Tooltip,
} from 'antd';
import {
  AlertOutlined,
  CheckCircleOutlined,
  ClockCircleOutlined,
  ExclamationCircleOutlined,
  ExportOutlined,
  ReloadOutlined,
  SearchOutlined,
} from '@ant-design/icons';
import { observer } from 'mobx-react-lite';
import { useNavigate } from '@umijs/max';
import type { ColumnsType } from 'antd/es/table';
import { alertStore } from '@/stores';
import type { AlertItem } from '@/services/domains/alert';
import { EnumLabels, StatusColors, enumOptions } from '@/utils/enum-options';
import { AlertLevel } from '@/types/ontology/prh/enums';
import MasterDetailListPage from '@/components/MasterDetailListPage';
import ResidentLink from '@/components/ResidentLink';
import { invokeQuery } from '@/services/ontology/client';
import { qb } from '@/services/ontology/query';
import { OT } from '@/services/ontology/object-types';

const { RangePicker } = DatePicker;

interface SearchValues {
  keyword?: string;
  level?: AlertLevel;
  status?: AlertItem['status'];
  dateRange?: [any, any];
}

/**
 * 因为 alertService.list 返回的不是直接的 EntityApi<T> 形态(派生自 fact),
 * 这里包一个 minimal EntityApi 适配器,只让 MasterDetailListPage 能调 list。
 */
const alertEntityAdapter = {
  objectType: OT.AttendanceFact,
  list: async (spec: any) => {
    // 不走 alertStore,直接拉 fact + 拼成 AlertItem
    const builder = qb(OT.AttendanceFact)
      .in('attendanceStatus', ['INVALID', 'MISSED'])
      .orderBy('checkIn', 'DESC')
      .page(spec?.page?.pageNo ?? 1, spec?.page?.pageSize ?? 20);
    const env = await invokeQuery<any>(OT.AttendanceFact, builder.build());
    const items: AlertItem[] = env.data.map((fact: any) => ({
      id: String(fact.attendance ?? fact.id ?? ''),
      factId: String(fact.id ?? ''),
      resident: String(fact.resident ?? ''),
      level: fact.attendanceStatus === 'MISSED' ? 'ALERT_RED' : 'ALERT_WARNING',
      title:
        fact.attendanceStatus === 'MISSED'
          ? '未在规定时间打卡'
          : '打卡异常(位置/人脸不匹配)',
      content: '',
      createTime: String(fact.checkIn ?? ''),
      attendanceStatus: fact.attendanceStatus,
      status: 'pending',
    }));
    return { data: items as any[], page: env.page, raw: env.raw };
  },
} as any;

const AlertList: React.FC = observer(() => {
  const navigate = useNavigate();
  const [filters, setFilters] = useState<SearchValues>({});
  const [searchForm] = Form.useForm<SearchValues>();
  const [stats, setStats] = useState({ total: 0, pending: 0, processing: 0, resolved: 0, critical: 0 });

  useEffect(() => {
    if (alertStore.alerts.length === 0) {
      alertStore.fetchAlerts({ pageSize: 100 });
    }
  }, []);

  // 统计仍由 alertStore 提供(顶部 Statistic)
  useEffect(() => {
    const list = alertStore.alerts;
    setStats({
      total: list.length,
      pending: list.filter((a) => a.status === 'pending').length,
      processing: list.filter((a) => a.status === 'processing').length,
      resolved: list.filter((a) => a.status === 'resolved').length,
      critical: list.filter((a) => a.level === 'ALERT_RED').length,
    });
  }, [alertStore.alerts]);

  const buildQuery = useMemo(
    () => () => {
      // 这里返回一个占位 spec,真实 query 在 alertEntityAdapter 内部构造
      const builder = qb(OT.AttendanceFact);
      if (filters.dateRange?.[0] && filters.dateRange?.[1]) {
        builder.between(
          'checkIn',
          filters.dateRange[0].toISOString(),
          filters.dateRange[1].toISOString(),
        );
      }
      return builder.build();
    },
    [filters],
  );

  const columns: ColumnsType<AlertItem> = [
    {
      title: '居民',
      dataIndex: 'resident',
      width: 120,
      render: (id: string) => (id ? <ResidentLink id={id}>{id}</ResidentLink> : '-'),
    },
    {
      title: '类型',
      dataIndex: 'title',
      width: 200,
      render: (t: string) => <Tag>{t}</Tag>,
    },
    {
      title: '级别',
      dataIndex: 'level',
      width: 90,
      render: (level: AlertLevel) => (
        <Tag color={StatusColors.AlertLevel[level]}>
          {EnumLabels.AlertLevel[level] ?? level}
        </Tag>
      ),
    },
    {
      title: '触发时间',
      dataIndex: 'createTime',
      width: 170,
      render: (t: string) => (t ? new Date(t).toLocaleString() : '-'),
    },
  ];

  return (
    <MasterDetailListPage<AlertItem>
      title={
        <Space>
          <AlertOutlined /> 预警列表
        </Space>
      }
      service={alertEntityAdapter}
      buildQuery={buildQuery}
      columns={columns}
      storageKey="monitor-alert-list"
      rowContextMenuItems={(record) => [
        record.resident && {
          key: 'goto-resident',
          label: '查看居民全貌',
          onClick: () => window.open(`/residents/${record.resident}`, '_blank'),
        },
        {
          key: 'detail',
          label: '查看打卡详情',
          onClick: () => navigate(`/monitor/alert/detail/${record.id}`),
        },
        record.status !== 'resolved' && {
          key: 'resolve',
          label: '标记已处置',
          onClick: () => {
            alertStore.updateAlert(record.id, { status: 'resolved' });
            message.success('已处置');
          },
        },
      ]}
      topStats={
        <Row gutter={16}>
          <Col xs={12} md={4}>
            <Card size="small">
              <Statistic
                title="预警总数"
                value={stats.total}
                prefix={<AlertOutlined style={{ color: '#1890ff' }} />}
              />
            </Card>
          </Col>
          <Col xs={12} md={4}>
            <Card size="small">
              <Statistic
                title="待处理"
                value={stats.pending}
                valueStyle={{ color: '#faad14' }}
                prefix={<ClockCircleOutlined />}
              />
            </Card>
          </Col>
          <Col xs={12} md={4}>
            <Card size="small">
              <Statistic
                title="处理中"
                value={stats.processing}
                valueStyle={{ color: '#1890ff' }}
                prefix={<ExclamationCircleOutlined />}
              />
            </Card>
          </Col>
          <Col xs={12} md={4}>
            <Card size="small">
              <Statistic
                title="已解决"
                value={stats.resolved}
                valueStyle={{ color: '#52c41a' }}
                prefix={<CheckCircleOutlined />}
              />
            </Card>
          </Col>
          <Col xs={12} md={4}>
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
      }
      toolbar={
        <Form
          form={searchForm}
          layout="inline"
          onFinish={(v) => setFilters(v)}
        >
          <Form.Item name="level" style={{ width: 140 }}>
            <Select
              placeholder="级别"
              allowClear
              options={enumOptions(AlertLevel, EnumLabels.AlertLevel)}
            />
          </Form.Item>
          <Form.Item name="dateRange">
            <RangePicker showTime placeholder={['开始时间', '结束时间']} />
          </Form.Item>
          <Form.Item>
            <Space>
              <Button type="primary" htmlType="submit" icon={<SearchOutlined />}>
                查询
              </Button>
              <Button
                icon={<ReloadOutlined />}
                onClick={() => {
                  searchForm.resetFields();
                  setFilters({});
                }}
              >
                重置
              </Button>
              <Tooltip title="导出请前往「报表导出」">
                <Button icon={<ExportOutlined />} disabled>
                  导出
                </Button>
              </Tooltip>
            </Space>
          </Form.Item>
        </Form>
      }
      renderDetailHeader={(record) => (
        <Space size={16} align="center">
          <span style={{ fontSize: 16, fontWeight: 600 }}>
            预警 #{record.id.slice(-6)}
          </span>
          <Tag color={StatusColors.AlertLevel[record.level]}>
            {EnumLabels.AlertLevel[record.level]}
          </Tag>
          <ResidentLink id={record.resident}>
            <Button type="link" size="small">
              查看居民全貌 →
            </Button>
          </ResidentLink>
        </Space>
      )}
      renderDetail={(record) => (
        <Descriptions bordered column={1} size="middle">
          <Descriptions.Item label="居民">
            <ResidentLink id={record.resident} />
          </Descriptions.Item>
          <Descriptions.Item label="预警类型">{record.title}</Descriptions.Item>
          <Descriptions.Item label="级别">
            <Tag color={StatusColors.AlertLevel[record.level]}>
              {EnumLabels.AlertLevel[record.level]}
            </Tag>
          </Descriptions.Item>
          <Descriptions.Item label="触发时间">
            {record.createTime ? new Date(record.createTime).toLocaleString() : '-'}
          </Descriptions.Item>
          <Descriptions.Item label="原始考勤状态">
            {EnumLabels.AttendanceStatus[record.attendanceStatus] ?? record.attendanceStatus}
          </Descriptions.Item>
          <Descriptions.Item label="处理状态">
            {{ pending: '待处理', processing: '处理中', resolved: '已解决' }[record.status]}
          </Descriptions.Item>
        </Descriptions>
      )}
      renderDetailActions={(record) => (
        <>
          <Button
            type="primary"
            onClick={() => {
              Modal.confirm({
                title: '处置预警',
                content: `将 #${record.id.slice(-6)} 标记为已处理?`,
                onOk: () => {
                  alertStore.updateAlert(record.id, { status: 'resolved' });
                  message.success('已处置');
                },
              });
            }}
          >
            标记已处置
          </Button>
          <Button onClick={() => navigate(`/monitor/alert/detail/${record.id}`)}>
            查看打卡详情
          </Button>
        </>
      )}
    />
  );
});

export default AlertList;
