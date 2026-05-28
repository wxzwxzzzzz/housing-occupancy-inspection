/**
 * 监测打卡 — Attendance
 *
 * 管理员可代录(MANUAL 方式)或为待打卡记录标记豁免。
 */

import { PlusOutlined, ReloadOutlined } from '@ant-design/icons';
import { useNavigate } from '@umijs/max';
import {
  Card,
  Col,
  DatePicker,
  Form,
  Input,
  Modal,
  message,
  Row,
  Select,
  Statistic,
  Tag,
} from 'antd';
import type { ColumnsType } from 'antd/es/table';
import dayjs from 'dayjs';
import React, { useCallback, useEffect, useState } from 'react';
import EntityReferSelect from '@/components/EntityReferSelect';
import {
  type FilterConfig,
  OmnibarListPage,
  type ToolbarAction,
} from '@/components/OmnibarPage';
import ResidentLink from '@/components/ResidentLink';
import { attendanceService } from '@/services/domains/attendance';
import { invokeQuery } from '@/services/ontology/client';
import { OT } from '@/services/ontology/object-types';
import { qb } from '@/services/ontology/query';
import { dictLabel, dictStore } from '@/stores/dictStore';
import type { Attendance } from '@/types/ontology/prh/entities/attendance';
import { StatusColors } from '@/utils/enum-options';

