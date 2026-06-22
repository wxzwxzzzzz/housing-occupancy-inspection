import {
  Button,
  Card,
  Divider,
  Form,
  Input,
  InputNumber,
  message,
  Space,
  Switch,
  Tabs,
  Tag,
  TimePicker,
} from 'antd';
import dayjs from 'dayjs';
import React, { useEffect, useState } from 'react';
import { sysConfigService } from '@/services/domains/sys-config';

const { TabPane } = Tabs;

/** 默认值(后端无数据时的回退) */
const DEFAULTS: Record<string, any> = {
  attendanceMissThreshold: 3,
  geoDistanceWarn: 100,
  geoDistanceAlert: 300,
  geoAccuracyThreshold: 50,
  faceScoreThreshold: 0.85,
  faceMatchRetry: 3,
  smsEnabled: true,
  inappEnabled: true,
  emailEnabled: false,
  leaveDurationMin: 1,
  leaveDurationMax: 14,
  leaveMonthMax: 5,
  leaveApplyLeadtime: 24,
  filingGeofenceRadius: 200,
  filingLocationAccuracy: 50,
  filingDurationMin: 1,
  filingDurationMax: 180,
  filingApplyLeadtime: 48,
  systemName: '公租房监测系统',
  systemSubtitle: '审批端管理平台',
  maxUploadSize: 10,
  dataRetentionDays: 1095,
  attendanceWindowStart: '06:00',
  attendanceWindowEnd: '22:00',
};

/** 数值型配置键(从字符串还原为 number) */
const NUMBER_KEYS = new Set([
  'attendanceMissThreshold',
  'geoDistanceWarn',
  'geoDistanceAlert',
  'geoAccuracyThreshold',
  'faceScoreThreshold',
  'faceMatchRetry',
  'leaveDurationMin',
  'leaveDurationMax',
  'leaveMonthMax',
  'leaveApplyLeadtime',
  'filingGeofenceRadius',
  'filingLocationAccuracy',
  'filingDurationMin',
  'filingDurationMax',
  'filingApplyLeadtime',
  'maxUploadSize',
  'dataRetentionDays',
]);
const BOOL_KEYS = new Set(['smsEnabled', 'inappEnabled', 'emailEnabled']);

/** 把 KV map(字符串) → 表单值(含类型还原 + 打卡时间段拼成 dayjs range) */
function mapToForm(map: Record<string, string>): Record<string, any> {
  const merged = { ...DEFAULTS, ...map };
  const form: Record<string, any> = {};
  for (const [k, v] of Object.entries(merged)) {
    if (k === 'attendanceWindowStart' || k === 'attendanceWindowEnd') continue;
    if (NUMBER_KEYS.has(k)) form[k] = Number(v);
    else if (BOOL_KEYS.has(k)) form[k] = v === true || v === 'true';
    else form[k] = v;
  }
  const start = merged.attendanceWindowStart ?? '06:00';
  const end = merged.attendanceWindowEnd ?? '22:00';
  form.attendanceWindow = [
    dayjs(String(start), 'HH:mm'),
    dayjs(String(end), 'HH:mm'),
  ];
  return form;
}

/** 表单值 → KV map(打卡时间段拆成 start/end 两个 key) */
function formToMap(values: Record<string, any>): Record<string, unknown> {
  const { attendanceWindow, ...rest } = values;
  const map: Record<string, unknown> = { ...rest };
  if (
    Array.isArray(attendanceWindow) &&
    attendanceWindow[0] &&
    attendanceWindow[1]
  ) {
    map.attendanceWindowStart = attendanceWindow[0].format('HH:mm');
    map.attendanceWindowEnd = attendanceWindow[1].format('HH:mm');
  }
  return map;
}

