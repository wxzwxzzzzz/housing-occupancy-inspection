/**
 * 通用审批列表页(ApprovalListPage)
 *
 * 三个页面(请假/备案/资格申请)交互一致:
 *  列表 + 状态筛选 + 详情抽屉 + 通过/驳回
 *
 * 调用方只需传:
 *  - service:实体的 buildEntityApi(...)
 *  - objectType:OT.* 之一
 *  - title:页签标题
 *  - columns:表格列
 *  - renderDetail:详情区域
 */

import React, { useEffect, useState } from 'react';
import {
  Button,
  Card,
  Drawer,
  Form,
  Input,
  message,
  Modal,
  Select,
  Space,
  Table,
  Tag,
} from 'antd';
import { CheckOutlined, CloseOutlined, EyeOutlined, ReloadOutlined } from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
import { approvalService } from '@/services/domains/approval';
import { qb } from '@/services/ontology/query';
import type { EntityApi } from '@/services/ontology/crud';
import { ApplicationStatus } from '@/types/ontology/prh/enums';
import { EnumLabels, StatusColors, enumOptions } from '@/utils/enum-options';

interface ApprovalListPageProps<T extends { id: string; status?: string }> {
  title: string;
  objectType: string;
  service: EntityApi<T>;
  baseColumns: ColumnsType<T>;
  renderDetail?: (record: T) => React.ReactNode;
}

export function ApprovalListPage<T extends { id: string; status?: string }>(
  props: ApprovalListPageProps<T>,
) {
  const { title, objectType, service, baseColumns, renderDetail } = props;

  const [data, setData] = useState<T[]>([]);
  const [loading, setLoading] = useState(false);
  const [pageNo, setPageNo] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [total, setTotal] = useState(0);
  const [statusFilter, setStatusFilter] = useState<string | undefined>();
  const [detail, setDetail] = useState<T | null>(null);
  const [approving, setApproving] = useState<{ record: T; type: 'approve' | 'reject' } | null>(
    null,
  );
  const [form] = Form.useForm();
  const [submitLoading, setSubmitLoading] = useState(false);

  async function load(page = pageNo, size = pageSize) {
    setLoading(true);
    try {
      const builder = qb(objectType).orderBy('createAt', 'DESC').page(page, size);
      if (statusFilter) builder.eq('status', statusFilter);
      const env = await service.list(builder.build());
      setData(env.data);
      setTotal(env.page?.total ?? env.data.length);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load(1, pageSize);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [statusFilter]);

  const handleSubmitApproval = async () => {
    if (!approving) return;
    const values = await form.validateFields();
    setSubmitLoading(true);
    try {
      if (approving.type === 'approve') {
        await approvalService.approve(objectType, approving.record.id, values.opinion);
        message.success('已通过');
      } else {
        await approvalService.reject(objectType, approving.record.id, values.opinion);
        message.success('已驳回');
      }
      setApproving(null);
      form.resetFields();
      load();
    } finally {
      setSubmitLoading(false);
    }
  };

  const columns: ColumnsType<T> = [
    ...baseColumns,
    {
      title: '状态',
      dataIndex: 'status',
      width: 110,
      render: (status: any) => (
        <Tag color={(StatusColors.ApplicationStatus as any)[status]}>
          {EnumLabels.ApplicationStatus[status as keyof typeof EnumLabels.ApplicationStatus] ??
            status}
        </Tag>
      ),
    },
    {
      title: '操作',
      key: 'action',
      width: 220,
      fixed: 'right' as const,
      render: (_: any, record: T) => (
        <Space size="small">
          <Button
            type="link"
            size="small"
            icon={<EyeOutlined />}
            onClick={() => setDetail(record)}
          >
            查看
          </Button>
          {record.status === 'UNDER_APPROVAL' && (
            <>
              <Button
                type="link"
                size="small"
                icon={<CheckOutlined />}
                onClick={() => setApproving({ record, type: 'approve' })}
              >
                通过
              </Button>
              <Button
                type="link"
                size="small"
                danger
                icon={<CloseOutlined />}
                onClick={() => setApproving({ record, type: 'reject' })}
              >
                驳回
              </Button>
            </>
          )}
        </Space>
      ),
    },
  ];

  return (
    <div style={{ padding: 24 }}>
      <Card
        title={title}
        extra={
          <Space>
            <Select
              allowClear
              placeholder="按状态筛选"
              style={{ width: 160 }}
              value={statusFilter}
              onChange={(v) => setStatusFilter(v)}
              options={enumOptions(ApplicationStatus, EnumLabels.ApplicationStatus)}
            />
            <Button icon={<ReloadOutlined />} onClick={() => load()}>
              刷新
            </Button>
          </Space>
        }
      >
        <Table<T>
          rowKey="id"
          columns={columns}
          dataSource={data}
          loading={loading}
          scroll={{ x: 1200 }}
          pagination={{
            current: pageNo,
            pageSize,
            total,
            showSizeChanger: true,
            showTotal: (t) => `共 ${t} 条`,
            onChange: (p, s) => {
              setPageNo(p);
              setPageSize(s);
              load(p, s);
            },
          }}
        />
      </Card>

      <Drawer
        title={detail ? `详情 #${String(detail.id).slice(-6)}` : ''}
        open={!!detail}
        width={600}
        onClose={() => setDetail(null)}
      >
        {detail && renderDetail ? renderDetail(detail) : null}
      </Drawer>

      <Modal
        title={approving?.type === 'approve' ? '审批通过' : '审批驳回'}
        open={!!approving}
        onOk={handleSubmitApproval}
        confirmLoading={submitLoading}
        okText="确认提交"
        onCancel={() => {
          setApproving(null);
          form.resetFields();
        }}
      >
        <Form form={form} layout="vertical">
          <Form.Item
            name="opinion"
            label={approving?.type === 'approve' ? '审批意见' : '驳回原因'}
            rules={
              approving?.type === 'reject'
                ? [{ required: true, message: '请输入驳回原因' }]
                : []
            }
          >
            <Input.TextArea rows={4} placeholder="请输入审批意见..." />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
}

export default ApprovalListPage;