const MonitorAttendance: React.FC = () => {
  const navigate = useNavigate();
  const [filterValues, setFilterValues] = useState<Record<string, any>>({});
  const [data, setData] = useState<Attendance[]>([]);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(20);
  const [total, setTotal] = useState(0);
  const [selectedKeys, setSelectedKeys] = useState<React.Key[]>([]);
  const [stats, setStats] = useState({
    valid: 0,
    invalid: 0,
    missed: 0,
    pending: 0,
  });
  const [checkinOpen, setCheckinOpen] = useState(false);
  const [checkinForm] = Form.useForm();
  const [checkinSubmitting, setCheckinSubmitting] = useState(false);

  const loadStats = async () => {
    const counts = await Promise.all(
      ['VALID', 'INVALID', 'MISSED', 'PENDING'].map((s) =>
        invokeQuery(
          OT.Attendance,
          qb(OT.Attendance).eq('status', s).page(1, 1).build(),
        ),
      ),
    );
    setStats({
      valid: counts[0].page?.total ?? 0,
      invalid: counts[1].page?.total ?? 0,
      missed: counts[2].page?.total ?? 0,
      pending: counts[3].page?.total ?? 0,
    });
  };

  const load = useCallback(
    async (p = page, s = pageSize, override?: Record<string, any>) => {
      setLoading(true);
      try {
        const v = override ?? filterValues;
        const builder = qb(OT.Attendance).orderBy('checkIn', 'DESC').page(p, s);
        if (v.status) builder.eq('status', v.status);
        if (v.attendanceType) builder.eq('attendanceType', v.attendanceType);
        if (v.mode) builder.eq('mode', v.mode);
        if (v.resident) builder.eq('resident', v.resident);
        if (v.range?.[0] && v.range?.[1]) {
          builder.between(
            'checkIn',
            v.range[0].toISOString(),
            v.range[1].toISOString(),
          );
        }
        const env = await attendanceService.list(builder.build() as any);
        setData(env.data);
        setTotal(env.page?.total ?? env.data.length);
      } finally {
        setLoading(false);
      }
    },
    [filterValues, page, pageSize],
  );

  useEffect(() => {
    loadStats();
    load(1, pageSize);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const filters: FilterConfig[] = [
    {
      key: 'resident',
      label: '居民',
      type: 'custom',
      render: (val, onChange) => (
        <EntityReferSelect
          objectType={OT.Resident}
          labelField="fullName"
          value={val}
          onChange={onChange}
          placeholder="按姓名搜索"
        />
      ),
    },
    {
      key: 'status',
      label: '状态',
      type: 'select',
      options: dictStore.options('AttendanceStatus'),
    },
    {
      key: 'attendanceType',
      label: '出勤类型',
      type: 'select',
      options: dictStore.options('AttendanceType'),
    },
    {
      key: 'mode',
      label: '打卡方式',
      type: 'select',
      options: dictStore.options('AttendanceMode'),
    },
    { key: 'range', label: '时间范围', type: 'dateRange' },
  ];

  const handleManualCheckin = async () => {
    try {
      const values = await checkinForm.validateFields();
      setCheckinSubmitting(true);
      await attendanceService.checkin({
        resident: values.resident,
        attendanceType: values.attendanceType,
      });
      message.success('代录打卡成功');
      checkinForm.resetFields();
      setCheckinOpen(false);
      load();
      loadStats();
    } catch (err: any) {
      if (err?.errorFields) return;
      message.error(err?.message ?? '代录失败');
    } finally {
      setCheckinSubmitting(false);
    }
  };

  const toolbarActions: ToolbarAction[] = [
    {
      key: 'manual-checkin',
      type: 'primary',
      icon: <PlusOutlined />,
      label: '管理员代录',
      onClick: () => setCheckinOpen(true),
    },
    {
      key: 'refresh',
      type: 'icon',
      icon: <ReloadOutlined />,
      title: '刷新',
      onClick: () => {
        load();
        loadStats();
      },
    },
  ];

  const columns: ColumnsType<Attendance> = [
    {
      title: '居民',
      dataIndex: 'resident',
      width: 140,
      render: (id: any) =>
        id ? <ResidentLink id={String(id)}>{String(id)}</ResidentLink> : '-',
    },
    {
      title: '类型',
      dataIndex: 'attendanceType',
      width: 100,
      render: (v: any) => dictLabel('AttendanceType', v),
    },
    {
      title: '打卡方式',
      dataIndex: 'mode',
      width: 100,
      render: (v: any) => dictLabel('AttendanceMode', v),
    },
    {
      title: '状态',
      dataIndex: 'status',
      width: 100,
      render: (v: any) => (
        <Tag color={(StatusColors.AttendanceStatus as any)[v]}>
          {dictLabel('AttendanceStatus', v)}
        </Tag>
      ),
    },
    {
      title: '打卡时间',
      dataIndex: 'checkIn',
      width: 180,
      render: (v: string) => (v ? new Date(v).toLocaleString() : '-'),
    },
    {
      title: '操作',
      key: 'action',
      width: 200,
      render: (_: any, record: any) => (
        <span className="opp-row-actions">
          <span
            className="opp-row-action"
            onClick={(e) => {
              e.stopPropagation();
              navigate(`/monitor/attendance/detail/${record.id}`);
            }}
          >
            查看
          </span>
          {record.status === 'PENDING' && (
            <span
              className="opp-row-action"
              onClick={async (e) => {
                e.stopPropagation();
                await attendanceService.modify({
                  ...record,
                  status: 'EXEMPTED',
                } as any);
                message.success('已标记豁免');
                load();
                loadStats();
              }}
            >
              标记豁免
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
            title="有效打卡"
            value={stats.valid}
            valueStyle={{ color: '#52c41a' }}
          />
        </Card>
      </Col>
      <Col xs={12} sm={6}>
        <Card size="small">
          <Statistic
            title="无效打卡"
            value={stats.invalid}
            valueStyle={{ color: '#ff4d4f' }}
          />
        </Card>
      </Col>
      <Col xs={12} sm={6}>
        <Card size="small">
          <Statistic
            title="缺勤"
            value={stats.missed}
            valueStyle={{ color: '#faad14' }}
          />
        </Card>
      </Col>
      <Col xs={12} sm={6}>
        <Card size="small">
          <Statistic title="待打卡" value={stats.pending} />
        </Card>
      </Col>
    </Row>
  );

  return (
    <div style={{ height: '100%' }}>
      <OmnibarListPage<Attendance>
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
        onRowClick={(record) =>
          navigate(`/monitor/attendance/detail/${(record as any).id}`)
        }
        total={total}
        page={page}
        pageSize={pageSize}
        onPageChange={(p, s) => {
          setPage(p);
          setPageSize(s);
          load(p, s);
        }}
      />

      <Modal
        title="管理员代录打卡"
        open={checkinOpen}
        onCancel={() => {
          checkinForm.resetFields();
          setCheckinOpen(false);
        }}
        onOk={handleManualCheckin}
        confirmLoading={checkinSubmitting}
        okText="提交"
        cancelText="取消"
        width={520}
        destroyOnClose
        styles={{ footer: { textAlign: 'right' } }}
      >
        <Form
          form={checkinForm}
          layout="vertical"
          preserve={false}
          initialValues={{ checkInAt: dayjs() }}
        >
          <Form.Item
            label="代录居民"
            name="resident"
            rules={[{ required: true, message: '请选择居民' }]}
          >
            <EntityReferSelect
              objectType={OT.Resident}
              labelField="fullName"
              extraFilter={(b) => b.eq('status', 'ACTIVATED')}
            />
          </Form.Item>
          <Form.Item
            label="出勤类型"
            name="attendanceType"
            rules={[{ required: true, message: '请选择出勤类型' }]}
          >
            <Select
              placeholder="请选择"
              options={dictStore.options('AttendanceType')}
            />
          </Form.Item>
          <Form.Item label="代录原因" name="reason">
            <Input.TextArea rows={3} placeholder="说明代录原因(选填)" />
          </Form.Item>
          <div style={{ color: '#888', fontSize: 12 }}>
            代录方式默认为 MANUAL,后端会以系统时间作为打卡时间。
          </div>
        </Form>
      </Modal>
    </div>
  );
};

export default MonitorAttendance;