const SystemConfig: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [form] = Form.useForm();

  const load = async () => {
    try {
      const map = await sysConfigService.loadMap();
      form.setFieldsValue(mapToForm(map));
    } catch {
      form.setFieldsValue(mapToForm({}));
    }
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleSave = async () => {
    try {
      const values = await form.validateFields();
      setLoading(true);
      await sysConfigService.saveMap(formToMap(values), 'system');
      message.success('配置保存成功');
    } catch {
      message.error('配置保存失败');
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    form.setFieldsValue(mapToForm({}));
    message.info('已恢复默认配置');
  };

  return (
    <div style={{ padding: '24px' }}>
      <Card
        title="系统配置"
        extra={
          <Space>
            <Button onClick={handleReset}>
              重置
            </Button>
            <Button
              type="primary"
              loading={loading}
              onClick={handleSave}
            >
              保存
            </Button>
          </Space>
        }
      >
        <Form
          form={form}
          layout="horizontal"
          labelCol={{ span: 6 }}
          wrapperCol={{ span: 14 }}
        >
          <Tabs defaultActiveKey="1">
            <TabPane tab="打卡配置" key="1">
              <Form.Item
                label="打卡时间段"
                name="attendanceWindow"
                tooltip="保障户可以打卡的时间范围"
              >
                <TimePicker.RangePicker format="HH:mm" />
              </Form.Item>
              <Form.Item
                label="连续缺卡阈值"
                name="attendanceMissThreshold"
                tooltip="连续缺卡多少天触发预警"
              >
                <InputNumber
                  min={1}
                  max={30}
                  addonAfter="天"
                  style={{ width: 200 }}
                />
              </Form.Item>
            </TabPane>

            <TabPane tab="位置配置" key="2">
              <Form.Item
                label="位置偏离警告阈值"
                name="geoDistanceWarn"
                tooltip="距离申报地址超过此值触发提示"
              >
                <InputNumber
                  min={10}
                  max={1000}
                  addonAfter="米"
                  style={{ width: 200 }}
                />
              </Form.Item>
              <Form.Item
                label="位置偏离预警阈值"
                name="geoDistanceAlert"
                tooltip="距离申报地址超过此值触发预警"
              >
                <InputNumber
                  min={50}
                  max={2000}
                  addonAfter="米"
                  style={{ width: 200 }}
                />
              </Form.Item>
              <Form.Item
                label="定位精度要求"
                name="geoAccuracyThreshold"
                tooltip="GPS定位精度需小于此值"
              >
                <InputNumber
                  min={10}
                  max={200}
                  addonAfter="米"
                  style={{ width: 200 }}
                />
              </Form.Item>
            </TabPane>

            <TabPane tab="人脸配置" key="3">
              <Form.Item
                label="人脸匹配分数阈值"
                name="faceScoreThreshold"
                tooltip="人脸匹配分数低于此值触发预警"
              >
                <InputNumber
                  min={0.5}
                  max={1.0}
                  step={0.05}
                  style={{ width: 200 }}
                />
              </Form.Item>
              <Form.Item
                label="人脸识别重试次数"
                name="faceMatchRetry"
                tooltip="人脸识别失败后允许重试的次数"
              >
                <InputNumber
                  min={1}
                  max={5}
                  addonAfter="次"
                  style={{ width: 200 }}
                />
              </Form.Item>
            </TabPane>

            <TabPane tab="通知配置" key="4">
              <Form.Item
                label="短信通知"
                name="smsEnabled"
                valuePropName="checked"
              >
                <Switch checkedChildren="开启" unCheckedChildren="关闭" />
              </Form.Item>
              <Form.Item
                label="站内消息"
                name="inappEnabled"
                valuePropName="checked"
              >
                <Switch checkedChildren="开启" unCheckedChildren="关闭" />
              </Form.Item>
              <Form.Item
                label="邮件通知"
                name="emailEnabled"
                valuePropName="checked"
              >
                <Switch checkedChildren="开启" unCheckedChildren="关闭" />
              </Form.Item>
            </TabPane>

            <TabPane tab="请假配置" key="5">
              <Form.Item
                label="最小请假时长"
                name="leaveDurationMin"
                tooltip="单次请假最少时长"
              >
                <InputNumber
                  min={1}
                  max={24}
                  addonAfter="小时"
                  style={{ width: 200 }}
                />
              </Form.Item>
              <Form.Item
                label="最大请假时长"
                name="leaveDurationMax"
                tooltip="单次请假最长时长"
              >
                <InputNumber
                  min={1}
                  max={90}
                  addonAfter="天"
                  style={{ width: 200 }}
                />
              </Form.Item>
              <Form.Item
                label="月度累计上限"
                name="leaveMonthMax"
                tooltip="每月请假累计天数上限"
              >
                <InputNumber
                  min={1}
                  max={30}
                  addonAfter="天"
                  style={{ width: 200 }}
                />
              </Form.Item>
              <Form.Item
                label="申请提前量"
                name="leaveApplyLeadtime"
                tooltip="需要提前多久申请请假"
              >
                <InputNumber
                  min={1}
                  max={168}
                  addonAfter="小时"
                  style={{ width: 200 }}
                />
              </Form.Item>
            </TabPane>

            <TabPane tab="备案配置" key="6">
              <Form.Item
                label="地理围栏半径"
                name="filingGeofenceRadius"
                tooltip="备案地址地理围栏默认半径"
              >
                <InputNumber
                  min={50}
                  max={1000}
                  addonAfter="米"
                  style={{ width: 200 }}
                />
              </Form.Item>
              <Form.Item
                label="定位精度阈值"
                name="filingLocationAccuracy"
                tooltip="备案期间定位精度要求"
              >
                <InputNumber
                  min={10}
                  max={200}
                  addonAfter="米"
                  style={{ width: 200 }}
                />
              </Form.Item>
              <Form.Item
                label="最小备案时长"
                name="filingDurationMin"
                tooltip="单次备案最短时长"
              >
                <InputNumber
                  min={1}
                  max={30}
                  addonAfter="天"
                  style={{ width: 200 }}
                />
              </Form.Item>
              <Form.Item
                label="最大备案时长"
                name="filingDurationMax"
                tooltip="单次备案最长时长"
              >
                <InputNumber
                  min={7}
                  max={365}
                  addonAfter="天"
                  style={{ width: 200 }}
                />
              </Form.Item>
              <Form.Item
                label="申请提前量"
                name="filingApplyLeadtime"
                tooltip="需要提前多久申请备案"
              >
                <InputNumber
                  min={1}
                  max={168}
                  addonAfter="小时"
                  style={{ width: 200 }}
                />
              </Form.Item>
            </TabPane>

            <TabPane tab="系统设置" key="7">
              <Form.Item label="系统名称" name="systemName">
                <Input placeholder="请输入系统名称" />
              </Form.Item>
              <Form.Item label="系统副标题" name="systemSubtitle">
                <Input placeholder="请输入系统副标题" />
              </Form.Item>
              <Form.Item
                label="最大上传大小"
                name="maxUploadSize"
                tooltip="单个文件最大上传大小"
              >
                <InputNumber
                  min={1}
                  max={100}
                  addonAfter="MB"
                  style={{ width: 200 }}
                />
              </Form.Item>
              <Form.Item
                label="数据保留天数"
                name="dataRetentionDays"
                tooltip="历史数据保留时长"
              >
                <InputNumber
                  min={365}
                  max={3650}
                  addonAfter="天"
                  style={{ width: 200 }}
                />
              </Form.Item>
            </TabPane>
          </Tabs>
        </Form>

        <Divider />
        <div
          style={{ padding: '16px', background: '#fafafa', borderRadius: 4 }}
        >
          <h4>配置说明</h4>
          <p>
            <Tag color="blue">提示</Tag> 修改配置后需点击"保存配置"按钮才能生效
          </p>
          <p>
            <Tag color="orange">警告</Tag>{' '}
            某些配置修改可能影响系统运行，请谨慎操作
          </p>
          <p>
            <Tag color="green">建议</Tag> 重要配置变更前建议先在测试环境验证
          </p>
        </div>
      </Card>
    </div>
  );
};

export default SystemConfig;
