/**
 * 通用实体新建 Modal — EntityCreateModal
 *
 * 给所有"新增 XYZ"用例提供配置驱动的表单弹窗。
 *
 * 用法:
 *   <EntityCreateModal
 *     title="新增请假申请"
 *     open={open}
 *     onClose={...}
 *     onSuccess={...}
 *     service={leaveService}
 *     fields={[
 *       { name: 'resident', label: '申请居民', required: true,
 *         type: 'refer', referObjectType: OT.Resident, referLabelField: 'fullName' },
 *       { name: 'leaveType', label: '请假类型', required: true,
 *         type: 'refer', referObjectType: OT.LeaveType,
 *         referExtraFilter: (qb) => qb.eq('enable', 'true') },
 *       { name: 'startDate', label: '开始日期', required: true, type: 'date' },
 *       { name: 'endDate', label: '结束日期', required: true, type: 'date' },
 *       { name: 'reason', label: '请假原因', type: 'textarea' },
 *     ]}
 *   />
 *
 * 字段类型:
 *   - input    单行文本
 *   - textarea 多行文本
 *   - number   数字
 *   - date     单日期
 *   - dateRange 日期区间(对应两个 name,如 ['startDate','endDate'])
 *   - select   下拉(选项可静态传 options 或传 dictName 让 dictStore 接管)
 *   - refer    实体引用(EntityReferSelect)
 *   - switch   开关
 *   - address  PrhAddress 结构(行政区划 + 详细地址 + 坐标)
 */

import {
  DatePicker,
  Form,
  Input,
  InputNumber,
  Modal,
  message,
  Select,
  Switch,
} from 'antd';
import dayjs from 'dayjs';
import React, { useState } from 'react';
import EntityReferSelect from '@/components/EntityReferSelect';
import type { EntityApi } from '@/services/ontology/crud';
import type { QueryBuilder } from '@/services/ontology/query';
import { OntologyError, toAntdFieldErrors } from '@/services/ontology/result';
import { dictStore } from '@/stores/dictStore';

export interface FieldRule {
  /** 必填,如果是日期区间会校验两个字段 */
  required?: boolean;
  /** 文本最大长度 */
  max?: number;
  /** 数字下限 */
  min?: number;
  /** 自定义正则 */
  pattern?: RegExp;
  /** 错误提示 */
  message?: string;
}

export type FieldType =
  | 'input'
  | 'textarea'
  | 'number'
  | 'date'
  | 'dateRange'
  | 'select'
  | 'refer'
  | 'switch'
  | 'address';

export interface FieldConfig {
  /** 字段名,提交时作为 payload key */
  name: string;
  label: string;
  type: FieldType;
  required?: boolean;
  rules?: FieldRule[];
  placeholder?: string;
  /** 占两列(默认占一列) */
  span?: 1 | 2;
  /** select 静态选项 */
  options?: { label: string; value: any }[];
  /** select 走 dictStore */
  dictName?: string;
  /** refer 必填 */
  referObjectType?: string;
  referLabelField?: string;
  referSearchField?: string;
  referExtraFilter?: (qb: QueryBuilder) => void;
  /** dateRange:第二个字段名,如 endDate */
  rangeEndName?: string;
  /** 提示语 */
  extra?: React.ReactNode;
  tooltip?: React.ReactNode;
  /** 默认值 */
  initialValue?: any;
}

export interface EntityCreateModalProps<T = Record<string, any>> {
  open: boolean;
  onClose: () => void;
  onSuccess?: (created: T) => void;
  title: string;
  service: EntityApi<T>;
  fields: FieldConfig[];
  /** Modal 宽度,默认 640 */
  width?: number;
  /** 提交前对 payload 做加工(如果需要) */
  transformPayload?: (raw: Record<string, any>) => Record<string, any>;
  /** 表单顶部 / 底部插入的提示文案 */
  topSlot?: React.ReactNode;
  bottomSlot?: React.ReactNode;
}

function buildAntdRules(field: FieldConfig) {
  const rules: any[] = [];
  if (field.required) {
    rules.push({ required: true, message: `请输入${field.label}` });
  }
  if (field.rules) {
    field.rules.forEach((r) => {
      const item: any = { message: r.message };
      if (r.required !== undefined) item.required = r.required;
      if (r.max !== undefined) item.max = r.max;
      if (r.min !== undefined) item.min = r.min;
      if (r.pattern) item.pattern = r.pattern;
      rules.push(item);
    });
  }
  return rules;
}

