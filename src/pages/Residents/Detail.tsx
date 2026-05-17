/**
 * 居民 360 视图 — /residents/:id
 *
 * 政务监管核心场景:审批员在做决策前需一次性看到这个人的全貌。
 * 6 个 Tab:
 *  - 档案:基本信息 + 证件 + 各类证明照片
 *  - 家庭:所属家庭、家庭成员
 *  - 居住就业:Residence 列表 + Employment 列表
 *  - 考勤:近 30 天 AttendanceFact
 *  - 申请历史:Leave / MigrantWork / EligibilityApplication / Changes 合并按时间倒序
 *  - 预警:由 AttendanceFact 派生,只看异常项
 *
 * 实现:每 Tab 独立 useRequest,首次切换才触发(refreshDeps + manual: false 默认)。
 */

import React from 'react';
import {
  Avatar,
  Button,
  Card,
  Descriptions,
  Empty,
  Image,
  List,
  Space,
  Spin,
  Table,
  Tabs,
  Tag,
  Typography,
} from 'antd';
import { ArrowLeftOutlined, UserOutlined } from '@ant-design/icons';
import { useNavigate, useParams } from '@umijs/max';
import { useRequest } from 'ahooks';
import type { ColumnsType } from 'antd/es/table';
import { residentService } from '@/services/domains/resident';
import {
  attendanceFactService,
  attendanceMakeupService,
} from '@/services/domains/attendance';
import { leaveService } from '@/services/domains/leave';
import { migrantWorkService } from '@/services/domains/migrant-work';
import {
  eligibilityApplicationService,
  eligibilityTerminationService,
} from '@/services/domains/eligibility';
import {
  employmentChangeService,
  householdMemberChangeService,
  residenceChangeService,
} from '@/services/domains/change';
import {
  employmentService,
  householdMemberService,
  householdService,
  residenceService,
} from '@/services/domains/household';
import { qb } from '@/services/ontology/query';
import { OT } from '@/services/ontology/object-types';
import type { Resident } from '@/types/ontology/prh/entities/resident';
import type { Household } from '@/types/ontology/prh/entities/household';
import type { HouseholdMember } from '@/types/ontology/prh/entities/household_member';
import type { Residence } from '@/types/ontology/prh/entities/residence';
import type { Employment } from '@/types/ontology/prh/entities/employment';
import type { AttendanceFact } from '@/types/ontology/prh/facts/attendance_fact';
import { EnumLabels, StatusColors } from '@/utils/enum-options';
import './Detail.less';

const { Title, Text } = Typography;

function maskIdCard(idCard?: string): string {
  if (!idCard || idCard.length < 11) return idCard ?? '-';
  return `${idCard.slice(0, 4)}***${idCard.slice(-4)}`;
}

function maskPhone(phone?: string): string {
  if (!phone || phone.length < 7) return phone ?? '-';
  return `${phone.slice(0, 3)}****${phone.slice(-4)}`;
}

