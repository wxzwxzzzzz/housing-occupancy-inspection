import { DatePicker, Form, Input, Modal, message, Select } from 'antd';
import dayjs, { type Dayjs } from 'dayjs';
import React, { useState } from 'react';
import { residentService } from '@/services/domains/resident';
import { OntologyError, toAntdFieldErrors } from '@/services/ontology/result';
import { dictStore } from '@/stores/dictStore';

export interface ResidentFormValues {
  fullName: string;
  idCardNo: string;
  phone: string;
  email?: string;
  gender?: string;
  birthDate?: Dayjs;
  maritalStatus?: string;
  guaranteeType?: string;
}

export interface ResidentCreateModalProps {
  open: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

/** 18 位身份证号格式(简化版,只校验长度+末位 X) */
const ID_CARD_RE = /^\d{17}[\dXx]$/;
/** 大陆手机号 */
const PHONE_RE = /^1[3-9]\d{9}$/;

const ResidentCreateModal: React.FC<ResidentCreateModalProps> = ({
  open,
  onClose,
  onSuccess,
}) => {
  const [form] = Form.useForm<ResidentFormValues>();
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      setSubmitting(true);
      const payload: Record<string, any> = {
        ...values,
        birthDate: values.birthDate
          ? values.birthDate.format('YYYY-MM-DD')
          : undefined,
      };
      Object.keys(payload).forEach((k) => {
        if (payload[k] === '' || payload[k] === undefined) delete payload[k];
      });
      await residentService.add(payload);
      message.success('新增居民成功');
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
      title="新增保障居民"
      open={open}
      onCancel={() => {
        form.resetFields();
        onClose();
      }}
      onOk={handleSubmit}
      confirmLoading={submitting}
      okText="提交"
      cancelText="取消"
      width={640}
      destroyOnClose
      // antd 5 默认右对齐;显式声明一遍以防被全局样式干扰
      styles={{ footer: { textAlign: 'right' } }}
    >
      <Form
        form={form}
        layout="vertical"
        preserve={false}
        validateTrigger={['onBlur', 'onChange']}
      >
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: '1fr 1fr',
            gap: '0 16px',
          }}
        >
          <Form.Item
            label="姓名"
            name="fullName"
            rules={[
              { required: true, message: '请输入姓名' },
              { max: 64, message: '不超过 64 个字符' },
            ]}
          >
            <Input placeholder="居民姓名" />
          </Form.Item>
          <Form.Item
            label="身份证号"
            name="idCardNo"
            rules={[
              { required: true, message: '请输入身份证号' },
              { pattern: ID_CARD_RE, message: '身份证号格式不正确(18 位)' },
            ]}
          >
            <Input placeholder="18 位身份证号" maxLength={18} />
          </Form.Item>
          <Form.Item
            label="手机号"
            name="phone"
            rules={[
              { required: true, message: '请输入手机号' },
              { pattern: PHONE_RE, message: '手机号格式不正确' },
            ]}
          >
            <Input placeholder="11 位手机号" maxLength={11} />
          </Form.Item>
          <Form.Item
            label="邮箱"
            name="email"
            rules={[{ type: 'email', message: '邮箱格式不正确' }]}
          >
            <Input placeholder="可选" />
          </Form.Item>
          <Form.Item label="性别" name="gender">
            <Select
              placeholder="选择性别"
              allowClear
              options={dictStore.options('Gender')}
            />
          </Form.Item>
          <Form.Item label="出生日期" name="birthDate">
            <DatePicker
              style={{ width: '100%' }}
              disabledDate={(d) => d && d.isAfter(dayjs())}
            />
          </Form.Item>
          <Form.Item label="婚姻状况" name="maritalStatus">
            <Select
              placeholder="选择婚姻状况"
              allowClear
              options={dictStore.options('MaritalStatus')}
            />
          </Form.Item>
          <Form.Item label="保障类型" name="guaranteeType">
            <Select
              placeholder="选择保障类型"
              allowClear
              options={dictStore.options('GuaranteeType')}
            />
          </Form.Item>
        </div>
        <div style={{ color: '#888', fontSize: 12, marginTop: 4 }}>
          身份证、户口本、银行流水等材料请在创建后,进入居民详情"材料附件"区域上传。
        </div>
      </Form>
    </Modal>
  );
};

export default ResidentCreateModal;
