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
  Row,
  Select,
  Space,
  Statistic,
  Tag,
} from 'antd';
import { ReloadOutlined, SearchOutlined } from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
import { attendanceService } from '@/services/domains/attendance';
import { qb } from '@/services/ontology/query';
import { OT } from '@/services/ontology/object-types';
import { invokeQuery } from '@/services/ontology/client';
import {
  AttendanceMode,
  AttendanceStatus,
  AttendanceType,
} from '@/types/ontology/prh/enums';
import type { Attendance } from '@/types/ontology/prh/entities/attendance';
import { EnumLabels, StatusColors, enumOptions } from '@/utils/enum-options';
import MasterDetailListPage from '@/components/MasterDetailListPage';
import ResidentLink from '@/components/ResidentLink';

const { RangePicker } = DatePicker;

interface SearchValues {
  resident?: string;
  status?: string;
  attendanceType?: string;
  mode?: string;
  range?: [any, any];
}

const MonitorAttendance: React.FC = () => {
  const [searchForm] = Form.useForm<SearchValues>();
  const [filters, setFilters] = useState<SearchValues>({});
  const [stats, setStats] = useState({ valid: 0, invalid: 0, missed: 0, pending: 0 });

  // 顶部各状态统计
  const loadStats = async () => {
    const counts = await Promise.all(
      ['VALID', 'INVALID', 'MISSED', 'PENDING'].map((s) =>
        invokeQuery(OT.Attendance, qb(OT.Attendance).eq('status', s).page(1, 1).build()),
      ),
    );
    setStats({
      valid: counts[0].page?.total ?? 0,
      invalid: counts[1].page?.total ?? 0,
      missed: counts[2].page?.total ?? 0,
      pending: counts[3].page?.total ?? 0,
    });
  };

  useEffect(() => {
    loadStats();
  }, []);

  const buildQuery = useMemo(
    () => () => {
      const builder = qb(OT.Attendance).orderBy('checkIn', 'DESC');
      if (filters.status) builder.eq('status', filters.status);
      if (filters.attendanceType) builder.eq('attendanceType', filters.attendanceType);
      if (filters.mode) builder.eq('mode', filters.mode);
      if (filters.resident) builder.like('resident', filters.resident);
      if (filters.range?.[0] && filters.range?.[1]) {
        builder.between(
          'checkIn',
          filters.range[0].toISOString(),
          filters.range[1].toISOString(),
        );
      }
      return builder.build();
    },
    [filters],
  );

  const columns: ColumnsType<Attendance> = [
    {
      title: '居民',
      dataIndex: 'resident',
      width: 120,
      render: (id: string) => (id ? <ResidentLink id={id}>{id}</ResidentLink> : '-'),
    },
    {
      title: '类型',
      dataIndex: 'attendanceType',
      width: 90,
      render: (v: any) =>
        EnumLabels.AttendanceType[v as keyof typeof EnumLabels.AttendanceType] ?? v,
    },
    {
      title: '状态',
      dataIndex: 'status',
      width: 90,
      render: (v: any) => (
        <Tag color={(StatusColors.AttendanceStatus as any)[v]}>
          {EnumLabels.AttendanceStatus[v as keyof typeof EnumLabels.AttendanceStatus] ?? v}
        </Tag>
      ),
    },
    {
      title: '打卡时间',
      dataIndex: 'checkIn',
      width: 170,
      render: (v: string) => (v ? new Date(v).toLocaleString() : '-'),
    },
  ];

  return (
    <MasterDetailListPage<Attendance>
      title="打卡核验记录"
      service={attendanceService as any}
      buildQuery={buildQuery}
      columns={columns}
      storageKey="monitor-attendance"
      rowContextMenuItems={(record, ctx) => [
        record.resident && {
          key: 'goto-resident',
          label: '查看居民全貌',
          onClick: () => window.open(`/residents/${record.resident}`, '_blank'),
        },
        record.status === 'PENDING' && {
          key: 'exempt',
          label: '标记豁免',
          onClick: async () => {
            await attendanceService.modify({ ...record, status: 'EXEMPTED' } as any);
            message.success('已标记豁免');
            ctx.reload();
            loadStats();
          },
        },
      ]}
      topStats={
        <Row gutter={16}>
          <Col xs={12} sm={6}>
            <Card size="small">
              <Statistic title="有效打卡" value={stats.valid} valueStyle={{ color: '#52c41a' }} />
            </Card>
          </Col>
          <Col xs={12} sm={6}>
            <Card size="small">
              <Statistic title="无效打卡" value={stats.invalid} valueStyle={{ color: '#ff4d4f' }} />
            </Card>
          </Col>
          <Col xs={12} sm={6}>
            <Card size="small">
              <Statistic title="缺勤" value={stats.missed} valueStyle={{ color: '#faad14' }} />
            </Card>
          </Col>
          <Col xs={12} sm={6}>
            <Card size="small">
              <Statistic title="待打卡" value={stats.pending} />
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
          <Form.Item name="resident">
            <Input placeholder="居民 ID" allowClear style={{ width: 160 }} />
          </Form.Item>
          <Form.Item name="status">
            <Select
              allowClear
              placeholder="状态"
              style={{ width: 130 }}
              options={enumOptions(AttendanceStatus, EnumLabels.AttendanceStatus)}
            />
          </Form.Item>
          <Form.Item name="attendanceType">
            <Select
              allowClear
              placeholder="出勤类型"
              style={{ width: 130 }}
              options={enumOptions(AttendanceType, EnumLabels.AttendanceType)}
            />
          </Form.Item>
          <Form.Item name="mode">
            <Select
              allowClear
              placeholder="方式"
              style={{ width: 130 }}
              options={enumOptions(AttendanceMode, EnumLabels.AttendanceMode)}
            />
          </Form.Item>
          <Form.Item name="range">
            <RangePicker showTime />
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
            </Space>
          </Form.Item>
        </Form>
      }
      renderDetailHeader={(record) => (
        <Space size={16} align="center">
          <span style={{ fontSize: 16, fontWeight: 600 }}>
            打卡 #{String(record.id).slice(-6)}
          </span>
          <Tag color={(StatusColors.AttendanceStatus as any)[record.status]}>
            {EnumLabels.AttendanceStatus[record.status as keyof typeof EnumLabels.AttendanceStatus]}
          </Tag>
          {record.resident && (
            <ResidentLink id={String(record.resident)}>
              <Button type="link" size="small">
                查看居民全貌 →
              </Button>
            </ResidentLink>
          )}
        </Space>
      )}
      renderDetail={(record) => (
        <Descriptions bordered column={1} size="middle">
          <Descriptions.Item label="居民">
            {record.resident ? <ResidentLink id={String(record.resident)} /> : '-'}
          </Descriptions.Item>
          <Descriptions.Item label="出勤类型">
            {EnumLabels.AttendanceType[record.attendanceType as keyof typeof EnumLabels.AttendanceType]}
          </Descriptions.Item>
          <Descriptions.Item label="状态">
            <Tag color={(StatusColors.AttendanceStatus as any)[record.status]}>
              {EnumLabels.AttendanceStatus[record.status as keyof typeof EnumLabels.AttendanceStatus]}
            </Tag>
          </Descriptions.Item>
          <Descriptions.Item label="打卡方式">
            {EnumLabels.AttendanceMode[record.mode as keyof typeof EnumLabels.AttendanceMode]}
          </Descriptions.Item>
          <Descriptions.Item label="打卡时间">
            {new Date(record.checkIn).toLocaleString()}
          </Descriptions.Item>
          <Descriptions.Item label="应打卡截止">
            {new Date(record.deadline).toLocaleString()}
          </Descriptions.Item>
          <Descriptions.Item label="设备">{record.deviceId ?? '-'}</Descriptions.Item>
          <Descriptions.Item label="IP">{record.ipAddress ?? '-'}</Descriptions.Item>
          <Descriptions.Item label="定位">
            {record.location
              ? `${(record.location as any).longitude}, ${(record.location as any).latitude}`
              : '-'}
          </Descriptions.Item>
        </Descriptions>
      )}
      renderDetailActions={(record, ctx) =>
        record.status === 'PENDING' ? (
          <Button
            type="primary"
            onClick={async () => {
              await attendanceService.modify({ ...record, status: 'EXEMPTED' } as any);
              message.success('已标记为豁免');
              ctx.reload();
              loadStats();
            }}
          >
            标记豁免
          </Button>
        ) : (
          <span style={{ color: '#8c8c8c' }}>当前状态无可执行操作</span>
        )
      }
    />
  );
};

export default MonitorAttendance;