const ResidentDetail: React.FC = () => {
  const { id = '' } = useParams<{ id: string }>();
  const navigate = useNavigate();

  // 居民基本档案
  const { data: resident, loading: residentLoading } = useRequest(
    () => residentService.detail(id).then((env) => env.data as Resident | null),
    { refreshDeps: [id] },
  );

  // 头部信息(立即加载)
  const headerName = (resident as any)?.fullName ?? id;

  return (
    <div
      style={{
        padding: 24,
        height: 'calc(100vh - 64px - 45px)', // Header(64) + TabBar(45)
        display: 'flex',
        flexDirection: 'column',
        boxSizing: 'border-box',
      }}
    >
      <Card
        style={{ flex: 1, display: 'flex', flexDirection: 'column', minHeight: 0 }}
        styles={{
          body: {
            flex: 1,
            display: 'flex',
            flexDirection: 'column',
            minHeight: 0,
            overflow: 'hidden',
          },
        }}
      >
        <Space size={16} align="center" style={{ marginBottom: 16, flexShrink: 0 }}>
          <Button icon={<ArrowLeftOutlined />} onClick={() => navigate(-1)}>
            返回
          </Button>
          <Avatar size={48} icon={<UserOutlined />} src={(resident as any)?.facePhoto}>
            {headerName?.[0]}
          </Avatar>
          <div>
            <Title level={4} style={{ margin: 0 }}>
              {headerName}
            </Title>
            <Text type="secondary">{maskIdCard((resident as any)?.idCardNo)}</Text>
          </div>
          {resident && (
            <>
              <Tag
                color={(StatusColors.ResidentStatus as any)[(resident as any).status]}
              >
                {EnumLabels.ResidentStatus[
                  (resident as any).status as keyof typeof EnumLabels.ResidentStatus
                ] ?? (resident as any).status}
              </Tag>
              <Tag color="blue">
                {EnumLabels.GuaranteeType[
                  (resident as any).guaranteeType as keyof typeof EnumLabels.GuaranteeType
                ] ?? '-'}
              </Tag>
            </>
          )}
        </Space>

        {residentLoading ? (
          <div style={{ textAlign: 'center', padding: 48 }}>
            <Spin />
          </div>
        ) : !resident ? (
          <Empty description="居民不存在" />
        ) : (
          <Tabs
            defaultActiveKey="profile"
            style={{ flex: 1, display: 'flex', flexDirection: 'column', minHeight: 0 }}
            tabBarStyle={{ flexShrink: 0, marginBottom: 16 }}
            className="resident-360-tabs"
            items={[
              { key: 'profile', label: '档案', children: <ProfileTab record={resident} /> },
              { key: 'family', label: '家庭', children: <FamilyTab residentId={id} /> },
              { key: 'living', label: '居住就业', children: <LivingTab residentId={id} /> },
              { key: 'attendance', label: '考勤', children: <AttendanceTab residentId={id} /> },
              { key: 'history', label: '申请历史', children: <HistoryTab residentId={id} /> },
              { key: 'alerts', label: '预警', children: <AlertsTab residentId={id} /> },
            ]}
          />
        )}
      </Card>
    </div>
  );
};

// =============================================================================
// 档案 Tab
// =============================================================================
const ProfileTab: React.FC<{ record: Resident }> = ({ record }) => (
  <>
    <Descriptions bordered column={2} size="middle">
      <Descriptions.Item label="姓名">{(record as any).fullName ?? '-'}</Descriptions.Item>
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
      <Descriptions.Item label="联系电话">
        {maskPhone((record as any).phone)}
      </Descriptions.Item>
      <Descriptions.Item label="邮箱" span={2}>
        {(record as any).email ?? '-'}
      </Descriptions.Item>
    </Descriptions>

    <Card type="inner" title="证件与证明照片" style={{ marginTop: 16 }}>
      <Space wrap size={12}>
        {[
          { key: 'idCardFrontPhoto', label: '身份证正面' },
          { key: 'idCardBackPhoto', label: '身份证背面' },
          { key: 'facePhoto', label: '人脸照片' },
          { key: 'householdBookPhoto', label: '户口本' },
          { key: 'bankFlowPhoto', label: '银行流水' },
          { key: 'marriageCertPhoto', label: '婚姻证明' },
          { key: 'incomeCertPhoto', label: '收入证明' },
          { key: 'socialSecurityPhoto', label: '社保证明' },
        ].map(({ key, label }) => {
          const url = (record as any)[key];
          return (
            <div key={key} style={{ textAlign: 'center', width: 120 }}>
              {url ? (
                <Image
                  src={url}
                  alt={label}
                  width={120}
                  height={80}
                  style={{ objectFit: 'cover', borderRadius: 4 }}
                />
              ) : (
                <div
                  style={{
                    width: 120,
                    height: 80,
                    background: '#f5f5f5',
                    borderRadius: 4,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: '#bfbfbf',
                    fontSize: 12,
                  }}
                >
                  未提供
                </div>
              )}
              <div style={{ fontSize: 12, color: '#666', marginTop: 4 }}>{label}</div>
            </div>
          );
        })}
      </Space>
    </Card>
  </>
);

