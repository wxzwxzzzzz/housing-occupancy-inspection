import { PlusOutlined, ReloadOutlined, UserOutlined } from '@ant-design/icons';
import { useNavigate } from '@umijs/max';
import { Avatar, message, Space, Tag } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import React, { useCallback, useEffect, useState } from 'react';
import {
  type FilterConfig,
  OmnibarListPage,
  type ToolbarAction,
} from '@/components/OmnibarPage';
import { residentService } from '@/services/domains/resident';
import { OT } from '@/services/ontology/object-types';
import { qb } from '@/services/ontology/query';
import { dictLabel, dictStore } from '@/stores/dictStore';
import type { Resident } from '@/types/ontology/prh/entities/resident';
import { StatusColors } from '@/utils/enum-options';
import ResidentCreateModal from './ResidentCreateModal';

interface SearchValues {
  keyword?: string;
  status?: string;
  guaranteeType?: string;
  gender?: string;
  maritalStatus?: string;
}

function maskIdCard(idCard?: string): string {
  if (!idCard || idCard.length < 11) return idCard ?? '-';
  return `${idCard.slice(0, 4)}***${idCard.slice(-4)}`;
}

function maskPhone(phone?: string): string {
  if (!phone || phone.length < 11) return phone ?? '-';
  return `${phone.slice(0, 3)}****${phone.slice(-4)}`;
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
  const [createOpen, setCreateOpen] = useState(false);

  const load = useCallback(
    async (p = page, s = pageSize, override?: SearchValues) => {
      setLoading(true);
      try {
        const v = override ?? filterValues;
        const builder = qb(OT.Resident).orderBy('createAt', 'DESC').page(p, s);
        if (v.keyword) builder.like('fullName', v.keyword);
        if (v.status) builder.eq('status', v.status);
        if (v.guaranteeType) builder.eq('guaranteeType', v.guaranteeType);
        if (v.gender) builder.eq('gender', v.gender);
        if (v.maritalStatus) builder.eq('maritalStatus', v.maritalStatus);
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
      label: '居民状态',
      type: 'select',
      options: dictStore.options('ResidentStatus'),
    },
    {
      key: 'guaranteeType',
      label: '保障类型',
      type: 'select',
      options: dictStore.options('GuaranteeType'),
    },
    {
      key: 'gender',
      label: '性别',
      type: 'select',
      options: dictStore.options('Gender'),
    },
    {
      key: 'maritalStatus',
      label: '婚姻状况',
      type: 'select',
      options: dictStore.options('MaritalStatus'),
    },
  ];

  const toolbarActions: ToolbarAction[] = [
    {
      key: 'create',
      type: 'primary',
      icon: <PlusOutlined />,
      label: '新增居民',
      onClick: () => setCreateOpen(true),
    },
    {
      key: 'refresh',
      type: 'icon',
      icon: <ReloadOutlined />,
      title: '刷新',
      onClick: () => load(page, pageSize),
    },
  ];

  // 9 字段列表(对应 Resident XML 的核心 attributes)
  const columns: ColumnsType<Resident> = [
    {
      title: '姓名',
      dataIndex: 'fullName',
      width: 160,
      fixed: 'left',
      render: (text: string, record: any) => (
        <Space>
          <Avatar size="small" icon={<UserOutlined />}>
            {text?.[0]}
          </Avatar>
          <span
            className="opp-link-cell"
            onClick={() => navigate(`/profile/residents/detail/${record.id}`)}
          >
            {text}
          </span>
        </Space>
      ),
    },
    {
      title: '身份证号',
      dataIndex: 'idCardNo',
      width: 180,
      render: (v: string) => maskIdCard(v),
    },
    {
      title: '手机号',
      dataIndex: 'phone',
      width: 140,
      render: (v: string) => maskPhone(v),
    },
    {
      title: '邮箱',
      dataIndex: 'email',
      width: 180,
      ellipsis: true,
    },
    {
      title: '性别',
      dataIndex: 'gender',
      width: 80,
      render: (v: any) => dictLabel('Gender', v),
    },
    {
      title: '出生日期',
      dataIndex: 'birthDate',
      width: 120,
      render: (v: string) => (v ? String(v).slice(0, 10) : '-'),
    },
    {
      title: '婚姻状况',
      dataIndex: 'maritalStatus',
      width: 100,
      render: (v: any) => dictLabel('MaritalStatus', v),
    },
    {
      title: '保障类型',
      dataIndex: 'guaranteeType',
      width: 130,
      render: (v: any) => dictLabel('GuaranteeType', v),
    },
    {
      title: '居民状态',
      dataIndex: 'status',
      width: 110,
      render: (v: any) => (
        <Tag color={(StatusColors.ResidentStatus as any)[v]}>
          {dictLabel('ResidentStatus', v)}
        </Tag>
      ),
    },
    {
      title: '操作',
      key: 'action',
      width: 220,
      fixed: 'right',
      render: (_: any, record: any) => (
        <span className="opp-row-actions">
          <span
            className="opp-row-action"
            onClick={(e) => {
              e.stopPropagation();
              navigate(`/profile/residents/detail/${record.id}`);
            }}
          >
            查看
          </span>
          <span
            className="opp-row-action"
            onClick={(e) => {
              e.stopPropagation();
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
        toolbarActions={toolbarActions}
        data={data}
        columns={columns}
        loading={loading}
        rowKey="id"
        selectedKeys={selectedKeys}
        onSelectionChange={setSelectedKeys}
        showCheckbox
        showIndex
        scroll={{ x: 1500 }}
        onRowClick={(record: any) =>
          navigate(`/profile/residents/detail/${record.id}`)
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
      <ResidentCreateModal
        open={createOpen}
        onClose={() => setCreateOpen(false)}
        onSuccess={() => load(1, pageSize)}
      />
    </div>
  );
};

export default ResidentsPage;
