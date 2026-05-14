import React, { useEffect, useState } from 'react';
import {
  Button,
  Card,
  Col,
  DatePicker,
  Drawer,
  Form,
  Input,
  message,
  Row,
  Select,
  Space,
  Statistic,
  Table,
  Tag,
} from 'antd';
import { ReloadOutlined, SearchOutlined } from '@ant-design/icons';
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

const { RangePicker } = DatePicker;

const MonitorAttendance: React.FC = () => {
  const [form] = Form.useForm();
  const [data, setData] = useState<Attendance[]>([]);
  const [loading, setLoading] = useState(false);
  const [pageNo, setPageNo] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [total, setTotal] = useState(0);
  const [stats, setStats] = useState({ valid: 0, invalid: 0, missed: 0, pending: 0 });
  const [drawer, setDrawer] = useState<Attendance | null>(null);

  async function load(page = pageNo, size = pageSize) {
    setLoading(true);
    try {
      const values = form.getFieldsValue();
      const builder = qb(OT.Attendance)
        .orderBy('checkIn', 'DESC')
        .page(page, size);
      if (values.status) builder.eq('status', values.status);
      if (values.attendanceType) builder.eq('attendanceType', values.attendanceType);
      if (values.mode) builder.eq('mode', values.mode);
      if (values.resident) builder.like('resident', values.resident);
      if (values.range?.[0] && values.range?.[1]) {
        builder.between(
          'checkIn',
          values.range[0].toISOString(),
          values.range[1].toISOString(),
        );
      }
      const env = await attendanceService.list(builder.build());
      setData(env.data);
      setTotal(env.page?.total ?? env.data.length);

      // 顶部统计:每个状态分别拉一次 count(用 page total)
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
      <Row gutter={16} style={{ marginBottom: 16 }}>
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

      <Card style={{ marginBottom: 16 }}>
        <Form
          form={form}
          layout="inline"
          onFinish={() => {
            setPageNo(1);
            load(1, pageSize);
          }}
        >
          <Form.Item name="resident">
            <Input placeholder="居民 ID(模糊)" allowClear style={{ width: 180 }} />
          </Form.Item>
          <Form.Item name="status">
            <Select
              allowClear
              placeholder="考勤状态"
              style={{ width: 160 }}
              options={enumOptions(AttendanceStatus, EnumLabels.AttendanceStatus)}
            />
          </Form.Item>
          <Form.Item name="attendanceType">
            <Select
              allowClear
              placeholder="出勤类型"
              style={{ width: 160 }}
              options={enumOptions(AttendanceType, EnumLabels.AttendanceType)}
            />
          </Form.Item>
          <Form.Item name="mode">
            <Select
              allowClear
              placeholder="打卡方式"
              style={{ width: 160 }}
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
                  form.resetFields();
                  load(1, pageSize);
                }}
              >
                重置
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Card>

      <Card title="打卡核验记录">
        <Table<Attendance>
          rowKey="id"
          dataSource={data}
          loading={loading}
          scroll={{ x: 1200 }}
          pagination={{
            current: pageNo,
            pageSize,
            total,
            onChange: (p, s) => {
              setPageNo(p);
              setPageSize(s);
              load(p, s);
            },
            showSizeChanger: true,
            showTotal: (t) => `共 ${t} 条`,
          }}
          columns={[
            {
              title: '居民',
              dataIndex: 'resident',
              width: 140,
            },
            {
              title: '类型',
              dataIndex: 'attendanceType',
              width: 100,
              render: (v: any) => EnumLabels.AttendanceType[v as keyof typeof EnumLabels.AttendanceType] ?? v,
            },
            {
              title: '方式',
              dataIndex: 'mode',
              width: 110,
              render: (v: any) => EnumLabels.AttendanceMode[v as keyof typeof EnumLabels.AttendanceMode] ?? v,
            },
            {
              title: '状态',
              dataIndex: 'status',
              width: 100,
              render: (v: any) => (
                <Tag color={(StatusColors.AttendanceStatus as any)[v]}>
                  {EnumLabels.AttendanceStatus[v as keyof typeof EnumLabels.AttendanceStatus] ?? v}
                </Tag>
              ),
            },
            {
              title: '打卡时间',
              dataIndex: 'checkIn',
              width: 200,
              render: (v: string) => (v ? new Date(v).toLocaleString() : '-'),
            },
            {
              title: '截止时间',
              dataIndex: 'deadline',
              width: 200,
              render: (v: string) => (v ? new Date(v).toLocaleString() : '-'),
            },
            {
              title: '设备',
              dataIndex: 'deviceId',
              width: 120,
            },
            {
              title: '操作',
              key: 'op',
              width: 140,
              fixed: 'right' as const,
              render: (_: any, record: Attendance) => (
                <Space>
                  <Button type="link" size="small" onClick={() => setDrawer(record)}>
                    详情
                  </Button>
                  {record.status === 'PENDING' && (
                    <Button
                      type="link"
                      size="small"
                      onClick={async () => {
                        await attendanceService.modify({ ...record, status: 'EXEMPTED' });
                        message.success('已标记为豁免');
                        load();
                      }}
                    >
                      豁免
                    </Button>
                  )}
                </Space>
              ),
            },
          ]}
        />
      </Card>

      <Drawer
        title={drawer ? `打卡详情 #${String(drawer.id).slice(-6)}` : ''}
        open={!!drawer}
        width={520}
        onClose={() => setDrawer(null)}
      >
        {drawer && (
          <div>
            <p><strong>居民:</strong> {String(drawer.resident)}</p>
            <p><strong>类型:</strong> {EnumLabels.AttendanceType[drawer.attendanceType as keyof typeof EnumLabels.AttendanceType]}</p>
            <p><strong>状态:</strong> {EnumLabels.AttendanceStatus[drawer.status as keyof typeof EnumLabels.AttendanceStatus]}</p>
            <p><strong>方式:</strong> {EnumLabels.AttendanceMode[drawer.mode as keyof typeof EnumLabels.AttendanceMode]}</p>
            <p><strong>打卡时间:</strong> {new Date(drawer.checkIn).toLocaleString()}</p>
            <p><strong>应打卡截止:</strong> {new Date(drawer.deadline).toLocaleString()}</p>
            <p><strong>设备:</strong> {drawer.deviceId ?? '-'}</p>
            <p><strong>IP:</strong> {drawer.ipAddress ?? '-'}</p>
            <p>
              <strong>定位:</strong>{' '}
              {drawer.location
                ? `${(drawer.location as any).longitude}, ${(drawer.location as any).latitude}`
                : '-'}
            </p>
          </div>
        )}
      </Drawer>
    </div>
  );
};

export default MonitorAttendance;
