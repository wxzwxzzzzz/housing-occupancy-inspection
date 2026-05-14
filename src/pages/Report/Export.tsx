import React, { useState } from 'react';
import { Button, Card, DatePicker, Form, message, Select, Space } from 'antd';
import { DownloadOutlined } from '@ant-design/icons';
import { invokeQuery } from '@/services/ontology/client';
import { qb } from '@/services/ontology/query';
import { OT } from '@/services/ontology/object-types';

const FACT_OPTIONS = [
  { label: '考勤事实', value: OT.AttendanceFact },
  { label: '请假事实', value: OT.LeaveFact },
  { label: '备案事实', value: OT.MigrantWorkFact },
  { label: '资格申请事实', value: OT.EligibilityApplicationFact },
  { label: '资格终止事实', value: OT.EligibilityTerminationFact },
  { label: '房屋分配事实', value: OT.HousingAllocationFact },
  { label: '租赁补贴事实', value: OT.RentalSubsidyFact },
  { label: '收入事实', value: OT.PersonalIncomeFact },
  { label: '居民快照', value: OT.ResidentSnapshotFact },
  { label: '家庭快照', value: OT.HouseholdSnapshotFact },
];

const { RangePicker } = DatePicker;

function toCSV(rows: any[]): string {
  if (rows.length === 0) return '';
  const keys = Array.from(
    new Set(rows.flatMap((r) => Object.keys(r))),
  ).filter((k) => !['pubts'].includes(k));
  const escapeCell = (v: any) => {
    if (v === null || v === undefined) return '';
    const s = typeof v === 'object' ? JSON.stringify(v) : String(v);
    return `"${s.replace(/"/g, '""')}"`;
  };
  const head = keys.join(',');
  const body = rows.map((r) => keys.map((k) => escapeCell(r[k])).join(',')).join('\n');
  return `${head}\n${body}`;
}

function downloadCSV(filename: string, csv: string) {
  const blob = new Blob([`﻿${csv}`], { type: 'text/csv;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  link.click();
  URL.revokeObjectURL(url);
}

const ReportExport: React.FC = () => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);

  const handleExport = async () => {
    const values = await form.validateFields();
    setLoading(true);
    try {
      const builder = qb(values.objectType).page(1, 5000);
      if (values.range?.[0] && values.range?.[1]) {
        const dateField =
          values.objectType === OT.AttendanceFact ? 'checkIn' : 'createAt';
        builder.between(
          dateField,
          values.range[0].toISOString(),
          values.range[1].toISOString(),
        );
      }
      const env = await invokeQuery<any>(values.objectType, builder.build());
      const csv = toCSV(env.data);
      const fileName = `${values.objectType.split('.').pop()}-${Date.now()}.csv`;
      downloadCSV(fileName, csv);
      message.success(`已导出 ${env.data.length} 条记录`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ padding: 24 }}>
      <Card title="报表导出">
        <Form
          form={form}
          layout="vertical"
          style={{ maxWidth: 520 }}
          initialValues={{ objectType: OT.AttendanceFact }}
        >
          <Form.Item
            name="objectType"
            label="选择事实表"
            rules={[{ required: true, message: '请选择事实表' }]}
          >
            <Select options={FACT_OPTIONS} />
          </Form.Item>
          <Form.Item name="range" label="时间范围(可选)">
            <RangePicker showTime style={{ width: '100%' }} />
          </Form.Item>
          <Space>
            <Button
              type="primary"
              icon={<DownloadOutlined />}
              loading={loading}
              onClick={handleExport}
            >
              导出 CSV
            </Button>
            <span style={{ color: '#999' }}>注:CSV 已带 UTF-8 BOM,Excel 可直接打开</span>
          </Space>
        </Form>
      </Card>
    </div>
  );
};

export default ReportExport;
