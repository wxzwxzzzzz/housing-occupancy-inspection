import React, { useEffect, useState, useCallback } from 'react';
import { Avatar, Tag, Space, message } from 'antd';
import { UserOutlined } from '@ant-design/icons';
import { useNavigate } from '@umijs/max';
import type { ColumnsType } from 'antd/es/table';
import { residentService } from '@/services/domains/resident';
import { qb } from '@/services/ontology/query';
import { OT } from '@/services/ontology/object-types';
import type { Resident } from '@/types/ontology/prh/entities/resident';
import { GuaranteeType, ResidentStatus } from '@/types/ontology/prh/enums';
import { EnumLabels, StatusColors, enumOptions } from '@/utils/enum-options';
import {
  OmnibarListPage,
  type FilterConfig,
} from '@/components/OmnibarPage';

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
  const navigate = useNavigate();
  const [filterValues, setFilterValues] = useState<SearchValues>({});
  const [data, setData] = useState<Resident[]>([]);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(20);
  const [total, setTotal] = useState(0);
  const [selectedKeys, setSelectedKeys] = useState<React.Key[]>([]);

  const load = useCallback(
    async (p = page, s = pageSize, override?: SearchValues) => {
      setLoading(true);
      try {
        const v = override ?? filterValues;
        const builder = qb(OT.Resident).orderBy('createAt', 'DESC').page(p, s);
        if (v.keyword) builder.like('fullName', v.keyword);
        if (v.status) builder.eq('status', v.status);
        if (v.guaranteeType) builder.eq('guaranteeType', v.guaranteeType);
        const env = await residentService.list(builder.build() as any);
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

  const filters: FilterConfig[] = [
    { key: 'keyword', label: '姓名', type: 'input', placeholder: '输入姓名' },
    {
      key: 'status',
      label: '状态',
      type: 'select',
      options: enumOptions(ResidentStatus, EnumLabels.ResidentStatus),
    },
    {
      key: 'guaranteeType',
      label: '保障类型',
      type: 'select',
      options: enumOptions(GuaranteeType, EnumLabels.GuaranteeType),
    },
  ];

  const columns: ColumnsType<Resident> = [
    {
      title: '姓名',
      dataIndex: 'fullName',
      width: 180,
      render: (text: string, record: any) => (
        <Space>
          <Avatar size="small" icon={<UserOutlined />}>
            {text?.[0]}
          </Avatar>
          <span
            className="opp-link-cell"
            onClick={() => navigate(`/residents/detail/${record.id}`)}
          >
            {text}
          </span>
        </Space>
      ),
    },
    {
      title: '证件号',
      dataIndex: 'idCardNo',
      width: 180,
      render: (v: string) => maskIdCard(v),
    },
    {
      title: '保障类型',
      dataIndex: 'guaranteeType',
      width: 120,
      render: (v: any) =>
        EnumLabels.GuaranteeType[v as keyof typeof EnumLabels.GuaranteeType] ?? '-',
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
    {
      title: '操作',
      key: 'action',
      width: 200,
      render: (_: any, record: any) => (
        <span className="opp-row-actions">
          <span
            className="opp-row-action"
            onClick={() => navigate(`/residents/detail/${record.id}`)}
          >
            查看
          </span>
          <span
            className="opp-row-action"
            onClick={() => navigate(`/residents/${record.id}`)}
          >
            360 视图
          </span>
          <span
            className="opp-row-action"
            onClick={() => {
              if (record.idCardNo) {
                navigator.clipboard.writeText(record.idCardNo);
                message.success('已复制证件号');
              }
            }}
          >
            复制证件号
          </span>
        </span>
      ),
    },
  ];

  return (
    <div style={{ height: '100%' }}>
      <OmnibarListPage<Resident>
        filters={filters}
        filterValues={filterValues}
        onFilterChange={setFilterValues}
        onSearch={() => load(1, pageSize)}
        data={data}
        columns={columns}
        loading={loading}
        rowKey="id"
        selectedKeys={selectedKeys}
        onSelectionChange={setSelectedKeys}
        showCheckbox
        showIndex
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

export default ResidentsPage;
