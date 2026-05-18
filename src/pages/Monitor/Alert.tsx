import React, { useEffect, useState } from 'react';
import { Button, Form, Input, message, Modal, Tag } from 'antd';
import { ReloadOutlined } from '@ant-design/icons';
import { observer } from 'mobx-react-lite';
import { useNavigate } from '@umijs/max';
import { alertStore } from '@/stores';
import { EnumLabels, StatusColors } from '@/utils/enum-options';
import {
  OmnibarListPage,
  type FilterConfig,
  type ToolbarAction,
} from '@/components/OmnibarPage';

const MonitorAlert: React.FC = observer(() => {
  const navigate = useNavigate();
  const [processing, setProcessing] = useState<string | null>(null);
  const [form] = Form.useForm();

  const [filterValues, setFilterValues] = useState<Record<string, any>>({});
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [selectedKeys, setSelectedKeys] = useState<React.Key[]>([]);

  useEffect(() => {
    if (alertStore.alerts.length === 0) {
      alertStore.fetchAlerts({ pageSize: 100 });
    }
  }, []);

  const pending = alertStore.alerts.filter((a) => a.status !== 'resolved');
  const filtered = pending.filter((a) => {
    if (filterValues.level && a.level !== filterValues.level) return false;
    if (filterValues.keyword) {
      const kw = String(filterValues.keyword).toLowerCase();
      if (
        !String(a.resident ?? '').toLowerCase().includes(kw) &&
        !String(a.title ?? '').toLowerCase().includes(kw)
      ) {
        return false;
      }
    }
    return true;
  });
  const start = (page - 1) * pageSize;
  const pageList = filtered.slice(start, start + pageSize);

  const handleProcess = async () => {
    const values = await form.validateFields();
    if (!processing) return;
    alertStore.updateAlert(processing, { status: 'resolved' });
    message.success(`已处置(意见:${values.opinion ?? '-'})`);
    setProcessing(null);
    form.resetFields();
  };

  const filterConfigs: FilterConfig[] = [
    { key: 'keyword', label: '关键字', type: 'input', placeholder: '居民 / 类型' },
    {
      key: 'level',
      label: '级别',
      type: 'quick',
      options: [
        { value: '', label: '全部' },
        { value: 'CRITICAL', label: '严重' },
        { value: 'WARNING', label: '警告' },
        { value: 'INFO', label: '提示' },
      ],
    },
  ];

  const toolbarActions: ToolbarAction[] = [
    {
      key: 'refresh',
      type: 'icon',
      icon: <ReloadOutlined />,
      title: '刷新',
      onClick: () => alertStore.fetchAlerts({ pageSize: 100 }),
    },
  ];

  const columns = [
    { title: '居民', dataIndex: 'resident', width: 140 },
    {
      title: '预警类型',
      dataIndex: 'title',
      width: 220,
      render: (t: string) => <Tag>{t}</Tag>,
    },
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
      width: 180,
      render: (_: any, record: any) => (
        <span className="opp-row-actions">
          <span
            className="opp-row-action"
            onClick={() => navigate(`/monitor/alert/detail/${record.id}`)}
          >
            查看
          </span>
          <span className="opp-row-action" onClick={() => setProcessing(record.id)}>
            处置
          </span>
        </span>
      ),
    },
  ];

  return (
    <div style={{ padding: 16, height: 'calc(100vh - 64px - 45px)' }}>
      <OmnibarListPage<any>
        filters={filterConfigs}
        filterValues={filterValues}
        onFilterChange={setFilterValues}
        toolbarActions={toolbarActions}
        data={pageList}
        columns={columns}
        rowKey="id"
        selectedKeys={selectedKeys}
        onSelectionChange={setSelectedKeys}
        showCheckbox
        showIndex
        total={filtered.length}
        page={page}
        pageSize={pageSize}
        onPageChange={(p, s) => {
          setPage(p);
          setPageSize(s);
        }}
      />

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
