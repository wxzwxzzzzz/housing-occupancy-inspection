import React, { useEffect, useMemo, useState, useCallback } from 'react';
import {
  Card,
  Col,
  message,
  Modal,
  Row,
  Statistic,
  Tag,
} from 'antd';
import {
  AlertOutlined,
  CheckCircleOutlined,
  ClockCircleOutlined,
  ExclamationCircleOutlined,
  ReloadOutlined,
} from '@ant-design/icons';
import { observer } from 'mobx-react-lite';
import { useNavigate } from '@umijs/max';
import type { ColumnsType } from 'antd/es/table';
import { alertStore } from '@/stores';
import type { AlertItem } from '@/services/domains/alert';
import { EnumLabels, StatusColors, enumOptions } from '@/utils/enum-options';
import { AlertLevel } from '@/types/ontology/prh/enums';
import ResidentLink from '@/components/ResidentLink';
import { invokeQuery } from '@/services/ontology/client';
import { qb } from '@/services/ontology/query';
import { OT } from '@/services/ontology/object-types';
import {
  OmnibarListPage,
  type FilterConfig,
  type ToolbarAction,
} from '@/components/OmnibarPage';

const AlertList: React.FC = observer(() => {
  const navigate = useNavigate();
  const [filterValues, setFilterValues] = useState<Record<string, any>>({});
  const [data, setData] = useState<AlertItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(20);
  const [total, setTotal] = useState(0);
  const [selectedKeys, setSelectedKeys] = useState<React.Key[]>([]);

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

  const load = useCallback(
    async (p = page, s = pageSize, override?: Record<string, any>) => {
      setLoading(true);
      try {
        const v = override ?? filterValues;
        const builder = qb(OT.AttendanceFact)
          .in('attendanceStatus', ['INVALID', 'MISSED'])
          .orderBy('checkIn', 'DESC')
          .page(p, s);
        if (v.dateRange?.[0] && v.dateRange?.[1]) {
          builder.between(
            'checkIn',
            v.dateRange[0].toISOString(),
            v.dateRange[1].toISOString(),
          );
        }
        const env = await invokeQuery<any>(OT.AttendanceFact, builder.build());
        const items: AlertItem[] = env.data
          .map((fact: any) => ({
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
            status: 'pending' as const,
          }))
          .filter((item: AlertItem) => {
            if (v.level && item.level !== v.level) return false;
            if (v.keyword) {
              const kw = String(v.keyword).toLowerCase();
              if (
                !String(item.resident ?? '').toLowerCase().includes(kw) &&
                !String(item.title ?? '').toLowerCase().includes(kw)
              )
                return false;
            }
            return true;
          });
        setData(items);
        setTotal(env.page?.total ?? items.length);
      } finally {
        setLoading(false);
      }
    },
    [filterValues, page, pageSize],
  );

  useEffect(() => {
    if (alertStore.alerts.length === 0) {
      alertStore.fetchAlerts({ pageSize: 100 });
    }
    load(1, pageSize);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const filters: FilterConfig[] = [
    { key: 'keyword', label: '关键字', type: 'input', placeholder: '居民 / 类型' },
    {
      key: 'level',
      label: '级别',
      type: 'quick',
      options: [
        { value: '', label: '全部' },
        ...enumOptions(AlertLevel, EnumLabels.AlertLevel),
      ],
    },
    { key: 'dateRange', label: '触发时间', type: 'dateRange' },
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

  const columns: ColumnsType<AlertItem> = [
    {
      title: '居民',
      dataIndex: 'resident',
      width: 140,
      render: (id: string) => (id ? <ResidentLink id={id}>{id}</ResidentLink> : '-'),
    },
    {
      title: '类型',
      dataIndex: 'title',
      width: 240,
      render: (t: string) => <Tag>{t}</Tag>,
    },
    {
      title: '级别',
      dataIndex: 'level',
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
      width: 180,
      render: (t: string) => (t ? new Date(t).toLocaleString() : '-'),
    },
    {
      title: '操作',
      key: 'action',
      width: 220,
      render: (_: any, record: AlertItem) => (
        <span className="opp-row-actions">
          <span
            className="opp-row-action"
            onClick={(e) => {
              e.stopPropagation();
              navigate(`/monitor/alert/detail/${record.id}`);
            }}
          >
            查看
          </span>
          {record.status !== 'resolved' && (
            <span
              className="opp-row-action"
              onClick={(e) => {
                e.stopPropagation();
                Modal.confirm({
                  title: '处置预警',
                  content: `将 #${record.id.slice(-6)} 标记为已处理?`,
                  onOk: () => {
                    alertStore.updateAlert(record.id, { status: 'resolved' });
                    message.success('已处置');
                    load();
                  },
                });
              }}
            >
              处置
            </span>
          )}
          {record.resident && (
            <span
              className="opp-row-action"
              onClick={(e) => {
                e.stopPropagation();
                window.open(`/residents/${record.resident}`, '_blank');
              }}
            >
              居民
            </span>
          )}
        </span>
      ),
    },
  ];

  const topSlot = (
    <Row gutter={12}>
      <Col xs={12} md={4} lg={5}>
        <Card size="small">
          <Statistic
            title="预警总数"
            value={stats.total}
            prefix={<AlertOutlined style={{ color: '#1890ff' }} />}
          />
        </Card>
      </Col>
      <Col xs={12} md={4} lg={5}>
        <Card size="small">
          <Statistic
            title="待处理"
            value={stats.pending}
            valueStyle={{ color: '#faad14' }}
            prefix={<ClockCircleOutlined />}
          />
        </Card>
      </Col>
      <Col xs={12} md={4} lg={5}>
        <Card size="small">
          <Statistic
            title="处理中"
            value={stats.processing}
            valueStyle={{ color: '#1890ff' }}
            prefix={<ExclamationCircleOutlined />}
          />
        </Card>
      </Col>
      <Col xs={12} md={4} lg={5}>
        <Card size="small">
          <Statistic
            title="已解决"
            value={stats.resolved}
            valueStyle={{ color: '#52c41a' }}
            prefix={<CheckCircleOutlined />}
          />
        </Card>
      </Col>
      <Col xs={12} md={4} lg={4}>
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
  );

  return (
    <div style={{ height: '100%' }}>
      <OmnibarListPage<AlertItem>
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
        onRowClick={(record) => navigate(`/monitor/alert/detail/${record.id}`)}
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
});

export default AlertList;
