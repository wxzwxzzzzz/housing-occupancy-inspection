import React from 'react';
import { Skeleton, Tag, Avatar } from 'antd';
import { UserOutlined } from '@ant-design/icons';
import { useNavigate, useParams } from '@umijs/max';
import { residentService } from '@/services/domains/resident';
import type { Resident } from '@/types/ontology/prh/entities/resident';
import {
  Gender,
  GuaranteeType,
  MaritalStatus,
  ResidentStatus,
} from '@/types/ontology/prh/enums';
import { EnumLabels, StatusColors, enumOptions } from '@/utils/enum-options';
import {
  OmnibarDetailPage,
  useDetail,
  type DetailSection,
  type DetailTabItem,
  type ToolbarAction,
  type StatusBadge,
} from '@/components/OmnibarPage';

function maskIdCard(idCard?: string): string {
  if (!idCard || idCard.length < 11) return idCard ?? '-';
  return `${idCard.slice(0, 4)}***${idCard.slice(-4)}`;
}

function getStatusBadge(status: string | undefined): StatusBadge {
  const map: Record<string, StatusBadge['color']> = {
    ACTIVATED: 'success',
    PENDING: 'warning',
    SUSPENDED: 'danger',
    ARCHIVED: 'secondary',
  };
  return {
    text:
      EnumLabels.ResidentStatus[status as keyof typeof EnumLabels.ResidentStatus] ?? status ?? '-',
    color: map[status ?? ''] ?? 'secondary',
  };
}

const ResidentDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const fetcher = React.useCallback(
    async (rid: string) => {
      const env = await residentService.detail(rid);
      return env.data as Resident;
    },
    [],
  );
  const { data, loading, reload } = useDetail(id, fetcher);

  if (loading || !data) {
    return (
      <div style={{ padding: 16 }}>
        <Skeleton active />
      </div>
    );
  }

  const r = data as any;

  const sections: DetailSection[] = [
    {
      key: 'base',
      title: '基础信息',
      fields: [
        {
          label: '姓名',
          value: r.fullName ?? '-',
          name: 'fullName',
          editType: 'input',
          required: true,
        },
        {
          label: '性别',
          value: EnumLabels.Gender[r.gender as keyof typeof EnumLabels.Gender] ?? '-',
          name: 'gender',
          editType: 'select',
          options: enumOptions(Gender, EnumLabels.Gender),
        },
        {
          label: '证件号',
          value: maskIdCard(r.idCardNo),
          name: 'idCardNo',
          editType: 'input',
          editValue: r.idCardNo,
        },
        { label: '出生日期', value: r.birthDate ?? '-', name: 'birthDate', editType: 'date' },
        {
          label: '婚姻状况',
          value:
            EnumLabels.MaritalStatus[r.maritalStatus as keyof typeof EnumLabels.MaritalStatus] ??
            '-',
          name: 'maritalStatus',
          editType: 'select',
          options: enumOptions(MaritalStatus, EnumLabels.MaritalStatus),
        },
      ],
    },
    {
      key: 'contact',
      title: '联系与状态',
      defaultCollapsed: true,
      fields: [
        { label: '联系电话', value: r.phone ?? '-', name: 'phone', editType: 'input' },
        { label: '邮箱', value: r.email ?? '-', name: 'email', editType: 'input' },
        {
          label: '状态',
          value: (
            <Tag color={(StatusColors.ResidentStatus as any)[r.status]}>
              {EnumLabels.ResidentStatus[r.status as keyof typeof EnumLabels.ResidentStatus] ?? r.status}
            </Tag>
          ),
          name: 'status',
          editType: 'select',
          options: enumOptions(ResidentStatus, EnumLabels.ResidentStatus),
        },
        {
          label: '保障类型',
          value:
            EnumLabels.GuaranteeType[r.guaranteeType as keyof typeof EnumLabels.GuaranteeType] ??
            '-',
          name: 'guaranteeType',
          editType: 'select',
          options: enumOptions(GuaranteeType, EnumLabels.GuaranteeType),
        },
      ],
    },
  ];

  const tabs: DetailTabItem[] = [
    {
      key: 'profile',
      label: '档案',
      content: (
        <div style={{ padding: 16, color: '#595959' }}>
          完整档案数据请进入 360 视图查看更多 Tab(家庭/居住/考勤/申请历史/预警)
        </div>
      ),
    },
  ];

  const headerActions: ToolbarAction[] = [
    {
      key: '360',
      label: '查看 360 视图',
      onClick: () => navigate(`/residents/${id}`),
    },
  ];

  return (
    <div style={{ height: '100%' }}>
      <OmnibarDetailPage
        title={
          <span>
            <Avatar size="small" icon={<UserOutlined />} style={{ marginRight: 8 }}>
              {r.fullName?.[0]}
            </Avatar>
            {r.fullName}
          </span>
        }
        statusBadge={getStatusBadge(r.status)}
        onBack={() => navigate(-1)}
        headerActions={headerActions}
        sections={sections}
        tabs={tabs}
        footerFields={[
          { label: '创建人', value: r.creator ?? '-' },
          { label: '创建时间', value: r.createAt ?? '-' },
          { label: '修改人', value: r.modifier ?? '-' },
          { label: '修改时间', value: r.modifyAt ?? '-' },
        ]}
        editable
        record={r}
        onSave={async (values) => {
          await residentService.modify({ ...r, ...values });
        }}
        onSaved={reload}
      />
    </div>
  );
};

export default ResidentDetail;