// =============================================================================
// 家庭 Tab
// =============================================================================
const FamilyTab: React.FC<{ residentId: string }> = ({ residentId }) => {
  const { data, loading } = useRequest(
    async () => {
      // 查申请人 = residentId 的家庭(主申请人视角)
      const env = await householdService.list(
        qb(OT.Household).eq('applicant', residentId).page(1, 5).build(),
      );
      const household = env.data[0] as Household | undefined;
      if (!household) return { household: null, members: [] as HouseholdMember[] };
      const memEnv = await householdMemberService.list(
        qb(OT.HouseholdMember).eq('household', (household as any).id).page(1, 50).build(),
      );
      return { household, members: memEnv.data as HouseholdMember[] };
    },
    { refreshDeps: [residentId] },
  );

  if (loading) return <Spin />;
  if (!data?.household) return <Empty description="该居民暂无家庭" />;

  const h = data.household as any;
  return (
    <>
      <Descriptions bordered column={2} size="middle">
        <Descriptions.Item label="主申请人">{h.applicantName}</Descriptions.Item>
        <Descriptions.Item label="家庭人口数">{h.householdSize}</Descriptions.Item>
        <Descriptions.Item label="保障类型">
          {EnumLabels.GuaranteeType[
            h.guaranteeType as keyof typeof EnumLabels.GuaranteeType
          ] ?? '-'}
        </Descriptions.Item>
        <Descriptions.Item label="状态">
          <Tag color={(StatusColors.HouseholdStatus as any)[h.status]}>
            {EnumLabels.HouseholdStatus[h.status as keyof typeof EnumLabels.HouseholdStatus] ??
              h.status}
          </Tag>
        </Descriptions.Item>
        <Descriptions.Item label="轮候序号">{h.waitlistNo ?? '-'}</Descriptions.Item>
        <Descriptions.Item label="家庭 ID">{h.id}</Descriptions.Item>
      </Descriptions>

      <Card type="inner" title="家庭成员" style={{ marginTop: 16 }}>
        {data.members.length === 0 ? (
          <Empty description="无其他家庭成员" />
        ) : (
          <List
            dataSource={data.members}
            renderItem={(m: any) => (
              <List.Item>
                <List.Item.Meta
                  avatar={<Avatar icon={<UserOutlined />} />}
                  title={`${m.relation ?? '-'} · ${m.resident}`}
                  description={`加入时间:${m.joinedAt ?? '-'}`}
                />
              </List.Item>
            )}
          />
        )}
      </Card>
    </>
  );
};

// =============================================================================
// 居住 + 就业 Tab
// =============================================================================
const LivingTab: React.FC<{ residentId: string }> = ({ residentId }) => {
  const { data, loading } = useRequest(
    async () => {
      const [resEnv, empEnv] = await Promise.all([
        residenceService.list(
          qb(OT.Residence).eq('resident', residentId).orderBy('effectiveFrom', 'DESC').page(1, 20).build(),
        ),
        employmentService.list(
          qb(OT.Employment).eq('resident', residentId).orderBy('effectiveFrom', 'DESC').page(1, 20).build(),
        ),
      ]);
      return {
        residences: resEnv.data as Residence[],
        employments: empEnv.data as Employment[],
      };
    },
    { refreshDeps: [residentId] },
  );

  if (loading) return <Spin />;

  return (
    <Space direction="vertical" size={16} style={{ width: '100%' }}>
      <Card type="inner" title="居住地址">
        {!data?.residences.length ? (
          <Empty description="无居住记录" />
        ) : (
          <List
            dataSource={data.residences}
            renderItem={(r: any) => (
              <List.Item>
                <List.Item.Meta
                  title={`${EnumLabels.ResidenceType[r.residenceType as keyof typeof EnumLabels.ResidenceType] ?? r.residenceType} · 生效 ${r.effectiveFrom ?? '-'}`}
                  description={r.address?.detail ?? '-'}
                />
              </List.Item>
            )}
          />
        )}
      </Card>

      <Card type="inner" title="就业信息">
        {!data?.employments.length ? (
          <Empty description="无就业记录" />
        ) : (
          <List
            dataSource={data.employments}
            renderItem={(e: any) => (
              <List.Item>
                <List.Item.Meta
                  title={`${e.employer ?? '-'} · ${e.position ?? '-'}`}
                  description={
                    <Space>
                      <Tag>
                        {EnumLabels.EmploymentAddressType[
                          e.addressType as keyof typeof EnumLabels.EmploymentAddressType
                        ] ?? e.addressType}
                      </Tag>
                      <span>月收入:¥{e.monthlyIncome ?? '-'}</span>
                      <span>生效:{e.effectiveFrom ?? '-'}</span>
                    </Space>
                  }
                />
              </List.Item>
            )}
          />
        )}
      </Card>
    </Space>
  );
};

