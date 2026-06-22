/**
 * 通用审批详情 — /approval/detail/:type/:id
 *
 * type 决定 objectType,从对应 service 拉详情。
 * 支持的 type:
 *   - leave / migrant / material(=eligibility) / makeup
 *   - residence-change / employment-change / member-change / termination
 */

import React, { useEffect, useState } from 'react';
import {
  Button,
  Card,
  Descriptions,
  Empty,
  Form,
  Input,
  message,
  Modal,
  Space,
  Spin,
  Tag,
  Timeline,
} from 'antd';
import { useNavigate, useParams } from '@umijs/max';
import { approvalService } from '@/services/domains/approval';
import { leaveService } from '@/services/domains/leave';
import { migrantWorkService } from '@/services/domains/migrant-work';
import {
  attendanceMakeupService,
} from '@/services/domains/attendance';
import {
  eligibilityApplicationService,
  eligibilityTerminationService,
} from '@/services/domains/eligibility';
import {
  employmentChangeService,
  householdMemberChangeService,
  residenceChangeService,
} from '@/services/domains/change';
import { OT } from '@/services/ontology/object-types';
import { EnumLabels, StatusColors } from '@/utils/enum-options';

const TYPE_TO_CONFIG: Record<
  string,
  { service: any; objectType: string; title: string }
> = {
  leave: { service: leaveService, objectType: OT.Leave, title: '请假' },
  migrant: { service: migrantWorkService, objectType: OT.MigrantWork, title: '备案' },
  material: {
    service: eligibilityApplicationService,
    objectType: OT.EligibilityApplication,
    title: '资格申请',
  },
  makeup: { service: attendanceMakeupService, objectType: OT.AttendanceMakeup, title: '补卡' },
  'residence-change': {
    service: residenceChangeService,
    objectType: OT.ResidenceChange,
    title: '居住地址变更',
  },
  'employment-change': {
    service: employmentChangeService,
    objectType: OT.EmploymentChange,
    title: '就业变更',
  },
  'member-change': {
    service: householdMemberChangeService,
    objectType: OT.HouseholdMemberChange,
    title: '家庭成员变更',
  },
  termination: {
    service: eligibilityTerminationService,
    objectType: OT.EligibilityTermination,
    title: '资格终止',
  },
};

const ApprovalDetail: React.FC = () => {
  const { type = 'material', id = '' } = useParams<{ type: string; id: string }>();
  const navigate = useNavigate();
  const config = TYPE_TO_CONFIG[type] ?? TYPE_TO_CONFIG.material;

  const [detail, setDetail] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [modalType, setModalType] = useState<'approve' | 'reject' | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [form] = Form.useForm();

  async function load() {
    setLoading(true);
    try {
      const env = await config.service.detail(id);
      setDetail(env.data);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id, type]);

  const handleSubmit = async () => {
    if (!modalType) return;
    const values = await form.validateFields();
    setSubmitting(true);
    try {
      if (modalType === 'approve') {
        await approvalService.approve(config.objectType, id, values.opinion);
        message.success('已通过');
      } else {
        await approvalService.reject(config.objectType, id, values.opinion);
        message.success('已驳回');
      }
      setModalType(null);
      form.resetFields();
      load();
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div style={{ padding: 24 }}>
      <Card>
        <Space direction="vertical" size="large" style={{ width: '100%' }}>
          <Button onClick={() => navigate(-1)}>
            返回
          </Button>
          {loading ? (
            <div style={{ textAlign: 'center', padding: 48 }}>
              <Spin />
            </div>
          ) : !detail ? (
            <Empty description="未找到该申请" />
          ) : (
            <>
              <Descriptions title={`${config.title}详情 #${id.slice(-6)}`} bordered column={2}>
                <Descriptions.Item label="编号">#{id.slice(-6)}</Descriptions.Item>
                <Descriptions.Item label="状态">
                  <Tag color={(StatusColors.ApplicationStatus as any)[detail.status]}>
                    {EnumLabels.ApplicationStatus[detail.status as keyof typeof EnumLabels.ApplicationStatus] ??
                      detail.status}
                  </Tag>
                </Descriptions.Item>
                {detail.resident && (
                  <Descriptions.Item label="居民">{String(detail.resident)}</Descriptions.Item>
                )}
                {detail.applicant && (
                  <Descriptions.Item label="申请人">{String(detail.applicant)}</Descriptions.Item>
                )}
                {detail.household && (
                  <Descriptions.Item label="家庭">{String(detail.household)}</Descriptions.Item>
                )}
                {detail.startDate && (
                  <Descriptions.Item label="开始日期">{detail.startDate}</Descriptions.Item>
                )}
                {detail.endDate && (
                  <Descriptions.Item label="结束日期">{detail.endDate}</Descriptions.Item>
                )}
                {detail.reason && (
                  <Descriptions.Item label="事由" span={2}>
                    {detail.reason}
                  </Descriptions.Item>
                )}
                <Descriptions.Item label="提交时间">
                  {detail.submittedAt ? new Date(detail.submittedAt).toLocaleString() : '-'}
                </Descriptions.Item>
                <Descriptions.Item label="审批人">{detail.approver ?? '-'}</Descriptions.Item>
                {detail.approvalOpinion && (
                  <Descriptions.Item label="审批意见" span={2}>
                    {detail.approvalOpinion}
                  </Descriptions.Item>
                )}
              </Descriptions>

              {detail.status === 'UNDER_APPROVAL' && (
                <Space>
                  <Button
                    type="primary"
                    onClick={() => setModalType('approve')}
                  >
                    通过
                  </Button>
                  <Button danger onClick={() => setModalType('reject')}>
                    驳回
                  </Button>
                </Space>
              )}

              <Card type="inner" title="审批时间线" size="small">
                <Timeline
                  items={[
                    detail.submittedAt && {
                      color: 'blue',
                      children: `${new Date(detail.submittedAt).toLocaleString()} 提交申请(${detail.submittedBy ?? ''})`,
                    },
                    detail.approvalTime && {
                      color: detail.approvalResult === 'REJECTED' ? 'red' : 'green',
                      children: `${new Date(detail.approvalTime).toLocaleString()} ${detail.approvalResult === 'REJECTED' ? '已驳回' : '已通过'}(${detail.approver ?? ''})`,
                    },
                  ].filter(Boolean) as any}
                />
              </Card>
            </>
          )}
        </Space>
      </Card>

      <Modal
        title={modalType === 'approve' ? '审批通过' : '审批驳回'}
        open={!!modalType}
        onOk={handleSubmit}
        onCancel={() => {
          setModalType(null);
          form.resetFields();
        }}
        confirmLoading={submitting}
        okText="确认提交"
      >
        <Form form={form} layout="vertical">
          <Form.Item
            name="opinion"
            label={modalType === 'approve' ? '审批意见' : '驳回原因'}
            rules={modalType === 'reject' ? [{ required: true, message: '请填写驳回原因' }] : []}
          >
            <Input.TextArea rows={4} placeholder="请输入审批意见..." />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default ApprovalDetail;
