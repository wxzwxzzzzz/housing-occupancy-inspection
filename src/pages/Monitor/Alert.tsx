import React, { useEffect, useState } from 'react';
import { Button, Card, Empty, Form, Input, message, Modal, Space, Table, Tag } from 'antd';
import { observer } from 'mobx-react-lite';
import { useNavigate } from '@umijs/max';
import { alertStore } from '@/stores';
import { EnumLabels, StatusColors } from '@/utils/enum-options';

const MonitorAlert: React.FC = observer(() => {
  const navigate = useNavigate();
  const [processing, setProcessing] = useState<string | null>(null);
  const [form] = Form.useForm();

  useEffect(() => {
    if (alertStore.alerts.length === 0) {
      alertStore.fetchAlerts({ pageSize: 100 });
    }
  }, []);

  const pending = alertStore.alerts.filter((a) => a.status !== 'resolved');

  const handleProcess = async () => {
    const values = await form.validateFields();
    if (!processing) return;
    alertStore.updateAlert(processing, { status: 'resolved' });
    message.success(`已处置(意见:${values.opinion ?? '-'})`);
    setProcessing(null);
    form.resetFields();
  };

  return (
    <div style={{ padding: 24 }}>
      <Card
        title="预警处置工作台"
        extra={<Button onClick={() => alertStore.fetchAlerts({ pageSize: 100 })}>刷新</Button>}
      >
        {pending.length === 0 ? (
          <Empty description="目前没有待处置的预警" />
        ) : (
          <Table
            rowKey="id"
            dataSource={pending}
            pagination={{ pageSize: 10 }}
            columns={[
              { title: '居民', dataIndex: 'resident', width: 140 },
              { title: '预警类型', dataIndex: 'title', width: 220, render: (t: string) => <Tag>{t}</Tag> },
              {
                title: '级别',
                dataIndex: 'level',
                width: 100,
                render: (level: any) => (
                  <Tag color={(StatusColors.AlertLevel as any)[level]}>
                    {EnumLabels.AlertLevel[level as keyof typeof EnumLabels.AlertLevel] ?? level}
                  </Tag>
                ),
              },
              {
                title: '触发时间',
                dataIndex: 'createTime',
                width: 200,
                render: (v: string) => new Date(v).toLocaleString(),
              },
              { title: '说明', dataIndex: 'content', ellipsis: true },
              {
                title: '操作',
                key: 'op',
                width: 200,
                fixed: 'right' as const,
                render: (_: any, record: any) => (
                  <Space>
                    <Button type="link" onClick={() => navigate(`/monitor/alert/detail/${record.id}`)}>
                      查看
                    </Button>
                    <Button type="link" onClick={() => setProcessing(record.id)}>
                      处置
                    </Button>
                  </Space>
                ),
              },
            ]}
          />
        )}
      </Card>

      <Modal
        title="处置预警"
        open={!!processing}
        onCancel={() => {
          setProcessing(null);
          form.resetFields();
        }}
        onOk={handleProcess}
        okText="确认处置"
      >
        <Form form={form} layout="vertical">
          <Form.Item
            label="处置意见"
            name="opinion"
            rules={[{ required: true, message: '请填写处置意见' }]}
          >
            <Input.TextArea rows={3} placeholder="例如:已联系居民补卡 / 误报豁免 / 已转人工核查" />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
});

export default MonitorAlert;