// =============================================================================
// 考勤 Tab
// =============================================================================
const AttendanceTab: React.FC<{ residentId: string }> = ({ residentId }) => {
  const { data, loading } = useRequest(
    () =>
      attendanceFactService
        .list(
          qb(OT.AttendanceFact)
            .eq('resident', residentId)
            .orderBy('checkIn', 'DESC')
            .page(1, 50)
            .build(),
        )
        .then((env) => env.data as AttendanceFact[]),
    { refreshDeps: [residentId] },
  );

  const columns: ColumnsType<AttendanceFact> = [
    {
      title: '时间',
      dataIndex: 'checkIn',
      width: 200,
      render: (v: string) => (v ? new Date(v).toLocaleString() : '-'),
    },
    {
      title: '状态',
      dataIndex: 'attendanceStatus',
      width: 110,
      render: (v: any) => (
        <Tag color={(StatusColors.AttendanceStatus as any)[v]}>
          {EnumLabels.AttendanceStatus[v as keyof typeof EnumLabels.AttendanceStatus] ?? v}
        </Tag>
      ),
    },
    {
      title: '类型',
      dataIndex: 'attendanceType',
      width: 110,
      render: (v: any) =>
        EnumLabels.AttendanceType[v as keyof typeof EnumLabels.AttendanceType] ?? v,
    },
    {
      title: '方式',
      dataIndex: 'attendanceMode',
      width: 110,
      render: (v: any) =>
        EnumLabels.AttendanceMode[v as keyof typeof EnumLabels.AttendanceMode] ?? v,
    },
    {
      title: '准时性',
      dataIndex: 'attendanceTimeliness',
      width: 100,
      render: (v: any) =>
        EnumLabels.AttendanceTimeliness[
          v as keyof typeof EnumLabels.AttendanceTimeliness
        ] ?? v,
    },
  ];

  return (
    <Table
      rowKey="id"
      columns={columns}
      dataSource={data ?? []}
      loading={loading}
      pagination={{ pageSize: 20, showTotal: (t) => `共 ${t} 条` }}
      size="middle"
    />
  );
};

// =============================================================================
// 申请历史 Tab(合并多种申请,按时间倒序)
// =============================================================================
interface HistoryRow {
  id: string;
  type: string;
  typeColor: string;
  detail: string;
  status: string;
  time: string;
}

