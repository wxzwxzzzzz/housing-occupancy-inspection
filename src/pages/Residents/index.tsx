import React, { useMemo, useState } from 'react';
import {
  Avatar,
  Button,
  Descriptions,
  Form,
  Input,
  Select,
  Space,
  Tag,
} from 'antd';
import { SearchOutlined, UserOutlined } from '@ant-design/icons';
import { Link } from '@umijs/max';
import type { ColumnsType } from 'antd/es/table';
import { residentService } from '@/services/domains/resident';
import { qb } from '@/services/ontology/query';
import { OT } from '@/services/ontology/object-types';
import type { Resident } from '@/types/ontology/prh/entities/resident';
import {
  GuaranteeType,
  ResidentStatus,
} from '@/types/ontology/prh/enums';
import { EnumLabels, StatusColors, enumOptions } from '@/utils/enum-options';
import MasterDetailListPage from '@/components/MasterDetailListPage';

interface SearchValues {
  keyword?: string;
  status?: string;
  guaranteeType?: string;
}

function maskIdCard(idCard?: string): string {
  if (!idCard || idCard.length < 11) return idCard ?? '-';
  return `${idCard.slice(0, 4)}***${idCard.slice(-4)}`;
}

const ResidentsPage: React.FC = () => {
  const [searchForm] = Form.useForm<SearchValues>();
  const [filters, setFilters] = useState<SearchValues>({});

  const buildQuery = useMemo(
    () => () => {
      const builder = qb(OT.Resident).orderBy('createAt', 'DESC');
      if (filters.keyword) builder.like('fullName', filters.keyword);
      if (filters.status) builder.eq('status', filters.status);
      if (filters.guaranteeType) builder.eq('guaranteeType', filters.guaranteeType);
      return builder.build();
    },
    [filters],
  );

  const columns: ColumnsType<Resident> = [
    {
      title: '姓名',
      dataIndex: 'fullName',
      width: 110,
      render: (text: string, record: any) => (
        <Space>
          <Avatar size="small" icon={<UserOutlined />}>
            {text?.[0]}
          </Avatar>
          <Link to={`/residents/${record.id}`}>{text}</Link>
        </Space>
      ),
    },
    {
      title: '证件号',
      dataIndex: 'idCardNo',
      width: 160,
      render: (v: string) => maskIdCard(v),
    },
    {
      title: '状态',
      dataIndex: 'status',
      width: 100,
      render: (v: any) => (
        <Tag color={(StatusColors.ResidentStatus as any)[v]}>
          {EnumLabels.ResidentStatus[v as keyof typeof EnumLabels.ResidentStatus] ?? v}
        </Tag>
      ),
    },
  ];

  return (
    <MasterDetailListPage<Resident>
      title="居民档案"
      service={residentService as any}
      buildQuery={buildQuery}
      columns={columns}
      storageKey="residents"
      rowContextMenuItems={(record) => [
        {
          key: 'goto-360',
          label: '查看 360 视图',
          onClick: () => window.open(`/residents/${(record as any).id}`, '_blank'),
        },
        {
          key: 'copy-id',
          label: '复制证件号',
          onClick: () => {
            const idCard = (record as any).idCardNo;
            if (idCard) {
              navigator.clipboard.writeText(idCard);
            }
          },
        },
        (record as any).phone && {
          key: 'copy-phone',
          label: '复制手机号',
          onClick: () => navigator.clipboard.writeText((record as any).phone),
        },
      ]}
      toolbar={
        <Form
          form={searchForm}
          layout="inline"
          onFinish={(v) => setFilters(v)}
        >
          <Form.Item name="keyword">
            <Input
              placeholder="姓名"
              prefix={<SearchOutlined />}
              style={{ width: 160 }}
              allowClear
            />
          </Form.Item>
          <Form.Item name="status">
            <Select
              placeholder="状态"
              style={{ width: 130 }}
              allowClear
              options={enumOptions(ResidentStatus, EnumLabels.ResidentStatus)}
            />
          </Form.Item>
          <Form.Item name="guaranteeType">
            <Select
              placeholder="保障类型"
              style={{ width: 150 }}
              allowClear
              options={enumOptions(GuaranteeType, EnumLabels.GuaranteeType)}
            />
          </Form.Item>
          <Form.Item>
            <Button type="primary" htmlType="submit" icon={<SearchOutlined />}>
              查询
            </Button>
          </Form.Item>
        </Form>
      }
      renderDetailHeader={(record) => (
        <Space size={16} align="center">
          <Avatar size={40} icon={<UserOutlined />} src={(record as any).facePhoto}>
            {record.fullName?.[0]}
          </Avatar>
          <div>
            <div style={{ fontSize: 16, fontWeight: 600 }}>{record.fullName}</div>
            <div style={{ color: '#8c8c8c', fontSize: 12 }}>
              {maskIdCard((record as any).idCardNo)}
            </div>
          </div>
          <Link to={`/residents/${record.id}`}>
            <Button type="primary" size="small">
              查看 360 视图 →
            </Button>
          </Link>
        </Space>
      )}
      renderDetail={(record) => (
        <Descriptions bordered column={2} size="middle">
          <Descriptions.Item label="姓名">{record.fullName}</Descriptions.Item>
          <Descriptions.Item label="性别">
            {EnumLabels.Gender[record.gender as keyof typeof EnumLabels.Gender] ?? '-'}
          </Descriptions.Item>
          <Descriptions.Item label="证件号">
            {maskIdCard((record as any).idCardNo)}
          </Descriptions.Item>
          <Descriptions.Item label="出生日期">
            {(record as any).birthDate ?? '-'}
          </Descriptions.Item>
          <Descriptions.Item label="婚姻状况">
            {EnumLabels.MaritalStatus[
              record.maritalStatus as keyof typeof EnumLabels.MaritalStatus
            ] ?? '-'}
          </Descriptions.Item>
          <Descriptions.Item label="状态">
            <Tag color={(StatusColors.ResidentStatus as any)[record.status]}>
              {EnumLabels.ResidentStatus[
                record.status as keyof typeof EnumLabels.ResidentStatus
              ] ?? record.status}
            </Tag>
          </Descriptions.Item>
          <Descriptions.Item label="保障类型">
            {EnumLabels.GuaranteeType[
              record.guaranteeType as keyof typeof EnumLabels.GuaranteeType
            ] ?? '-'}
          </Descriptions.Item>
          <Descriptions.Item label="联系电话">{(record as any).phone ?? '-'}</Descriptions.Item>
          <Descriptions.Item label="邮箱" span={2}>
            {(record as any).email ?? '-'}
          </Descriptions.Item>
        </Descriptions>
      )}
    />
  );
};

export default ResidentsPage;
