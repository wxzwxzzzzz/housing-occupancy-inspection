import {
  CheckCircleOutlined,
  ExportOutlined,
  PlusOutlined,
  UserOutlined,
} from '@ant-design/icons';
import { useNavigate, useParams } from '@umijs/max';
import { useRequest } from 'ahooks';
import {
  Avatar,
  Button,
  Form,
  Input,
  Modal,
  message,
  Select,
  Skeleton,
  Table,
  Tag,
} from 'antd';
import type { ColumnsType } from 'antd/es/table';
import React, { useState } from 'react';
import EntityCreateModal from '@/components/EntityCreateModal';
import {
  type DetailSection,
  type DetailTabItem,
  OmnibarDetailPage,
  type StatusBadge,
  type ToolbarAction,
  useDetail,
} from '@/components/OmnibarPage';
import PhotoCell from '@/components/PhotoCell';
import {
  employmentService,
  householdMemberService,
  personalIncomeService,
  residenceService,
} from '@/services/domains/household';
import { residentService } from '@/services/domains/resident';
import { invokeAction } from '@/services/ontology/client';
import { OT } from '@/services/ontology/object-types';
import { qb } from '@/services/ontology/query';
import { dictStore } from '@/stores/dictStore';
import type { Employment } from '@/types/ontology/prh/entities/employment';
import type { HouseholdMember } from '@/types/ontology/prh/entities/household_member';
import type { PersonalIncome } from '@/types/ontology/prh/entities/personal_income';
import type { Residence } from '@/types/ontology/prh/entities/residence';
import type { Resident } from '@/types/ontology/prh/entities/resident';
import {
  Gender,
  GuaranteeType,
  MaritalStatus,
  ResidentStatus,
} from '@/types/ontology/prh/enums';
import {
  EnumLabels,
  enumLabel,
  enumOptions,
  StatusColors,
} from '@/utils/enum-options';
import { lifecyclePanelStore, type LifecycleStep } from '@/stores';
import ResidentFencePanel from './ResidentFencePanel';

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
      EnumLabels.ResidentStatus[
        status as keyof typeof EnumLabels.ResidentStatus
      ] ??
      status ??
      '-',
    color: map[status ?? ''] ?? 'secondary',
  };
}

function useListByResident<T>(
  objectType: string,
  service: { list: (q: any) => Promise<{ data: T[] }> },
  residentId: string | undefined,
  field = 'resident',
) {
  return useRequest(
    async () => {
      if (!residentId) return [] as T[];
      const env = await service.list(
        qb(objectType).eq(field, residentId).page(1, 100).build() as any,
      );
      return env.data;
    },
    { refreshDeps: [residentId] },
  );
}

const RESIDENT_LIFECYCLE_STEPS: LifecycleStep[] = [
  { status: 'DRAFT', label: '草稿', kind: 'main', desc: '居民信息录入中' },
  { status: 'UNVERIFIED', label: '待核验', kind: 'main', desc: '待实名/人脸核验' },
  { status: 'VERIFIED', label: '已核验', kind: 'main', desc: '身份核验通过' },
  { status: 'ACTIVATED', label: '已激活', kind: 'main', desc: '正式纳入监测' },
  { status: 'ARCHIVED', label: '已归档', kind: 'terminal', desc: '退出保障,归档' },
];

const ResidentDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [modalKind, setModalKind] = useState<
    'residence' | 'employment' | 'income' | null
  >(null);

  const [archiveOpen, setArchiveOpen] = useState(false);
  const [archiveForm] = Form.useForm();
  const [archiveSubmitting, setArchiveSubmitting] = useState(false);

  const fetcher = React.useCallback(async (rid: string) => {
    const env = await residentService.detail(rid);
    return env.data as Resident;
  }, []);
  const { data, loading, reload } = useDetail(id, fetcher);

  // 注入状态流程面板上下文 → 右侧 rail 显示「状态流程」并自动展开
  const residentStatus = (data as any)?.status as string | undefined;
  React.useEffect(() => {
    if (data) {
      lifecyclePanelStore.setContext(
        '居民状态流程',
        RESIDENT_LIFECYCLE_STEPS,
        residentStatus,
        'ResidentStatus',
      );
    }
    return () => lifecyclePanelStore.clear();
  }, [data, residentStatus]);

  // 子档案
  const { data: members = [] } = useListByResident<HouseholdMember>(
    OT.HouseholdMember,
    householdMemberService,
    id,
  );
  const { data: residences = [], refresh: refreshResidences } =
    useListByResident<Residence>(OT.Residence, residenceService, id);
  const { data: employments = [], refresh: refreshEmployments } =
    useListByResident<Employment>(OT.Employment, employmentService, id);
  const { data: incomes = [], refresh: refreshIncomes } =
    useListByResident<PersonalIncome>(
      OT.PersonalIncome,
      personalIncomeService,
      id,
    );

  if (loading || !data) {
    return (
      <div style={{ padding: 16 }}>
        <Skeleton active />
      </div>
    );
  }

  const r = data as any;

  // ============ 居民生命周期动作 ============
  const status = r.status as string;

  const handleActivate = () => {
    Modal.confirm({
      title: '激活该居民?',
      content: '激活后居民可参与打卡、申请等业务。',
      onOk: async () => {
        try {
          await invokeAction({
            objectType: OT.Resident,
            actionName: 'activate',
            payload: { id: r.id },
          });
          message.success('已激活');
          reload();
        } catch (err: any) {
          message.error(err?.message ?? '激活失败');
        }
      },
    });
  };

  const handleArchiveSubmit = async () => {
    try {
      const values = await archiveForm.validateFields();
      setArchiveSubmitting(true);
      await residentService.archive(
        r.id,
        values.archiveReason,
        values.archiveNote,
      );
      message.success('已归档退出');
      archiveForm.resetFields();
      setArchiveOpen(false);
      reload();
    } catch (err: any) {
      if (err?.errorFields) return;
      message.error(err?.message ?? '归档失败');
    } finally {
      setArchiveSubmitting(false);
    }
  };

  const headerActions: ToolbarAction[] = (() => {
    const acts: ToolbarAction[] = [];
    if (
      status === 'DRAFT' ||
      status === 'UNVERIFIED' ||
      status === 'VERIFIED'
    ) {
      acts.push({
        key: 'activate',
        type: 'primary',
        icon: <CheckCircleOutlined />,
        label: '激活居民',
        onClick: handleActivate,
      });
    }
    if (status === 'ACTIVATED') {
      acts.push({
        key: 'archive',
        danger: true,
        icon: <ExportOutlined />,
        label: '归档退出',
        onClick: () => setArchiveOpen(true),
      });
    }
    return acts;
  })();

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
          value:
            EnumLabels.Gender[r.gender as keyof typeof EnumLabels.Gender] ??
            '-',
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
        {
          label: '出生日期',
          value: r.birthDate ?? '-',
          name: 'birthDate',
          editType: 'date',
        },
        {
          label: '婚姻状况',
          value:
            EnumLabels.MaritalStatus[
              r.maritalStatus as keyof typeof EnumLabels.MaritalStatus
            ] ?? '-',
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
        {
          label: '联系电话',
          value: r.phone ?? '-',
          name: 'phone',
          editType: 'input',
        },
        {
          label: '邮箱',
          value: r.email ?? '-',
          name: 'email',
          editType: 'input',
        },
        {
          label: '状态',
          value: (
            <Tag color={(StatusColors.ResidentStatus as any)[r.status]}>
              {EnumLabels.ResidentStatus[
                r.status as keyof typeof EnumLabels.ResidentStatus
              ] ?? r.status}
            </Tag>
          ),
          name: 'status',
          editType: 'select',
          options: enumOptions(ResidentStatus, EnumLabels.ResidentStatus),
        },
        {
          label: '保障类型',
          value:
            EnumLabels.GuaranteeType[
              r.guaranteeType as keyof typeof EnumLabels.GuaranteeType
            ] ?? '-',
          name: 'guaranteeType',
          editType: 'select',
          options: enumOptions(GuaranteeType, EnumLabels.GuaranteeType),
        },
      ],
    },
    {
      key: 'attachments',
      title: '材料附件',
      defaultCollapsed: false,
      fields: [
        {
          label: '身份证正面',
          name: 'idCardFrontPhoto',
          value: <PhotoCell value={r.idCardFrontPhoto} />,
          editValue: r.idCardFrontPhoto,
          editRender: (val, onChange) => (
            <PhotoCell editing value={val} onChange={onChange} />
          ),
        },
        {
          label: '身份证背面',
          name: 'idCardBackPhoto',
          value: <PhotoCell value={r.idCardBackPhoto} />,
          editValue: r.idCardBackPhoto,
          editRender: (val, onChange) => (
            <PhotoCell editing value={val} onChange={onChange} />
          ),
        },
        {
          label: '人脸照片',
          name: 'facePhoto',
          value: <PhotoCell value={r.facePhoto} />,
          editValue: r.facePhoto,
          editRender: (val, onChange) => (
            <PhotoCell editing value={val} onChange={onChange} />
          ),
        },
        {
          label: '户口本',
          name: 'householdBookPhoto',
          value: <PhotoCell value={r.householdBookPhoto} />,
          editValue: r.householdBookPhoto,
          editRender: (val, onChange) => (
            <PhotoCell editing value={val} onChange={onChange} />
          ),
        },
        {
          label: '银行流水',
          name: 'bankFlowPhoto',
          value: <PhotoCell value={r.bankFlowPhoto} />,
          editValue: r.bankFlowPhoto,
          editRender: (val, onChange) => (
            <PhotoCell editing value={val} onChange={onChange} />
          ),
        },
        {
          label: '婚姻证明',
          name: 'marriageCertPhoto',
          value: <PhotoCell value={r.marriageCertPhoto} />,
          editValue: r.marriageCertPhoto,
          editRender: (val, onChange) => (
            <PhotoCell editing value={val} onChange={onChange} />
          ),
        },
        {
          label: '收入证明',
          name: 'incomeCertPhoto',
          value: <PhotoCell value={r.incomeCertPhoto} />,
          editValue: r.incomeCertPhoto,
          editRender: (val, onChange) => (
            <PhotoCell editing value={val} onChange={onChange} />
          ),
        },
        {
          label: '社保证明',
          name: 'socialSecurityPhoto',
          value: <PhotoCell value={r.socialSecurityPhoto} />,
          editValue: r.socialSecurityPhoto,
          editRender: (val, onChange) => (
            <PhotoCell editing value={val} onChange={onChange} />
          ),
        },
      ],
    },
  ];

  const renderTable = <T extends { id?: string }>(
    list: T[],
    columns: ColumnsType<T>,
    onRowNav?: (r: T) => void,
  ) => (
    <Table<T>
      size="small"
      rowKey={(row) => (row as any).id ?? Math.random().toString(36)}
      dataSource={list}
      columns={columns}
      pagination={{ pageSize: 10, showSizeChanger: false }}
      onRow={
        onRowNav
          ? (row) => ({
              style: { cursor: 'pointer' },
              onClick: () => onRowNav(row),
            })
          : undefined
      }
    />
  );

  const memberCols: ColumnsType<HouseholdMember> = [
    {
      title: '所属家庭',
      dataIndex: 'household',
      width: 140,
      render: (v: string) => (v ? `家庭#${String(v).slice(-6)}` : '-'),
    },
    { title: '关系', dataIndex: 'relationship', width: 120 },
    {
      title: '是否计入人口',
      dataIndex: 'isIncluded',
      width: 130,
      render: (v: boolean) =>
        v ? <Tag color="processing">是</Tag> : <Tag>否</Tag>,
    },
    { title: '加入时间', dataIndex: 'joinAt', width: 160 },
  ];

  const residenceCols: ColumnsType<Residence> = [
    {
      title: '居住类型',
      dataIndex: 'addressType',
      width: 120,
      render: (v: any) => enumLabel(EnumLabels.ResidenceType, v),
    },
    {
      title: '地址',
      dataIndex: 'address',
      ellipsis: true,
      render: (v: any) => v?.detail ?? '-',
    },
    {
      title: '记录状态',
      dataIndex: 'status',
      width: 110,
      render: (v: any) => enumLabel(EnumLabels.RecordStatus, v),
    },
    { title: '生效日期', dataIndex: 'effectiveDate', width: 120 },
  ];

  const employmentCols: ColumnsType<Employment> = [
    { title: '工作单位', dataIndex: 'unitName', width: 200, ellipsis: true },
    {
      title: '工作类型',
      dataIndex: 'addressType',
      width: 130,
      render: (v: any) => enumLabel(EnumLabels.EmploymentAddressType, v),
    },
    {
      title: '工作地址',
      dataIndex: 'workAddress',
      ellipsis: true,
      render: (v: any) => v?.detail ?? '-',
    },
    {
      title: '记录状态',
      dataIndex: 'status',
      width: 110,
      render: (v: any) => enumLabel(EnumLabels.RecordStatus, v),
    },
  ];

  const incomeCols: ColumnsType<PersonalIncome> = [
    {
      title: '收入类型',
      dataIndex: 'incomeType',
      width: 130,
      render: (v: any) => enumLabel(EnumLabels.IncomeType, v),
    },
    { title: '金额', dataIndex: 'amount', width: 120 },
    { title: '所属期间', dataIndex: 'period', width: 120 },
    { title: '收入来源', dataIndex: 'employer', ellipsis: true },
  ];

  const tabs: DetailTabItem[] = [
    {
      key: 'households',
      label: `所在家庭 (${members.length})`,
      content: renderTable(members, memberCols, (m: any) =>
        navigate(`/profile/households/detail/${m.household}`),
      ),
    },
    {
      key: 'residences',
      label: `居住信息 (${residences.length})`,
      content: (
        <div>
          <div style={{ padding: '8px 12px', textAlign: 'right' }}>
            <Button
              size="small"
              type="primary"
              icon={<PlusOutlined />}
              onClick={() => setModalKind('residence')}
            >
              登记居住信息
            </Button>
          </div>
          {renderTable(residences, residenceCols)}
        </div>
      ),
    },
    {
      key: 'fence',
      label: '电子围栏',
      content: id ? <ResidentFencePanel residentId={id} /> : null,
    },
    {
      key: 'employments',
      label: `工作信息 (${employments.length})`,
      content: (
        <div>
          <div style={{ padding: '8px 12px', textAlign: 'right' }}>
            <Button
              size="small"
              type="primary"
              icon={<PlusOutlined />}
              onClick={() => setModalKind('employment')}
            >
              登记工作信息
            </Button>
          </div>
          {renderTable(employments, employmentCols)}
        </div>
      ),
    },
    {
      key: 'incomes',
      label: `个人收入 (${incomes.length})`,
      content: (
        <div>
          <div style={{ padding: '8px 12px', textAlign: 'right' }}>
            <Button
              size="small"
              type="primary"
              icon={<PlusOutlined />}
              onClick={() => setModalKind('income')}
            >
              申报收入
            </Button>
          </div>
          {renderTable(incomes, incomeCols)}
        </div>
      ),
    },
  ];

  return (
    <div style={{ height: '100%' }}>
      <OmnibarDetailPage
        title={
          <span>
            <Avatar
              size="small"
              icon={<UserOutlined />}
              style={{ marginRight: 8 }}
            >
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

      <EntityCreateModal
        open={modalKind === 'residence'}
        onClose={() => setModalKind(null)}
        onSuccess={() => refreshResidences()}
        title="登记居住信息"
        service={residenceService as any}
        width={680}
        transformPayload={(p) => ({
          ...p,
          resident: id,
          isMonitoringTarget: !!p.isMonitoringTarget,
        })}
        fields={[
          {
            name: 'addressType',
            label: '居住类型',
            type: 'select',
            required: true,
            dictName: 'ResidenceType',
          },
          {
            name: 'address',
            label: '居住地址',
            type: 'address',
            required: true,
            placeholder: '请输入完整地址',
            span: 2,
          },
          {
            name: 'isMonitoringTarget',
            label: '是否监测目标',
            type: 'switch',
          },
          {
            name: 'reminderStart',
            label: '提醒开始时间',
            type: 'input',
            placeholder: 'HH:mm',
          },
          {
            name: 'reminderEnd',
            label: '提醒结束时间',
            type: 'input',
            placeholder: 'HH:mm',
          },
          {
            name: 'livingPattern',
            label: '居住规律',
            type: 'textarea',
            span: 2,
          },
        ]}
      />

      <EntityCreateModal
        open={modalKind === 'employment'}
        onClose={() => setModalKind(null)}
        onSuccess={() => refreshEmployments()}
        title="登记工作信息"
        service={employmentService as any}
        width={680}
        transformPayload={(p) => ({
          ...p,
          resident: id,
          isMonitoringTarget: !!p.isMonitoringTarget,
        })}
        fields={[
          {
            name: 'unitName',
            label: '工作单位名称',
            type: 'input',
            required: true,
            span: 2,
          },
          {
            name: 'addressType',
            label: '工作地址类型',
            type: 'select',
            required: true,
            dictName: 'EmploymentAddressType',
          },
          {
            name: 'isMonitoringTarget',
            label: '是否监测目标',
            type: 'switch',
          },
          {
            name: 'workAddress',
            label: '工作地址',
            type: 'address',
            placeholder: '工作单位详细地址',
            span: 2,
          },
          {
            name: 'reminderStart',
            label: '提醒开始时间',
            type: 'input',
            placeholder: 'HH:mm',
          },
          {
            name: 'reminderEnd',
            label: '提醒结束时间',
            type: 'input',
            placeholder: 'HH:mm',
          },
          { name: 'workPattern', label: '工作规律', type: 'textarea', span: 2 },
        ]}
      />

      <EntityCreateModal
        open={modalKind === 'income'}
        onClose={() => setModalKind(null)}
        onSuccess={() => refreshIncomes()}
        title="申报个人收入"
        service={personalIncomeService as any}
        transformPayload={(p) => ({ ...p, resident: id })}
        fields={[
          {
            name: 'incomeType',
            label: '收入类型',
            type: 'select',
            required: true,
            dictName: 'IncomeType',
          },
          {
            name: 'amount',
            label: '金额(元)',
            type: 'number',
            required: true,
            rules: [{ min: 0, message: '金额必须 >= 0' }],
          },
          {
            name: 'period',
            label: '所属期间',
            type: 'input',
            placeholder: '如 2026-04',
          },
          { name: 'employer', label: '收入来源单位', type: 'input', span: 2 },
        ]}
      />

      <Modal
        title="归档退出"
        open={archiveOpen}
        onCancel={() => {
          archiveForm.resetFields();
          setArchiveOpen(false);
        }}
        onOk={handleArchiveSubmit}
        confirmLoading={archiveSubmitting}
        okType="danger"
        okText="确认归档"
        cancelText="取消"
        width={520}
        destroyOnClose
        styles={{ footer: { textAlign: 'right' } }}
      >
        <Form form={archiveForm} layout="vertical" preserve={false}>
          <Form.Item
            label="退出原因"
            name="archiveReason"
            rules={[{ required: true, message: '请选择退出原因' }]}
          >
            <Select
              placeholder="请选择"
              options={dictStore.options('TerminationReason')}
            />
          </Form.Item>
          <Form.Item label="备注" name="archiveNote">
            <Input.TextArea rows={3} placeholder="补充说明(选填)" />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default ResidentDetail;
