import { ScheduleOutlined } from '@ant-design/icons';
import { Button, DatePicker, Form, Modal, message } from 'antd';
import dayjs from 'dayjs';
import React, { useState } from 'react';
import ApplicationDetailPage from '@/components/ApplicationDetailPage';
import { eligibilityApplicationService } from '@/services/domains/eligibility';
import { OT } from '@/services/ontology/object-types';
import { dictLabel } from '@/stores/dictStore';
import type { EligibilityApplication } from '@/types/ontology/prh/entities/eligibility_application';

const EligibilityApplicationDetail: React.FC = () => {
  const [reviewOpen, setReviewOpen] = useState(false);
  const [reviewSubmitting, setReviewSubmitting] = useState(false);
  const [reviewForm] = Form.useForm();
  // 内部需要拿到 record + reload,只能通过 ApplicationDetailPage 的 extraHeaderActions 注入
  const [pending, setPending] = useState<{
    record: any;
    reload: () => void;
  } | null>(null);

  const handleReviewSubmit = async () => {
    if (!pending) return;
    try {
      const v = await reviewForm.validateFields();
      setReviewSubmitting(true);
      await eligibilityApplicationService.modify({
        ...pending.record,
        reviewStartDate: v.range[0]?.format('YYYY-MM-DD'),
        reviewEndDate: v.range[1]?.format('YYYY-MM-DD'),
      } as any);
      message.success('复审日期已录入');
      reviewForm.resetFields();
      setReviewOpen(false);
      pending.reload();
    } catch (err: any) {
      if (err?.errorFields) return;
      message.error(err?.message ?? '提交失败');
    } finally {
      setReviewSubmitting(false);
    }
  };

  return (
    <>
      <ApplicationDetailPage<EligibilityApplication>
        title="资质申请"
        objectType={OT.EligibilityApplication}
        service={eligibilityApplicationService as any}
        listPath="/eligibility/applications"
        extraHeaderActions={(r, reload) => {
          if (r.status !== 'COMPLETED') return [];
          return [
            {
              key: 'review',
              icon: <ScheduleOutlined />,
              label: r.reviewStartDate ? '修改复审日期' : '录入复审日期',
              onClick: () => {
                reviewForm.setFieldsValue({
                  range:
                    r.reviewStartDate && r.reviewEndDate
                      ? [dayjs(r.reviewStartDate), dayjs(r.reviewEndDate)]
                      : undefined,
                });
                setPending({ record: r, reload });
                setReviewOpen(true);
              },
            },
          ];
        }}
        buildSections={(r) => [
          {
            key: 'base',
            title: '申请信息',
            fields: [
              {
                label: '所属家庭',
                value: r.household
                  ? `家庭#${String(r.household).slice(-6)}`
                  : '-',
              },
              {
                label: '申请类型',
                value: dictLabel('ApplicationType', r.applicationType),
              },
              {
                label: '保障类型',
                value: dictLabel('GuaranteeType', r.guaranteeType),
              },
            ],
          },
          {
            key: 'review',
            title: '复审信息',
            defaultCollapsed: true,
            fields: [
              { label: '复审开始日期', value: r.reviewStartDate ?? '-' },
              { label: '复审结束日期', value: r.reviewEndDate ?? '-' },
            ],
          },
        ]}
      />

      <Modal
        title="录入复审日期"
        open={reviewOpen}
        onCancel={() => {
          reviewForm.resetFields();
          setReviewOpen(false);
        }}
        onOk={handleReviewSubmit}
        confirmLoading={reviewSubmitting}
        okText="保存"
        cancelText="取消"
        width={520}
        destroyOnClose
        styles={{ footer: { textAlign: 'right' } }}
      >
        <Form form={reviewForm} layout="vertical" preserve={false}>
          <Form.Item
            label="复审区间"
            name="range"
            rules={[{ required: true, message: '请选择复审日期区间' }]}
            extra="家庭在该区间内将进入年度复审周期。"
          >
            <DatePicker.RangePicker style={{ width: '100%' }} />
          </Form.Item>
        </Form>
      </Modal>
    </>
  );
};

export default EligibilityApplicationDetail;