function renderControl(field: FieldConfig) {
  switch (field.type) {
    case 'input':
      return (
        <Input
          placeholder={field.placeholder}
          maxLength={field.rules?.[0]?.max}
        />
      );
    case 'textarea':
      return <Input.TextArea rows={3} placeholder={field.placeholder} />;
    case 'number':
      return (
        <InputNumber
          style={{ width: '100%' }}
          placeholder={field.placeholder}
        />
      );
    case 'date':
      return <DatePicker style={{ width: '100%' }} />;
    case 'dateRange':
      return <DatePicker.RangePicker style={{ width: '100%' }} />;
    case 'switch':
      return <Switch />;
    case 'select': {
      const opts =
        field.options ??
        (field.dictName ? dictStore.options(field.dictName) : []);
      return (
        <Select
          allowClear
          placeholder={field.placeholder ?? `请选择${field.label}`}
          options={opts}
        />
      );
    }
    case 'refer':
      return (
        <EntityReferSelect
          objectType={field.referObjectType!}
          labelField={field.referLabelField ?? 'name'}
          searchField={field.referSearchField}
          extraFilter={field.referExtraFilter}
          placeholder={field.placeholder ?? `按名称搜索${field.label}`}
        />
      );
    case 'address':
      // 简化版:只输入详细地址(后续若要 region/coords 可扩展)
      return (
        <Input.TextArea
          rows={2}
          placeholder={field.placeholder ?? '详细地址'}
        />
      );
    default:
      return <Input />;
  }
}

function EntityCreateModalInner<T = Record<string, any>>(
  props: EntityCreateModalProps<T>,
) {
  const {
    open,
    onClose,
    onSuccess,
    title,
    service,
    fields,
    width = 640,
    transformPayload,
    topSlot,
    bottomSlot,
  } = props;
  const [form] = Form.useForm();
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      setSubmitting(true);

      // 处理 dateRange / date / address 字段的序列化
      const payload: Record<string, any> = {};
      fields.forEach((f) => {
        const v = values[f.name];
        if (v === undefined || v === null || v === '') return;
        if (f.type === 'date' && v && typeof v.format === 'function') {
          payload[f.name] = v.format('YYYY-MM-DD');
        } else if (
          f.type === 'dateRange' &&
          Array.isArray(v) &&
          v.length === 2
        ) {
          payload[f.name] = v[0]?.format?.('YYYY-MM-DD') ?? v[0];
          if (f.rangeEndName)
            payload[f.rangeEndName] = v[1]?.format?.('YYYY-MM-DD') ?? v[1];
        } else if (f.type === 'address' && typeof v === 'string') {
          // 简化:只提交 detail
          payload[f.name] = { detail: v };
        } else {
          payload[f.name] = v;
        }
      });

      const finalPayload = transformPayload
        ? transformPayload(payload)
        : payload;
      const env = await service.add(finalPayload as Partial<T>);
      message.success(`${title}成功`);
      form.resetFields();
      onSuccess?.((env.data ?? finalPayload) as T);
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

  // 默认值
  const initialValues = React.useMemo(() => {
    const obj: Record<string, any> = {};
    fields.forEach((f) => {
      if (f.initialValue !== undefined) obj[f.name] = f.initialValue;
    });
    return obj;
  }, [fields]);

  return (
    <Modal
      title={title}
      open={open}
      onCancel={() => {
        form.resetFields();
        onClose();
      }}
      onOk={handleSubmit}
      confirmLoading={submitting}
      okText="提交"
      cancelText="取消"
      width={width}
      destroyOnClose
      styles={{ footer: { textAlign: 'right' } }}
    >
      {topSlot}
      <Form
        form={form}
        layout="vertical"
        preserve={false}
        validateTrigger={['onBlur', 'onChange']}
        initialValues={initialValues}
      >
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: '1fr 1fr',
            gap: '0 16px',
          }}
        >
          {fields.map((f) => (
            <Form.Item
              key={f.name}
              label={f.label}
              name={f.name}
              tooltip={f.tooltip}
              extra={f.extra}
              rules={buildAntdRules(f)}
              valuePropName={f.type === 'switch' ? 'checked' : undefined}
              style={{
                gridColumn:
                  f.span === 2 || f.type === 'textarea' ? 'span 2' : 'span 1',
              }}
            >
              {renderControl(f)}
            </Form.Item>
          ))}
        </div>
      </Form>
      {bottomSlot}
    </Modal>
  );
}

const EntityCreateModal = EntityCreateModalInner as <T = Record<string, any>>(
  props: EntityCreateModalProps<T>,
) => React.ReactElement;

export default EntityCreateModal;
