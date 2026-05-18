import React from 'react';
import { Skeleton, Tag } from 'antd';
import { useNavigate, useParams } from '@umijs/max';
import { attendanceService } from '@/services/domains/attendance';
import type { Attendance } from '@/types/ontology/prh/entities/attendance';
import { EnumLabels, StatusColors } from '@/utils/enum-options';
import ResidentLink from '@/components/ResidentLink';
import {
  OmnibarDetailPage,
  useDetail,
  type DetailSection,
  type DetailTabItem,
  type StatusBadge,
} from '@/components/OmnibarPage';

function getStatusBadge(status: string | undefined): StatusBadge {
  const map: Record<string, StatusBadge['color']> = {
    VALID: 'success',
    INVALID: 'danger',
    MISSED: 'warning',
    PENDING: 'secondary',
    EXEMPTED: 'info',
  };
  return {
    text:
      EnumLabels.AttendanceStatus[status as keyof typeof EnumLabels.AttendanceStatus] ??
      status ??
      '-',
    color: map[status ?? ''] ?? 'secondary',
  };
}

const AttendanceDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const fetcher = React.useCallback(async (rid: string) => {
    const env = await attendanceService.detail(rid);
    return env.data as Attendance;
  }, []);
  const { data, loading, reload } = useDetail<Attendance>(id, fetcher);

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
          label: '居民',
          value: r.resident ? <ResidentLink id={String(r.resident)} /> : '-',
        },
        {
          label: '出勤类型',
          value:
            EnumLabels.AttendanceType[
              r.attendanceType as keyof typeof EnumLabels.AttendanceType
            ] ?? r.attendanceType,
        },
        {
          label: '状态',
          value: (
            <Tag color={(StatusColors.AttendanceStatus as any)[r.status]}>
              {EnumLabels.AttendanceStatus[
                r.status as keyof typeof EnumLabels.AttendanceStatus
              ] ?? r.status}
            </Tag>
          ),
          name: 'status',
          editType: 'select',
          options: Object.entries(EnumLabels.AttendanceStatus).map(([value, label]) => ({
            value,
            label,
          })),
        },
        {
          label: '打卡方式',
          value:
            EnumLabels.AttendanceMode[r.mode as keyof typeof EnumLabels.AttendanceMode] ?? r.mode,
        },
        {
          label: '打卡时间',
          value: r.checkIn ? new Date(r.checkIn).toLocaleString() : '-',
        },
      ],
    },
    {
      key: 'device',
      title: '设备与位置',
      defaultCollapsed: true,
      fields: [
        { label: '应打卡截止', value: r.deadline ? new Date(r.deadline).toLocaleString() : '-' },
        {
          label: '设备',
          value: r.deviceId ?? '-',
          name: 'deviceId',
          editType: 'input',
        },
        {
          label: 'IP',
          value: r.ipAddress ?? '-',
          name: 'ipAddress',
          editType: 'input',
        },
        {
          label: '定位',
          value: r.location
            ? `${r.location.longitude}, ${r.location.latitude}`
            : '-',
        },
      ],
    },
  ];

  const tabs: DetailTabItem[] = [
    {
      key: 'detail',
      label: '打卡详情',
      content: <div style={{ padding: 16, color: '#595959' }}>详细打卡轨迹/人脸照片等数据</div>,
    },
  ];

  return (
    <div style={{ padding: 16, height: 'calc(100vh - 64px - 45px)' }}>
      <OmnibarDetailPage
        title={`打卡 #${String(r.id ?? '').slice(-6)}`}
        statusBadge={getStatusBadge(r.status)}
        onBack={() => navigate('/monitor/attendance')}
        sections={sections}
        tabs={tabs}
        footerFields={[
          { label: '创建人', value: r.creator ?? '-' },
          { label: '创建时间', value: r.createAt ? new Date(r.createAt).toLocaleString() : '-' },
          { label: '修改人', value: r.modifier ?? '-' },
          { label: '修改时间', value: r.modifyAt ? new Date(r.modifyAt).toLocaleString() : '-' },
        ]}
        editable
        record={r}
        onSave={async (values) => {
          await attendanceService.modify({ ...r, ...values });
        }}
        onSaved={reload}
      />
    </div>
  );
};

export default AttendanceDetail;
