import { Form, InputNumber, Modal, message, Select } from 'antd';
import React, { useState } from 'react';
import EntityReferSelect from '@/components/EntityReferSelect';
import { householdService } from '@/services/domains/household';
import { OT } from '@/services/ontology/object-types';
import type { qb } from '@/services/ontology/query';
import { OntologyError, toAntdFieldErrors } from '@/services/ontology/result';
import { dictStore } from '@/stores/dictStore';

export interface HouseholdFormValues {
  applicant: string;
  guaranteeType: string;
  householdSize: number;
}

export interface HouseholdCreateModalProps {
  open: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

const HouseholdCreateModal: React.FC<HouseholdCreateModalProps> = ({
  open,
  onClose,
  onSuccess,
}) => {
  const [form] = Form.useForm<HouseholdFormValues>();
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      setSubmitting(true);
      const payload: Record<string, any> = { ...values };
      Object.keys(payload).forEach((k) => {
        if (payload[k] === '' || payload[k] === undefined) delete payload[k];
      });
      await householdService.add(payload);
      message.success('新增保障家庭成功');
      form.resetFields();
      onSuccess?.();
      onClose();
    } catch (err) {
      if (err instanceof OntologyError) {
        const fieldErrs = err.fieldErrors;
        if (fieldErrs && fieldErrs.length > 0) {
          form.setFields(toAntdFieldErrors(fieldErrs) as any);
        } else {
          message.error(err.message ?? '提交失败');
        }
      } else if ((err as any)?.errorFields) {
        return;
      } else {
        message.error((err as any)?.message ?? '提交失败');
      }
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Modal
      title="新增保障家庭"
      open={open}
      onCancel={() => {
        form.resetFields();
        onClose();
      }}
      onOk={handleSubmit}
      confirmLoading={submitting}
      okText="提交"
      cancelText="取消"
      width={520}
      destroyOnClose
      styles={{ footer: { textAlign: 'right' } }}
    >
      <Form
        form={form}
        layout="vertical"
        preserve={false}
        validateTrigger={['onBlur', 'onChange']}
      >
        <Form.Item
          label="主申请人"
          name="applicant"
          rules={[{ required: true, message: '请选择主申请人' }]}
          tooltip="只能选择已激活的居民"
          extra={
            <span style={{ color: '#888', fontSize: 12 }}>
              如未找到目标居民,请先到"保障居民"页面新建并激活。
            </span>
          }
        >
          <EntityReferSelect
            objectType={OT.Resident}
            labelField="fullName"
            searchField="fullName"
            placeholder="按姓名搜索"
            extraFilter={(b: ReturnType<typeof qb>) =>
              b.eq('status', 'ACTIVATED')
            }
          />
        </Form.Item>
        <Form.Item
          label="保障类型"
          name="guaranteeType"
          rules={[{ required: true, message: '请选择保障类型' }]}
        >
          <Select
            placeholder="选择保障类型"
            options={dictStore.options('GuaranteeType')}
          />
        </Form.Item>
        <Form.Item
          label="家庭人口数"
          name="householdSize"
          rules={[
            { required: true, message: '请输入家庭人口数' },
            {
              type: 'number',
              min: 1,
              message: '家庭人口数必须大于 0',
            },
          ]}
        >
          <InputNumber
            min={1}
            max={20}
            style={{ width: '100%' }}
            placeholder="如 3"
          />
        </Form.Item>
        <div style={{ color: '#888', fontSize: 12, marginTop: -4 }}>
          创建后家庭处于"草稿"状态,可在详情页继续邀请家庭成员、登记居住/工作信息等,
          完成后提交进入"生效中"。
        </div>
      </Form>
    </Modal>
  );
};

export default HouseholdCreateModal;
