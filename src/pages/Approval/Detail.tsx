import React, { useState, useEffect } from 'react';
import { observer } from 'mobx-react-lite';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Card,
  Descriptions,
  Button,
  Space,
  Tag,
  Timeline,
  Modal,
  Form,
  Input,
  message,
} from 'antd';
import {
  ArrowLeftOutlined,
  CheckOutlined,
  CloseOutlined,
} from '@ant-design/icons';

const { TextArea } = Input;

interface ApprovalDetail {
  id: string;
  title: string;
  applicant: string;
  type: string;
  status: 'pending' | 'approved' | 'rejected';
  content: string;
  createTime: string;
  updateTime: string;
  approver?: string;
  approveTime?: string;
  rejectReason?: string;
}

interface HistoryItem {
  time: string;
  action: string;
  operator: string;
  remark?: string;
}

const ApprovalDetail: React.FC = observer(() => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [modalType, setModalType] = useState<'approve' | 'reject'>('approve');
  const [form] = Form.useForm();

  // 模拟数据
  const [detail] = useState<ApprovalDetail>({
    id: id || '1',
    title: '设备维修申请',
    applicant: '张三',
    type: '维修',
    status: 'pending',
    content: '一号楼监测设备出现故障，需要进行维修处理。',
    createTime: '2024-01-15 10:30:00',
    updateTime: '2024-01-15 10:30:00',
  });

  const [history] = useState<HistoryItem[]>([
    {
      time: '2024-01-15 10:30:00',
      action: '提交申请',
      operator: '张三',
    },
  ]);

  const statusMap = {
    pending: { text: '待审批', color: 'warning' },
    approved: { text: '已通过', color: 'success' },
    rejected: { text: '已拒绝', color: 'error' },
  };

  const handleApprove = () => {
    setModalType('approve');
    setModalVisible(true);
  };

  const handleReject = () => {
    setModalType('reject');
    setModalVisible(true);
  };

  const handleModalOk = async () => {
    try {
      const values = await form.validateFields();
      setLoading(true);

      // TODO: 调用审批 API
      console.log('Approval:', modalType, values);

      message.success(modalType === 'approve' ? '审批通过' : '审批拒绝');
      setModalVisible(false);
      form.resetFields();
      navigate('/approval/list');
    } catch (error) {
      console.error('Failed to submit:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ padding: '24px' }}>
      <Card>
        <Space direction="vertical" size="large" style={{ width: '100%' }}>
          <div>
            <Button
              icon={<ArrowLeftOutlined />}
              onClick={() => navigate(-1)}
              style={{ marginBottom: '16px' }}
            >
              返回
            </Button>
          </div>

          <Descriptions title="审批详情" bordered column={2}>
            <Descriptions.Item label="标题" span={2}>
              {detail.title}
            </Descriptions.Item>
            <Descriptions.Item label="申请人">
              {detail.applicant}
            </Descriptions.Item>
            <Descriptions.Item label="类型">{detail.type}</Descriptions.Item>
            <Descriptions.Item label="状态">
              <Tag color={statusMap[detail.status].color}>
                {statusMap[detail.status].text}
              </Tag>
            </Descriptions.Item>
            <Descriptions.Item label="创建时间">
              {detail.createTime}
            </Descriptions.Item>
            <Descriptions.Item label="申请内容" span={2}>
              {detail.content}
            </Descriptions.Item>
            {detail.approver && (
              <>
                <Descriptions.Item label="审批人">
                  {detail.approver}
                </Descriptions.Item>
                <Descriptions.Item label="审批时间">
                  {detail.approveTime}
                </Descriptions.Item>
              </>
            )}
            {detail.rejectReason && (
              <Descriptions.Item label="拒绝原因" span={2}>
                {detail.rejectReason}
              </Descriptions.Item>
            )}
          </Descriptions>

          {detail.status === 'pending' && (
            <Space>
              <Button
                type="primary"
                icon={<CheckOutlined />}
                onClick={handleApprove}
              >
                通过
              </Button>
              <Button
                danger
                icon={<CloseOutlined />}
                onClick={handleReject}
              >
                拒绝
              </Button>
            </Space>
          )}

          <Card title="审批历史" size="small">
            <Timeline
              items={history.map((item) => ({
                children: (
                  <div>
                    <div>{item.action}</div>
                    <div style={{ color: '#999', fontSize: '12px' }}>
                      {item.operator} - {item.time}
                    </div>
                    {item.remark && (
                      <div style={{ marginTop: '8px' }}>{item.remark}</div>
                    )}
                  </div>
                ),
              }))}
            />
          </Card>
        </Space>
      </Card>

      <Modal
        title={modalType === 'approve' ? '审批通过' : '审批拒绝'}
        open={modalVisible}
        onOk={handleModalOk}
        onCancel={() => {
          setModalVisible(false);
          form.resetFields();
        }}
        confirmLoading={loading}
      >
        <Form form={form} layout="vertical">
          <Form.Item
            name="remark"
            label={modalType === 'approve' ? '审批意见' : '拒绝原因'}
            rules={
              modalType === 'reject'
                ? [{ required: true, message: '请输入拒绝原因' }]
                : []
            }
          >
            <TextArea rows={4} placeholder="请输入备注信息" />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
});

export default ApprovalDetail;
