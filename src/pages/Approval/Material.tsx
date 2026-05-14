import React, { useState } from 'react';
import { Card, Table, Tag, Button, Space, Input, Select, DatePicker, Modal, Form, message, Image } from 'antd';
import { SearchOutlined, EyeOutlined, CheckOutlined, CloseOutlined, FileImageOutlined } from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
import dayjs from 'dayjs';

const { RangePicker } = DatePicker;
const { TextArea } = Input;
const { Option } = Select;

interface MaterialItem {
  id: string;
  applicant: string;
  phone: string;
  materialType: string;
  files: string[];
  submitTime: string;
  status: 'pending' | 'approved' | 'rejected' | 'reviewing';
  stage: 'initial' | 'review';
  reviewer?: string;
  reviewTime?: string;
  remark?: string;
}

const ApprovalMaterial: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [selectedRowKeys, setSelectedRowKeys] = useState<React.Key[]>([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [detailModalVisible, setDetailModalVisible] = useState(false);
  const [currentRecord, setCurrentRecord] = useState<MaterialItem | null>(null);
  const [approvalType, setApprovalType] = useState<'approve' | 'reject'>('approve');
  const [form] = Form.useForm();
  const [previewImages, setPreviewImages] = useState<string[]>([]);
  const [previewVisible, setPreviewVisible] = useState(false);

  // 模拟数据
  const [dataSource] = useState<MaterialItem[]>([
    {
      id: '1',
      applicant: '张三',
      phone: '138****1234',
      materialType: '居住证明',
      files: [
        'https://via.placeholder.com/400x300.png?text=居住证明1',
        'https://via.placeholder.com/400x300.png?text=居住证明2',
      ],
      submitTime: '2025-11-18 10:30:00',
      status: 'pending',
      stage: 'initial',
    },
    {
      id: '2',
      applicant: '李四',
      phone: '139****5678',
      materialType: '收入证明',
      files: ['https://via.placeholder.com/400x300.png?text=收入证明'],
      submitTime: '2025-11-18 09:15:00',
      status: 'reviewing',
      stage: 'review',
      reviewer: '王审批',
      reviewTime: '2025-11-18 11:00:00',
    },
    {
      id: '3',
      applicant: '王五',
      phone: '137****9012',
      materialType: '户口本',
      files: [
        'https://via.placeholder.com/400x300.png?text=户口本页1',
        'https://via.placeholder.com/400x300.png?text=户口本页2',
        'https://via.placeholder.com/400x300.png?text=户口本页3',
      ],
      submitTime: '2025-11-17 16:45:00',
      status: 'approved',
      stage: 'initial',
      reviewer: '赵管理',
      reviewTime: '2025-11-18 08:30:00',
      remark: '材料齐全，符合要求',
    },
  ]);

  const statusConfig = {
    pending: { text: '待审批', color: 'gold' },
    reviewing: { text: '审核中', color: 'blue' },
    approved: { text: '已通过', color: 'green' },
    rejected: { text: '已拒绝', color: 'red' },
  };

  const stageConfig = {
    initial: '初审',
    review: '复审',
  };

  const columns: ColumnsType<MaterialItem> = [
    {
      title: '申请人',
      dataIndex: 'applicant',
      key: 'applicant',
      width: 100,
    },
    {
      title: '联系电话',
      dataIndex: 'phone',
      key: 'phone',
      width: 120,
    },
    {
      title: '材料类型',
      dataIndex: 'materialType',
      key: 'materialType',
      width: 120,
    },
    {
      title: '文件数量',
      dataIndex: 'files',
      key: 'files',
      width: 100,
      render: (files: string[]) => (
        <Space>
          <FileImageOutlined />
          <span>{files.length} 个</span>
        </Space>
      ),
    },
    {
      title: '提交时间',
      dataIndex: 'submitTime',
      key: 'submitTime',
      width: 160,
    },
    {
      title: '审批阶段',
      dataIndex: 'stage',
      key: 'stage',
      width: 100,
      render: (stage: string) => <Tag>{stageConfig[stage as keyof typeof stageConfig]}</Tag>,
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      width: 100,
      render: (status: keyof typeof statusConfig) => (
        <Tag color={statusConfig[status].color}>{statusConfig[status].text}</Tag>
      ),
    },
    {
      title: '审批人',
      dataIndex: 'reviewer',
      key: 'reviewer',
      width: 100,
      render: (text) => text || '-',
    },
    {
      title: '操作',
      key: 'action',
      fixed: 'right',
      render: (_, record) => (
        <Space size="small">
          <Button
            type="link"
            size="small"
            icon={<EyeOutlined />}
            onClick={() => handleViewDetail(record)}
          >
            查看
          </Button>
          {record.status === 'pending' && (
            <>
              <Button
                type="link"
                size="small"
                icon={<CheckOutlined />}
                onClick={() => handleApprove(record, 'approve')}
              >
                通过
              </Button>
              <Button
                type="link"
                size="small"
                danger
                icon={<CloseOutlined />}
                onClick={() => handleApprove(record, 'reject')}
              >
                拒绝
              </Button>
            </>
          )}
        </Space>
      ),
    },
  ];

  const handleViewDetail = (record: MaterialItem) => {
    setCurrentRecord(record);
    setPreviewImages(record.files);
    setDetailModalVisible(true);
  };

  const handleApprove = (record: MaterialItem, type: 'approve' | 'reject') => {
    setCurrentRecord(record);
    setApprovalType(type);
    setModalVisible(true);
  };

  const handleModalOk = async () => {
    try {
      const values = await form.validateFields();
      setLoading(true);

      // TODO: 调用审批 API
      await new Promise((resolve) => setTimeout(resolve, 500));

      message.success(approvalType === 'approve' ? '审批通过' : '审批拒绝');
      setModalVisible(false);
      form.resetFields();
    } catch (error) {
      console.error('Failed to submit:', error);
    } finally {
      setLoading(false);
    }
  };

  const rowSelection = {
    selectedRowKeys,
    onChange: (newSelectedRowKeys: React.Key[]) => {
      setSelectedRowKeys(newSelectedRowKeys);
    },
  };

  return (
    <div style={{ padding: '24px' }}>
      <Card>
        <Space direction="vertical" size="large" style={{ width: '100%' }}>
          {/* 搜索筛选 */}
          <Space wrap>
            <Input
              placeholder="搜索申请人或手机号"
              prefix={<SearchOutlined />}
              style={{ width: 200 }}
            />
            <Select placeholder="材料类型" style={{ width: 150 }} allowClear>
              <Option value="resident">居住证明</Option>
              <Option value="income">收入证明</Option>
              <Option value="household">户口本</Option>
              <Option value="other">其他</Option>
            </Select>
            <Select placeholder="状态" style={{ width: 120 }} allowClear>
              <Option value="pending">待审批</Option>
              <Option value="reviewing">审核中</Option>
              <Option value="approved">已通过</Option>
              <Option value="rejected">已拒绝</Option>
            </Select>
            <RangePicker />
            <Button type="primary" icon={<SearchOutlined />}>
              搜索
            </Button>
          </Space>

          {/* 批量操作 */}
          {selectedRowKeys.length > 0 && (
            <Space>
              <span>已选择 {selectedRowKeys.length} 项</span>
              <Button icon={<CheckOutlined />}>批量通过</Button>
              <Button danger icon={<CloseOutlined />}>
                批量拒绝
              </Button>
            </Space>
          )}

          {/* 表格 */}
          <Table
            rowSelection={rowSelection}
            columns={columns}
            dataSource={dataSource}
            rowKey="id"
            loading={loading}
            scroll={{ x: 1200 }}
            pagination={{
              total: dataSource.length,
              pageSize: 10,
              showSizeChanger: true,
              showTotal: (total) => `共 ${total} 条`,
            }}
          />
        </Space>
      </Card>

      {/* 审批弹窗 */}
      <Modal
        title={approvalType === 'approve' ? '审批通过' : '审批拒绝'}
        open={modalVisible}
        onOk={handleModalOk}
        onCancel={() => {
          setModalVisible(false);
          form.resetFields();
        }}
        confirmLoading={loading}
      >
        <Form form={form} layout="vertical">
          <Form.Item label="申请人">
            <span>{currentRecord?.applicant}</span>
          </Form.Item>
          <Form.Item label="材料类型">
            <span>{currentRecord?.materialType}</span>
          </Form.Item>
          <Form.Item
            name="remark"
            label={approvalType === 'approve' ? '审批意见' : '拒绝原因'}
            rules={
              approvalType === 'reject'
                ? [{ required: true, message: '请输入拒绝原因' }]
                : []
            }
          >
            <TextArea rows={4} placeholder="请输入审批意见..." />
          </Form.Item>
        </Form>
      </Modal>

      {/* 详情弹窗 */}
      <Modal
        title="材料详情"
        open={detailModalVisible}
        onCancel={() => setDetailModalVisible(false)}
        footer={[
          <Button key="close" onClick={() => setDetailModalVisible(false)}>
            关闭
          </Button>,
          currentRecord?.status === 'pending' && (
            <Button
              key="approve"
              type="primary"
              onClick={() => {
                setDetailModalVisible(false);
                handleApprove(currentRecord, 'approve');
              }}
            >
              审批
            </Button>
          ),
        ]}
        width={800}
      >
        <Space direction="vertical" size="large" style={{ width: '100%' }}>
          <div>
            <h4>基本信息</h4>
            <p>申请人：{currentRecord?.applicant}</p>
            <p>联系电话：{currentRecord?.phone}</p>
            <p>材料类型：{currentRecord?.materialType}</p>
            <p>提交时间：{currentRecord?.submitTime}</p>
          </div>
          <div>
            <h4>材料文件</h4>
            <Image.PreviewGroup>
              <Space wrap>
                {previewImages.map((url, index) => (
                  <Image
                    key={index}
                    width={150}
                    src={url}
                    alt={`材料${index + 1}`}
                    style={{ borderRadius: 4 }}
                  />
                ))}
              </Space>
            </Image.PreviewGroup>
          </div>
          {currentRecord?.reviewer && (
            <div>
              <h4>审批信息</h4>
              <p>审批人：{currentRecord.reviewer}</p>
              <p>审批时间：{currentRecord.reviewTime}</p>
              <p>审批意见：{currentRecord.remark || '-'}</p>
            </div>
          )}
        </Space>
      </Modal>
    </div>
  );
};

export default ApprovalMaterial;
