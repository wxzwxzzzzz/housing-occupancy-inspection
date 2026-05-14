import React, { useState } from 'react';
import {
  Card,
  Table,
  Form,
  Input,
  Select,
  DatePicker,
  Button,
  Space,
  Tag,
  Badge,
  Row,
  Col,
  Modal,
  message,
  Tooltip,
  Statistic,
} from 'antd';
import {
  SearchOutlined,
  ReloadOutlined,
  ExportOutlined,
  AlertOutlined,
  CheckCircleOutlined,
  ClockCircleOutlined,
  ExclamationCircleOutlined,
  EyeOutlined,
  EditOutlined,
  DeleteOutlined,
} from '@ant-design/icons';
import { useNavigate } from '@umijs/max';

const { RangePicker } = DatePicker;
const { Option } = Select;

const AlertList: React.FC = () => {
  const navigate = useNavigate();
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [selectedRowKeys, setSelectedRowKeys] = useState<React.Key[]>([]);

  // 模拟预警列表数据
  const alertData = [
    {
      id: '1',
      userName: '赵六',
      idCard: '110101199001011234',
      phone: '138****5678',
      alertType: '位置偏离',
      level: 'critical',
      location: '西城区德胜街道',
      address: '北京市西城区德胜门外大街10号',
      time: '2025-11-19 14:20:00',
      status: 'pending',
      description: '打卡位置与备案地址相差超过500米',
      handler: '',
      handleTime: '',
    },
    {
      id: '2',
      userName: '孙七',
      idCard: '110102199202022345',
      phone: '139****1234',
      alertType: '人脸不匹配',
      level: 'warning',
      location: '朝阳区建外街道',
      address: '北京市朝阳区建国门外大街1号',
      time: '2025-11-19 13:45:00',
      status: 'pending',
      description: '人脸识别相似度低于阈值（相似度：65%）',
      handler: '',
      handleTime: '',
    },
    {
      id: '3',
      userName: '周八',
      idCard: '110103199303033456',
      phone: '136****9876',
      alertType: '连续缺卡',
      level: 'critical',
      location: '海淀区中关村街道',
      address: '北京市海淀区中关村大街1号',
      time: '2025-11-19 12:00:00',
      status: 'processing',
      description: '连续3天未打卡',
      handler: '管理员A',
      handleTime: '2025-11-19 12:30:00',
    },
    {
      id: '4',
      userName: '吴九',
      idCard: '110104199404044567',
      phone: '137****5432',
      alertType: '位置偏离',
      level: 'info',
      location: '东城区东华门街道',
      address: '北京市东城区东华门大街5号',
      time: '2025-11-19 11:30:00',
      status: 'resolved',
      description: '打卡位置与备案地址相差300米',
      handler: '管理员B',
      handleTime: '2025-11-19 11:45:00',
    },
    {
      id: '5',
      userName: '郑十',
      idCard: '110105199505055678',
      phone: '135****8765',
      alertType: '请假超时',
      level: 'warning',
      location: '丰台区右安门街道',
      address: '北京市丰台区右安门外大街3号',
      time: '2025-11-19 10:15:00',
      status: 'pending',
      description: '请假到期后未及时销假（超时2天）',
      handler: '',
      handleTime: '',
    },
    {
      id: '6',
      userName: '王二',
      idCard: '110106199606066789',
      phone: '133****4321',
      alertType: '人脸不匹配',
      level: 'critical',
      location: '石景山区八宝山街道',
      address: '北京市石景山区八宝山路6号',
      time: '2025-11-19 09:50:00',
      status: 'processing',
      description: '打卡人脸与系统照片严重不符（相似度：42%）',
      handler: '管理员C',
      handleTime: '2025-11-19 10:00:00',
    },
    {
      id: '7',
      userName: '李五',
      idCard: '110107199707077890',
      phone: '132****6543',
      alertType: '位置偏离',
      level: 'warning',
      location: '西城区月坛街道',
      address: '北京市西城区月坛北街2号',
      time: '2025-11-19 09:20:00',
      status: 'pending',
      description: '打卡位置与备案地址相差400米',
      handler: '',
      handleTime: '',
    },
    {
      id: '8',
      userName: '张三',
      idCard: '110108199808088901',
      phone: '131****2109',
      alertType: '连续缺卡',
      level: 'info',
      location: '朝阳区三里屯街道',
      address: '北京市朝阳区三里屯路8号',
      time: '2025-11-19 08:45:00',
      status: 'resolved',
      description: '连续2天未打卡，已补卡',
      handler: '管理员A',
      handleTime: '2025-11-19 09:00:00',
    },
    {
      id: '9',
      userName: '陈一',
      idCard: '110109199909099012',
      phone: '130****7890',
      alertType: '备案过期',
      level: 'warning',
      location: '通州区永顺街道',
      address: '北京市通州区梨园镇1号',
      time: '2025-11-18 16:30:00',
      status: 'pending',
      description: '备案信息已过期3天未更新',
      handler: '',
      handleTime: '',
    },
    {
      id: '10',
      userName: '刘四',
      idCard: '110110199010100123',
      phone: '129****3456',
      alertType: '异常打卡',
      level: 'critical',
      location: '大兴区亦庄街道',
      address: '北京市大兴区亦庄经济开发区9号',
      time: '2025-11-18 15:00:00',
      status: 'resolved',
      description: '同一天内多次异地打卡',
      handler: '管理员B',
      handleTime: '2025-11-18 16:00:00',
    },
  ];

  const alertLevelConfig = {
    critical: { text: '严重', color: 'red' },
    warning: { text: '警告', color: 'orange' },
    info: { text: '提示', color: 'blue' },
  };

  const alertStatusConfig = {
    pending: { text: '待处理', color: 'orange', badge: 'warning' },
    processing: { text: '处理中', color: 'blue', badge: 'processing' },
    resolved: { text: '已解决', color: 'green', badge: 'success' },
  };

  // 统计数据
  const statistics = {
    total: alertData.length,
    pending: alertData.filter((item) => item.status === 'pending').length,
    processing: alertData.filter((item) => item.status === 'processing').length,
    resolved: alertData.filter((item) => item.status === 'resolved').length,
    critical: alertData.filter((item) => item.level === 'critical').length,
  };

  const columns = [
    {
      title: '预警编号',
      dataIndex: 'id',
      key: 'id',
      width: 100,
      render: (id: string) => <span style={{ fontWeight: 500 }}>#{id}</span>,
    },
    {
      title: '姓名',
      dataIndex: 'userName',
      key: 'userName',
      width: 100,
    },
    {
      title: '身份证号',
      dataIndex: 'idCard',
      key: 'idCard',
      width: 180,
    },
    {
      title: '联系电话',
      dataIndex: 'phone',
      key: 'phone',
      width: 120,
    },
    {
      title: '预警类型',
      dataIndex: 'alertType',
      key: 'alertType',
      width: 120,
      render: (type: string) => <Tag>{type}</Tag>,
    },
    {
      title: '预警级别',
      dataIndex: 'level',
      key: 'level',
      width: 100,
      render: (level: string) => (
        <Tag color={alertLevelConfig[level as keyof typeof alertLevelConfig].color}>
          {alertLevelConfig[level as keyof typeof alertLevelConfig].text}
        </Tag>
      ),
    },
    {
      title: '所属区域',
      dataIndex: 'location',
      key: 'location',
      width: 150,
    },
    {
      title: '预警时间',
      dataIndex: 'time',
      key: 'time',
      width: 170,
    },
    {
      title: '处理状态',
      dataIndex: 'status',
      key: 'status',
      width: 100,
      render: (status: string) => (
        <Badge
          status={alertStatusConfig[status as keyof typeof alertStatusConfig].badge as any}
          text={alertStatusConfig[status as keyof typeof alertStatusConfig].text}
        />
      ),
    },
    {
      title: '预警说明',
      dataIndex: 'description',
      key: 'description',
      width: 200,
      ellipsis: {
        showTitle: false,
      },
      render: (desc: string) => (
        <Tooltip title={desc}>
          <span>{desc}</span>
        </Tooltip>
      ),
    },
    {
      title: '处理人',
      dataIndex: 'handler',
      key: 'handler',
      width: 100,
      render: (handler: string) => handler || '-',
    },
    {
      title: '操作',
      key: 'action',
      width: 180,
      fixed: 'right' as const,
      render: (_: any, record: any) => (
        <Space size="small">
          <Tooltip title="查看详情">
            <Button
              type="link"
              size="small"
              icon={<EyeOutlined />}
              onClick={() => navigate(`/monitor/alert/detail/${record.id}`)}
            />
          </Tooltip>
          {record.status !== 'resolved' && (
            <Tooltip title="处理">
              <Button
                type="link"
                size="small"
                icon={<EditOutlined />}
                onClick={() => handleProcess(record)}
              />
            </Tooltip>
          )}
          <Tooltip title="删除">
            <Button
              type="link"
              size="small"
              danger
              icon={<DeleteOutlined />}
              onClick={() => handleDelete(record)}
            />
          </Tooltip>
        </Space>
      ),
    },
  ];

  const handleSearch = (values: any) => {
    setLoading(true);
    console.log('搜索条件:', values);
    setTimeout(() => {
      setLoading(false);
      message.success('查询完成');
    }, 1000);
  };

  const handleReset = () => {
    form.resetFields();
  };

  const handleProcess = (record: any) => {
    Modal.confirm({
      title: '处理预警',
      content: `确认处理 ${record.userName} 的 ${record.alertType} 预警？`,
      onOk() {
        message.success('预警处理成功');
      },
    });
  };

  const handleDelete = (record: any) => {
    Modal.confirm({
      title: '删除预警',
      content: `确认删除 ${record.userName} 的 ${record.alertType} 预警记录？`,
      okType: 'danger',
      onOk() {
        message.success('删除成功');
      },
    });
  };

  const handleBatchProcess = () => {
    if (selectedRowKeys.length === 0) {
      message.warning('请选择要处理的预警');
      return;
    }
    Modal.confirm({
      title: '批量处理',
      content: `确认批量处理选中的 ${selectedRowKeys.length} 条预警？`,
      onOk() {
        message.success('批量处理成功');
        setSelectedRowKeys([]);
      },
    });
  };

  const handleExport = () => {
    message.success('导出成功');
  };

  const rowSelection = {
    selectedRowKeys,
    onChange: (keys: React.Key[]) => {
      setSelectedRowKeys(keys);
    },
  };

  return (
    <div style={{ padding: '24px', background: '#f0f2f5', minHeight: 'calc(100vh - 64px)' }}>
      {/* 统计卡片 */}
      <Row gutter={16} style={{ marginBottom: 16 }}>
        <Col xs={24} sm={12} md={6} lg={4}>
          <Card size="small">
            <Statistic
              title="预警总数"
              value={statistics.total}
              prefix={<AlertOutlined style={{ color: '#1890ff' }} />}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6} lg={4}>
          <Card size="small">
            <Statistic
              title="待处理"
              value={statistics.pending}
              valueStyle={{ color: '#faad14' }}
              prefix={<ClockCircleOutlined />}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6} lg={4}>
          <Card size="small">
            <Statistic
              title="处理中"
              value={statistics.processing}
              valueStyle={{ color: '#1890ff' }}
              prefix={<ExclamationCircleOutlined />}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6} lg={4}>
          <Card size="small">
            <Statistic
              title="已解决"
              value={statistics.resolved}
              valueStyle={{ color: '#52c41a' }}
              prefix={<CheckCircleOutlined />}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6} lg={4}>
          <Card size="small">
            <Statistic
              title="严重预警"
              value={statistics.critical}
              valueStyle={{ color: '#ff4d4f' }}
              prefix={<AlertOutlined />}
            />
          </Card>
        </Col>
      </Row>

      {/* 搜索表单 */}
      <Card style={{ marginBottom: 16 }}>
        <Form form={form} onFinish={handleSearch} layout="inline">
          <Row gutter={[16, 16]} style={{ width: '100%' }}>
            <Col xs={24} sm={12} md={6}>
              <Form.Item name="keyword" style={{ marginBottom: 0, width: '100%' }}>
                <Input placeholder="姓名/身份证号/电话" prefix={<SearchOutlined />} allowClear />
              </Form.Item>
            </Col>
            <Col xs={24} sm={12} md={6}>
              <Form.Item name="alertType" style={{ marginBottom: 0, width: '100%' }}>
                <Select placeholder="预警类型" allowClear style={{ width: '100%' }}>
                  <Option value="位置偏离">位置偏离</Option>
                  <Option value="人脸不匹配">人脸不匹配</Option>
                  <Option value="连续缺卡">连续缺卡</Option>
                  <Option value="请假超时">请假超时</Option>
                  <Option value="备案过期">备案过期</Option>
                  <Option value="异常打卡">异常打卡</Option>
                </Select>
              </Form.Item>
            </Col>
            <Col xs={24} sm={12} md={6}>
              <Form.Item name="level" style={{ marginBottom: 0, width: '100%' }}>
                <Select placeholder="预警级别" allowClear style={{ width: '100%' }}>
                  <Option value="critical">严重</Option>
                  <Option value="warning">警告</Option>
                  <Option value="info">提示</Option>
                </Select>
              </Form.Item>
            </Col>
            <Col xs={24} sm={12} md={6}>
              <Form.Item name="status" style={{ marginBottom: 0, width: '100%' }}>
                <Select placeholder="处理状态" allowClear style={{ width: '100%' }}>
                  <Option value="pending">待处理</Option>
                  <Option value="processing">处理中</Option>
                  <Option value="resolved">已解决</Option>
                </Select>
              </Form.Item>
            </Col>
            <Col xs={24} sm={12} md={8}>
              <Form.Item name="dateRange" style={{ marginBottom: 0, width: '100%' }}>
                <RangePicker style={{ width: '100%' }} placeholder={['开始日期', '结束日期']} />
              </Form.Item>
            </Col>
            <Col xs={24} sm={12} md={6}>
              <Form.Item name="location" style={{ marginBottom: 0, width: '100%' }}>
                <Select placeholder="所属区域" allowClear style={{ width: '100%' }}>
                  <Option value="西城区">西城区</Option>
                  <Option value="朝阳区">朝阳区</Option>
                  <Option value="海淀区">海淀区</Option>
                  <Option value="东城区">东城区</Option>
                  <Option value="丰台区">丰台区</Option>
                  <Option value="石景山区">石景山区</Option>
                  <Option value="通州区">通州区</Option>
                  <Option value="大兴区">大兴区</Option>
                </Select>
              </Form.Item>
            </Col>
            <Col xs={24} sm={24} md={10}>
              <Form.Item style={{ marginBottom: 0 }}>
                <Space>
                  <Button type="primary" htmlType="submit" icon={<SearchOutlined />}>
                    查询
                  </Button>
                  <Button onClick={handleReset} icon={<ReloadOutlined />}>
                    重置
                  </Button>
                </Space>
              </Form.Item>
            </Col>
          </Row>
        </Form>
      </Card>

      {/* 数据表格 */}
      <Card
        title={
          <Space>
            <AlertOutlined />
            预警列表
          </Space>
        }
        extra={
          <Space>
            <Button onClick={handleBatchProcess} disabled={selectedRowKeys.length === 0}>
              批量处理
            </Button>
            <Button icon={<ExportOutlined />} onClick={handleExport}>
              导出
            </Button>
          </Space>
        }
      >
        <Table
          rowSelection={rowSelection}
          columns={columns}
          dataSource={alertData}
          rowKey="id"
          loading={loading}
          scroll={{ x: 1600 }}
          pagination={{
            total: alertData.length,
            pageSize: 10,
            showSizeChanger: true,
            showQuickJumper: true,
            showTotal: (total) => `共 ${total} 条`,
            pageSizeOptions: ['10', '20', '50', '100'],
          }}
        />
      </Card>
    </div>
  );
};

export default AlertList;
