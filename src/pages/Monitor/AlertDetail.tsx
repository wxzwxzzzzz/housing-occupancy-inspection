import React, { useEffect, useState } from 'react';
import { Button, Card, Descriptions, Empty, Spin, Tag, Timeline } from 'antd';
import { ArrowLeftOutlined } from '@ant-design/icons';
import { useNavigate, useParams } from '@umijs/max';
import { attendanceService } from '@/services/domains/attendance';
import type { Attendance } from '@/types/ontology/prh/entities/attendance';
import { EnumLabels, StatusColors } from '@/utils/enum-options';

const AlertDetail: React.FC = () => {
  const { id = '' } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [attendance, setAttendance] = useState<Attendance | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!id) return;
    setLoading(true);
    attendanceService
      .detail(id)
      .then((res) => setAttendance(res.data))
      .finally(() => setLoading(false));
  }, [id]);

  return (
    <div style={{ padding: 24 }}>
      <Card
        title={
          <span>
            <Button
              type="link"
              icon={<ArrowLeftOutlined />}
              onClick={() => navigate(-1)}
              style={{ paddingLeft: 0 }}
            >
              返回
            </Button>
            预警详情 #{id.slice(-6)}
          </span>
        }
      >
        {loading ? (
          <div style={{ textAlign: 'center', padding: 48 }}>
            <Spin />
          </div>
        ) : !attendance ? (
          <Empty description="未找到对应的考勤记录" />
        ) : (
          <>
            <Descriptions bordered column={2} size="middle">
              <Descriptions.Item label="居民">{String(attendance.resident)}</Descriptions.Item>
              <Descriptions.Item label="出勤类型">
                {EnumLabels.AttendanceType[attendance.attendanceType as keyof typeof EnumLabels.AttendanceType]}
              </Descriptions.Item>
              <Descriptions.Item label="状态">
                <Tag color={(StatusColors.AttendanceStatus as any)[attendance.status]}>
                  {EnumLabels.AttendanceStatus[attendance.status as keyof typeof EnumLabels.AttendanceStatus]}
                </Tag>
              </Descriptions.Item>
              <Descriptions.Item label="打卡方式">
                {EnumLabels.AttendanceMode[attendance.mode as keyof typeof EnumLabels.AttendanceMode]}
              </Descriptions.Item>
              <Descriptions.Item label="打卡时间">
                {new Date(attendance.checkIn).toLocaleString()}
              </Descriptions.Item>
              <Descriptions.Item label="应打卡截止">
                {new Date(attendance.deadline).toLocaleString()}
              </Descriptions.Item>
              <Descriptions.Item label="设备">{attendance.deviceId ?? '-'}</Descriptions.Item>
              <Descriptions.Item label="IP">{attendance.ipAddress ?? '-'}</Descriptions.Item>
              <Descriptions.Item label="定位" span={2}>
                {attendance.location
                  ? `${(attendance.location as any).longitude}, ${(attendance.location as any).latitude}`
                  : '-'}
              </Descriptions.Item>
            </Descriptions>

            <Card type="inner" title="处置时间线" style={{ marginTop: 24 }}>
              <Timeline
                items={[
                  {
                    color: 'red',
                    children: `${new Date(attendance.checkIn).toLocaleString()} 触发预警(状态:${EnumLabels.AttendanceStatus[attendance.status as keyof typeof EnumLabels.AttendanceStatus]})`,
                  },
                  {
                    color: 'gray',
                    children: '等待处置(请到「预警处置」页操作)',
                  },
                ]}
              />
            </Card>
          </>
        )}
      </Card>
    </div>
  );
};

export default AlertDetail;