const HistoryTab: React.FC<{ residentId: string }> = ({ residentId }) => {
  const { data, loading } = useRequest(
    async () => {
      const filter = (objectType: string) =>
        qb(objectType).eq('resident', residentId).page(1, 20).build();
      const [leaveEnv, migrantEnv, eligibilityEnv, terminationEnv, makeupEnv, residenceChEnv, employmentChEnv, memberChEnv] =
        await Promise.all([
          leaveService.list(filter(OT.Leave)),
          migrantWorkService.list(filter(OT.MigrantWork)),
          eligibilityApplicationService.list(
            qb(OT.EligibilityApplication).eq('applicant', residentId).page(1, 20).build(),
          ),
          eligibilityTerminationService.list(filter(OT.EligibilityTermination)),
          attendanceMakeupService.list(filter(OT.AttendanceMakeup)),
          residenceChangeService.list(filter(OT.ResidenceChange)),
          employmentChangeService.list(filter(OT.EmploymentChange)),
          householdMemberChangeService.list(filter(OT.HouseholdMemberChange)),
        ]);
      const rows: HistoryRow[] = [];
      const push = (env: any, type: string, color: string, detailFn: (r: any) => string) => {
        env.data.forEach((r: any) => {
          rows.push({
            id: r.id,
            type,
            typeColor: color,
            detail: detailFn(r),
            status: r.status,
            time: r.submittedAt ?? r.createAt ?? '',
          });
        });
      };
      push(leaveEnv, '请假', 'blue', (r) => `${r.leaveType} · ${r.startDate}~${r.endDate}`);
      push(migrantEnv, '备案', 'purple', (r) => `${r.type} · ${r.startDate}~${r.endDate}`);
      push(eligibilityEnv, '资格申请', 'cyan', (r) =>
        EnumLabels.ApplicationType[r.applicationType as keyof typeof EnumLabels.ApplicationType] ?? r.applicationType,
      );
      push(terminationEnv, '资格终止', 'red', (r) =>
        EnumLabels.TerminationReason[r.reason as keyof typeof EnumLabels.TerminationReason] ?? r.reason,
      );
      push(makeupEnv, '补卡', 'gold', (r) => r.reason ?? '-');
      push(residenceChEnv, '居住变更', 'geekblue', (r) => r.reason ?? '-');
      push(employmentChEnv, '就业变更', 'magenta', (r) => r.reason ?? '-');
      push(memberChEnv, '成员变更', 'volcano', (r) => `${r.changeType} · ${r.reason ?? ''}`);
      rows.sort((a, b) => (b.time > a.time ? 1 : -1));
      return rows;
    },
    { refreshDeps: [residentId] },
  );

  const columns: ColumnsType<HistoryRow> = [
    {
      title: '类型',
      dataIndex: 'type',
      width: 110,
      render: (v: string, r) => <Tag color={r.typeColor}>{v}</Tag>,
    },
    { title: '编号', dataIndex: 'id', width: 100, render: (v: string) => `#${v.slice(-6)}` },
    { title: '内容', dataIndex: 'detail', ellipsis: true },
    {
      title: '状态',
      dataIndex: 'status',
      width: 110,
      render: (v: any) => (
        <Tag color={(StatusColors.ApplicationStatus as any)[v]}>
          {EnumLabels.ApplicationStatus[v as keyof typeof EnumLabels.ApplicationStatus] ?? v}
        </Tag>
      ),
    },
    {
      title: '时间',
      dataIndex: 'time',
      width: 180,
      render: (v: string) => (v ? new Date(v).toLocaleString() : '-'),
    },
  ];

  return (
    <Table
      rowKey={(r) => `${r.type}-${r.id}`}
      columns={columns}
      dataSource={data ?? []}
      loading={loading}
      pagination={{ pageSize: 20, showTotal: (t) => `共 ${t} 条` }}
      size="middle"
    />
  );
};

// =============================================================================
// 预警 Tab
// =============================================================================
const AlertsTab: React.FC<{ residentId: string }> = ({ residentId }) => {
  const { data, loading } = useRequest(
    () =>
      attendanceFactService
        .list(
          qb(OT.AttendanceFact)
            .eq('resident', residentId)
            .in('attendanceStatus', ['INVALID', 'MISSED'])
            .orderBy('checkIn', 'DESC')
            .page(1, 50)
            .build(),
        )
        .then((env) => env.data),
    { refreshDeps: [residentId] },
  );

  if (loading) return <Spin />;
  if (!data?.length) return <Empty description="该居民暂无预警" />;

  return (
    <List
      dataSource={data}
      renderItem={(item: any) => (
        <List.Item>
          <List.Item.Meta
            avatar={
              <Tag color={item.attendanceStatus === 'MISSED' ? 'red' : 'orange'}>
                {item.attendanceStatus === 'MISSED' ? '红色' : '警告'}
              </Tag>
            }
            title={
              item.attendanceStatus === 'MISSED'
                ? '未在规定时间打卡'
                : '打卡异常(位置/人脸不匹配)'
            }
            description={`触发时间:${new Date(item.checkIn).toLocaleString()}`}
          />
        </List.Item>
      )}
    />
  );
};

export default ResidentDetail;
