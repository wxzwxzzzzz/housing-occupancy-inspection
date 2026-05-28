/**
 * 保障家庭详情 — Household
 *
 * 把家庭成员、居住信息、工作信息、个人收入、成员变更记录、
 * 资质申请、配租、补贴、终止 都作为 Tab 嵌入在家庭详情下,
 * 不再独立成菜单。
 */

import { ExportOutlined, UsergroupAddOutlined } from '@ant-design/icons';
import { useNavigate, useParams } from '@umijs/max';
import { useRequest } from 'ahooks';
import {
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
import React, { useCallback, useState } from 'react';
import EntityReferSelect from '@/components/EntityReferSelect';
import {
  type DetailSection,
  type DetailTabItem,
  OmnibarDetailPage,
  type StatusBadge,
  type ToolbarAction,
} from '@/components/OmnibarPage';
import ResidentLink from '@/components/ResidentLink';
import { householdMemberChangeService } from '@/services/domains/change';
import {
  eligibilityApplicationService,
  eligibilityTerminationService,
  housingAllocationService,
  rentalSubsidyService,
} from '@/services/domains/eligibility';
import {
  employmentService,
  householdMemberService,
  householdService,
  personalIncomeService,
  residenceService,
} from '@/services/domains/household';
import { invokeAction } from '@/services/ontology/client';
import { OT } from '@/services/ontology/object-types';
import { qb } from '@/services/ontology/query';
import { dictLabel, dictStore } from '@/stores/dictStore';
import type { EligibilityApplication } from '@/types/ontology/prh/entities/eligibility_application';
import type { EligibilityTermination } from '@/types/ontology/prh/entities/eligibility_termination';
import type { Employment } from '@/types/ontology/prh/entities/employment';
import type { Household } from '@/types/ontology/prh/entities/household';
import type { HouseholdMember } from '@/types/ontology/prh/entities/household_member';
import type { HouseholdMemberChange } from '@/types/ontology/prh/entities/household_member_change';
import type { HousingAllocation } from '@/types/ontology/prh/entities/housing_allocation';
import type { PersonalIncome } from '@/types/ontology/prh/entities/personal_income';
import type { RentalSubsidy } from '@/types/ontology/prh/entities/rental_subsidy';
import type { Residence } from '@/types/ontology/prh/entities/residence';
import { StatusColors } from '@/utils/enum-options';

function householdStatusBadge(status?: string): StatusBadge {
  const map: Record<string, StatusBadge['color']> = {
    DRAFT: 'secondary',
    ACTIVE: 'success',
    CANDIDATE: 'primary',
    ARCHIVED: 'secondary',
  };
  return {
    text: dictLabel('HouseholdStatus', status),
    color: map[status ?? ''] ?? 'secondary',
  };
}

function useListByHousehold<T>(
  objectType: string,
  service: { list: (q: any) => Promise<{ data: T[] }> },
  householdId: string | undefined,
  field = 'household',
) {
  return useRequest(
    async () => {
      if (!householdId) return [] as T[];
      const env = await service.list(
        qb(objectType).eq(field, householdId).page(1, 100).build() as any,
      );
      return env.data;
    },
    { refreshDeps: [householdId] },
  );
}

function useListByResident<T>(
  objectType: string,
  service: { list: (q: any) => Promise<{ data: T[] }> },
  residentIds: string[],
) {
  return useRequest(
    async () => {
      if (residentIds.length === 0) return [] as T[];
      const env = await service.list(
        qb(objectType).in('resident', residentIds).page(1, 200).build() as any,
      );
      return env.data;
    },
    { refreshDeps: [residentIds.join(',')] },
  );
}

const HouseholdDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [inviteOpen, setInviteOpen] = useState(false);
  const [inviteForm] = Form.useForm();
  const [inviting, setInviting] = useState(false);
  const [archiveOpen, setArchiveOpen] = useState(false);
  const [archiveForm] = Form.useForm();
  const [archiving, setArchiving] = useState(false);

  // 主体
  const {
    data: household,
    loading,
    refresh: reload,
  } = useRequest(
    async () => {
      if (!id) return null;
      const env = await householdService.detail(id);
      return env.data as Household | null;
    },
    { refreshDeps: [id] },
  );

  // 家庭成员
  const { data: members = [] } = useListByHousehold<HouseholdMember>(
    OT.HouseholdMember,
    householdMemberService,
    id,
  );
  const residentIds = (members as any[])
    .map((m) => m.resident)
    .filter(Boolean) as string[];

  // 与家庭关联的子档案
  const { data: residences = [] } = useListByResident<Residence>(
    OT.Residence,
    residenceService,
    residentIds,
  );
  const { data: employments = [] } = useListByResident<Employment>(
    OT.Employment,
    employmentService,
    residentIds,
  );
  const { data: incomes = [] } = useListByResident<PersonalIncome>(
    OT.PersonalIncome,
    personalIncomeService,
    residentIds,
  );

  const { data: memberChanges = [] } =
    useListByHousehold<HouseholdMemberChange>(
      OT.HouseholdMemberChange,
      householdMemberChangeService,
      id,
    );
  const { data: applications = [] } =
    useListByHousehold<EligibilityApplication>(
      OT.EligibilityApplication,
      eligibilityApplicationService,
      id,
    );
  const { data: allocations = [] } = useListByHousehold<HousingAllocation>(
    OT.HousingAllocation,
    housingAllocationService,
    id,
  );
  const { data: subsidies = [] } = useListByHousehold<RentalSubsidy>(
    OT.RentalSubsidy,
    rentalSubsidyService,
    id,
  );
  const { data: terminations = [] } =
    useListByHousehold<EligibilityTermination>(
      OT.EligibilityTermination,
      eligibilityTerminationService,
      id,
    );

  if (loading || !household) {
    return (
      <div style={{ padding: 16 }}>
        <Skeleton active />
      </div>
    );
  }

  const h = household as any;

  const sections: DetailSection[] = [
    {
      key: 'base',
      title: '基础信息',
      fields: [
        {
          label: '主申请人',
          value: h.applicantName ?? '-',
          name: 'applicantName',
          editType: 'input',
          required: true,
        },
        {
          label: '关联居民',
          value: h.applicant ? (
            <ResidentLink id={String(h.applicant)}>
              {h.applicantName ?? String(h.applicant)}
            </ResidentLink>
          ) : (
            '-'
          ),
        },
        {
          label: '保障类型',
          value: dictLabel('GuaranteeType', h.guaranteeType),
          name: 'guaranteeType',
          editType: 'select',
          options: dictStore.options('GuaranteeType'),
          required: true,
        },
        {
          label: '家庭人口数',
          value: h.householdSize ?? '-',
          name: 'householdSize',
          editType: 'number',
          required: true,
        },
        {
          label: '轮候序号',
          value: h.waitlistNo ? `#${h.waitlistNo}` : '-',
        },
        {
          label: '当前申请单',
          value: h.activeApplicationId
            ? `#${String(h.activeApplicationId).slice(-6)}`
            : '-',
        },
      ],
    },
    {
      key: 'status',
      title: '状态与归档',
      defaultCollapsed: true,
      fields: [
        {
          label: '家庭状态',
          value: (
            <Tag color={(StatusColors.HouseholdStatus as any)[h.status]}>
              {dictLabel('HouseholdStatus', h.status)}
            </Tag>
          ),
        },
        {
          label: '归档原因',
          value: dictLabel('TerminationReason', h.archiveReason),
        },
        { label: '归档日期', value: h.archiveDate ?? '-' },
        { label: '归档备注', value: h.archiveNote ?? '-' },
      ],
    },
  ];

  // ========== Tab: 家庭成员 ==========
  const memberCols: ColumnsType<HouseholdMember> = [
    { title: '姓名', dataIndex: 'fullName', width: 130 },
    { title: '身份证号', dataIndex: 'idCardNo', width: 200 },
    { title: '关系', dataIndex: 'relationship', width: 110 },
    {
      title: '是否计入人口',
      dataIndex: 'isIncluded',
      width: 130,
      render: (v: boolean) =>
        v ? <Tag color="processing">是</Tag> : <Tag>否</Tag>,
    },
    {
      title: '关联居民',
      dataIndex: 'resident',
      width: 140,
      render: (v: string) =>
        v ? <ResidentLink id={String(v)}>{String(v)}</ResidentLink> : '-',
    },
    { title: '加入时间', dataIndex: 'joinAt', width: 160 },
  ];

  // ========== Tab: 居住信息 ==========
  const residenceCols: ColumnsType<Residence> = [
    {
      title: '所属居民',
      dataIndex: 'resident',
      width: 130,
      render: (v: string) =>
        v ? <ResidentLink id={String(v)}>{String(v)}</ResidentLink> : '-',
    },
    {
      title: '居住类型',
      dataIndex: 'addressType',
      width: 120,
      render: (v: any) => dictLabel('ResidenceType', v),
    },
    {
      title: '地址',
      dataIndex: 'address',
      ellipsis: true,
      render: (v: any) => v?.detail ?? '-',
    },
    {
      title: '监测目标',
      dataIndex: 'isMonitoringTarget',
      width: 100,
      render: (v: boolean) =>
        v ? <Tag color="processing">是</Tag> : <Tag>否</Tag>,
    },
    {
      title: '记录状态',
      dataIndex: 'status',
      width: 110,
      render: (v: any) => dictLabel('RecordStatus', v),
    },
    { title: '生效日期', dataIndex: 'effectiveDate', width: 120 },
  ];

  // ========== Tab: 工作信息 ==========
  const employmentCols: ColumnsType<Employment> = [
    {
      title: '所属居民',
      dataIndex: 'resident',
      width: 130,
      render: (v: string) =>
        v ? <ResidentLink id={String(v)}>{String(v)}</ResidentLink> : '-',
    },
    { title: '工作单位', dataIndex: 'unitName', width: 200, ellipsis: true },
    {
      title: '工作类型',
      dataIndex: 'addressType',
      width: 120,
      render: (v: any) => dictLabel('EmploymentAddressType', v),
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
      render: (v: any) => dictLabel('RecordStatus', v),
    },
  ];

  // ========== Tab: 个人收入 ==========
  const incomeCols: ColumnsType<PersonalIncome> = [
    {
      title: '所属居民',
      dataIndex: 'resident',
      width: 130,
      render: (v: string) =>
        v ? <ResidentLink id={String(v)}>{String(v)}</ResidentLink> : '-',
    },
    {
      title: '收入类型',
      dataIndex: 'incomeType',
      width: 130,
      render: (v: any) => dictLabel('IncomeType', v),
    },
    { title: '金额', dataIndex: 'amount', width: 120 },
    { title: '所属期间', dataIndex: 'period', width: 120 },
    { title: '收入来源', dataIndex: 'employer', ellipsis: true },
  ];

  // ========== Tab: 资质申请 ==========
  const applicationCols: ColumnsType<EligibilityApplication> = [
    {
      title: '编号',
      dataIndex: 'id',
      width: 110,
      render: (v: string) => `#${v.slice(-6)}`,
    },
    {
      title: '申请类型',
      dataIndex: 'applicationType',
      width: 120,
      render: (v: any) => dictLabel('ApplicationType', v),
    },
    {
      title: '保障类型',
      dataIndex: 'guaranteeType',
      width: 130,
      render: (v: any) => dictLabel('GuaranteeType', v),
    },
    {
      title: '状态',
      dataIndex: 'status',
      width: 110,
      render: (v: any) => (
        <Tag color={(StatusColors.ApplicationStatus as any)[v]}>
          {dictLabel('ApplicationStatus', v)}
        </Tag>
      ),
    },
    { title: '提交时间', dataIndex: 'submittedAt', width: 160 },
  ];

  // ========== Tab: 实物配租 ==========
  const allocationCols: ColumnsType<HousingAllocation> = [
    {
      title: '编号',
      dataIndex: 'id',
      width: 110,
      render: (v: string) => `#${v.slice(-6)}`,
    },
    { title: '项目', dataIndex: 'projectName', width: 180, ellipsis: true },
    {
      title: '楼栋/单元/房号',
      key: 'addr',
      width: 160,
      render: (_, r: any) =>
        [r.buildingNo, r.unitNo, r.roomNo].filter(Boolean).join('-') || '-',
    },
    { title: '面积', dataIndex: 'area', width: 90 },
    { title: '月租金', dataIndex: 'monthlyRent', width: 100 },
    { title: '起租', dataIndex: 'leaseStartDate', width: 110 },
    { title: '到期', dataIndex: 'leaseEndDate', width: 110 },
    {
      title: '状态',
      dataIndex: 'status',
      width: 110,
      render: (v: any) => dictLabel('AllocationStatus', v),
    },
  ];

  // ========== Tab: 租赁补贴 ==========
  const subsidyCols: ColumnsType<RentalSubsidy> = [
    {
      title: '编号',
      dataIndex: 'id',
      width: 110,
      render: (v: string) => `#${v.slice(-6)}`,
    },
    { title: '月补贴金额', dataIndex: 'monthlyAmount', width: 130 },
    { title: '起始日期', dataIndex: 'startDate', width: 120 },
    { title: '截止日期', dataIndex: 'endDate', width: 120 },
    { title: '收款账户', dataIndex: 'bankAccount', width: 180, ellipsis: true },
    {
      title: '状态',
      dataIndex: 'status',
      width: 110,
      render: (v: any) => dictLabel('SubsidyStatus', v),
    },
  ];

  // ========== Tab: 资格终止 ==========
  const terminationCols: ColumnsType<EligibilityTermination> = [
    {
      title: '编号',
      dataIndex: 'id',
      width: 110,
      render: (v: string) => `#${v.slice(-6)}`,
    },
    {
      title: '终止类型',
      dataIndex: 'terminationType',
      width: 140,
      render: (v: any) => dictLabel('TerminationReason', v),
    },
    { title: '期望生效日期', dataIndex: 'effectiveDate', width: 140 },
    {
      title: '状态',
      dataIndex: 'status',
      width: 110,
      render: (v: any) => (
        <Tag color={(StatusColors.ApplicationStatus as any)[v]}>
          {dictLabel('ApplicationStatus', v)}
        </Tag>
      ),
    },
    { title: '终止原因', dataIndex: 'reason', ellipsis: true },
  ];

  // ========== Tab: 成员变更记录 ==========
  const memberChangeCols: ColumnsType<HouseholdMemberChange> = [
    {
      title: '编号',
      dataIndex: 'id',
      width: 110,
      render: (v: string) => `#${v.slice(-6)}`,
    },
    {
      title: '变更类型',
      dataIndex: 'changeType',
      width: 110,
      render: (v: any) => dictLabel('MemberChangeType', v),
    },
    {
      title: '目标成员',
      dataIndex: 'member',
      width: 140,
      render: (v: string) => (v ? `成员#${String(v).slice(-6)}` : '-'),
    },
    { title: '变更原因', dataIndex: 'reason', ellipsis: true },
    {
      title: '状态',
      dataIndex: 'status',
      width: 110,
      render: (v: any) => (
        <Tag color={(StatusColors.ApplicationStatus as any)[v]}>
          {dictLabel('ApplicationStatus', v)}
        </Tag>
      ),
    },
  ];

  const renderTable = <T extends { id?: string }>(
    list: T[],
    columns: ColumnsType<T>,
    onRowNav?: (r: T) => void,
  ) => (
    <Table<T>
      size="small"
      rowKey={(r) => (r as any).id ?? Math.random().toString(36)}
      dataSource={list}
      columns={columns}
      pagination={{ pageSize: 10, showSizeChanger: false }}
      onRow={
        onRowNav
          ? (r) => ({
              style: { cursor: 'pointer' },
              onClick: () => onRowNav(r),
            })
          : undefined
      }
    />
  );

  const tabs: DetailTabItem[] = [
    {
      key: 'members',
      label: `家庭成员 (${members.length})`,
      content: renderTable(members, memberCols),
    },
    {
      key: 'residences',
      label: `居住信息 (${residences.length})`,
      content: renderTable(residences, residenceCols),
    },
    {
      key: 'employments',
      label: `工作信息 (${employments.length})`,
      content: renderTable(employments, employmentCols),
    },
    {
      key: 'incomes',
      label: `个人收入 (${incomes.length})`,
      content: renderTable(incomes, incomeCols),
    },
    {
      key: 'memberChanges',
      label: `成员变更 (${memberChanges.length})`,
      content: renderTable(memberChanges, memberChangeCols, (r: any) =>
        navigate(`/monitor/member-changes/detail/${r.id}`),
      ),
    },
    {
      key: 'applications',
      label: `资质申请 (${applications.length})`,
      content: renderTable(applications, applicationCols, (r: any) =>
        navigate(`/eligibility/applications/detail/${r.id}`),
      ),
    },
    {
      key: 'allocations',
      label: `实物配租 (${allocations.length})`,
      content: renderTable(allocations, allocationCols, (r: any) =>
        navigate(`/eligibility/allocations/detail/${r.id}`),
      ),
    },
    {
      key: 'subsidies',
      label: `租赁补贴 (${subsidies.length})`,
      content: renderTable(subsidies, subsidyCols, (r: any) =>
        navigate(`/eligibility/subsidies/detail/${r.id}`),
      ),
    },
    {
      key: 'terminations',
      label: `资格终止 (${terminations.length})`,
      content: renderTable(terminations, terminationCols, (r: any) =>
        navigate(`/eligibility/terminations/detail/${r.id}`),
      ),
    },
  ];

  const handleInvite = async () => {
    try {
      const values = await inviteForm.validateFields();
      setInviting(true);
      await invokeAction({
        objectType: OT.Household,
        actionName: 'invite',
        payload: {
          id,
          resident: values.resident,
          relation: values.relation,
        },
      });
      message.success('邀请已发送');
      inviteForm.resetFields();
      setInviteOpen(false);
      reload();
    } catch (err: any) {
      if (err?.errorFields) return;
      message.error(err?.message ?? '邀请失败');
    } finally {
      setInviting(false);
    }
  };

  const handleArchiveSubmit = async () => {
    try {
      const values = await archiveForm.validateFields();
      setArchiving(true);
      await invokeAction({
        objectType: OT.Household,
        actionName: 'archive',
        payload: {
          id,
          archiveReason: values.archiveReason,
          archiveNote: values.archiveNote,
        },
      });
      message.success('已归档退出');
      archiveForm.resetFields();
      setArchiveOpen(false);
      reload();
    } catch (err: any) {
      if (err?.errorFields) return;
      message.error(err?.message ?? '归档失败');
    } finally {
      setArchiving(false);
    }
  };

  const headerActions: ToolbarAction[] = [
    {
      key: 'invite',
      icon: <UsergroupAddOutlined />,
      label: '邀请家庭成员',
      onClick: () => setInviteOpen(true),
      disabled: (household as any)?.status === 'ARCHIVED',
    },
    {
      key: 'archive',
      danger: true,
      icon: <ExportOutlined />,
      label: '归档退出',
      onClick: () => setArchiveOpen(true),
      disabled:
        (household as any)?.status === 'ARCHIVED' ||
        (household as any)?.status === 'DRAFT',
    },
  ];

  return (
    <>
      <OmnibarDetailPage
        title={`家庭 #${String(h.id).slice(-6)} · ${h.applicantName}`}
        statusBadge={householdStatusBadge(h.status)}
        onBack={() => navigate('/profile/households')}
        backLabel="返回家庭列表"
        headerActions={headerActions}
        sections={sections}
        tabs={tabs}
        defaultTabKey="members"
        footerFields={[
          { label: '创建人', value: h.creator ?? '-' },
          { label: '创建时间', value: h.createAt ?? '-' },
          { label: '修改人', value: h.modifier ?? '-' },
          { label: '修改时间', value: h.modifyAt ?? '-' },
        ]}
        editable
        record={h}
        onSave={async (values) => {
          await householdService.modify({ ...h, ...values });
        }}
        onSaved={reload}
      />

      <Modal
        title="邀请家庭成员"
        open={inviteOpen}
        onCancel={() => {
          inviteForm.resetFields();
          setInviteOpen(false);
        }}
        onOk={handleInvite}
        confirmLoading={inviting}
        okText="发送邀请"
        cancelText="取消"
        width={520}
        destroyOnClose
        styles={{ footer: { textAlign: 'right' } }}
      >
        <Form form={inviteForm} layout="vertical" preserve={false}>
          <Form.Item
            label="居民"
            name="resident"
            rules={[{ required: true, message: '请选择被邀请居民' }]}
            extra="只能选择已激活的居民"
          >
            <EntityReferSelect
              objectType={OT.Resident}
              labelField="fullName"
              extraFilter={(b) => b.eq('status', 'ACTIVATED')}
            />
          </Form.Item>
          <Form.Item
            label="与申请人关系"
            name="relation"
            rules={[{ required: true, message: '请填写关系' }]}
          >
            <Input placeholder="如:配偶 / 子女 / 父母" maxLength={64} />
          </Form.Item>
        </Form>
      </Modal>

      <Modal
        title="家庭归档退出"
        open={archiveOpen}
        onCancel={() => {
          archiveForm.resetFields();
          setArchiveOpen(false);
        }}
        onOk={handleArchiveSubmit}
        confirmLoading={archiving}
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
    </>
  );
};

export default HouseholdDetail;
