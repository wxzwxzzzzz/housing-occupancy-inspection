import React, { useEffect } from 'react';
import { observer } from 'mobx-react-lite';
import { Card, Row, Col, Statistic, Table, Tag, Badge, Button, Space, Progress, List, Avatar } from 'antd';
import {
  UserOutlined,
  AlertOutlined,
  CheckCircleOutlined,
  ClockCircleOutlined,
  WarningOutlined,
  FileTextOutlined,
  EnvironmentOutlined,
  TeamOutlined,
  RiseOutlined,
  FallOutlined,
  LineChartOutlined,
  BarChartOutlined,
} from '@ant-design/icons';
import { Line, Column, Area } from '@ant-design/charts';
import { useNavigate } from '@umijs/max';
import { dashboardStore, alertStore } from '@/stores';
import './index.less';

const Dashboard: React.FC = observer(() => {
  const navigate = useNavigate();

  useEffect(() => {
    dashboardStore.fetchDashboardData();
    if (alertStore.alerts.length === 0) {
      alertStore.fetchAlerts({ pageSize: 50 });
    }
  }, []);

  // 真实业务指标(从 store/本体取),其他展示性 mock 暂时保留
  const liveStats = dashboardStore.stats;
  const liveAlertCount = alertStore.total;
  const liveCritical = alertStore.criticalAlerts.length;

  // 模拟数据
  const mockData = {
    attendance: {
      rate: 95.6,
      total: 1250,
      checkedIn: 1195,
      absent: 55,
      trend: 2.3,
    },
    alerts: {
      total: 28,
      critical: 5,
      warning: 12,
      info: 11,
      trend: -15.2,
    },
    approvals: {
      pending: 18,
      material: 8,
      leave: 6,
      filing: 4,
    },
    expiring: [
      { id: '1', name: '张三', type: 'leave', expireDate: '2025-11-20', days: 2 },
      { id: '2', name: '李四', type: 'filing', expireDate: '2025-11-22', days: 4 },
      { id: '3', name: '王五', type: 'leave', expireDate: '2025-11-19', days: 1 },
    ],
    recentAlerts: [
      { id: '1', user: '赵六', type: '位置偏离', level: 'critical', time: '10分钟前' },
      { id: '2', user: '孙七', type: '人脸不匹配', level: 'warning', time: '25分钟前' },
      { id: '3', user: '周八', type: '连续缺卡', level: 'critical', time: '1小时前' },
      { id: '4', user: '吴九', type: '位置偏离', level: 'info', time: '2小时前' },
    ],
  };

  // 详细预警列表数据
  const alertListData = [
    {
      id: '1',
      userName: '赵六',
      phone: '138****5678',
      alertType: '位置偏离',
      level: 'critical',
      location: '西城区德胜街道',
      time: '2025-11-19 14:20',
      status: 'pending',
      description: '打卡位置与备案地址相差超过500米',
    },
    {
      id: '2',
      userName: '孙七',
      phone: '139****1234',
      alertType: '人脸不匹配',
      level: 'warning',
      location: '朝阳区建外街道',
      time: '2025-11-19 13:45',
      status: 'pending',
      description: '人脸识别相似度低于阈值',
    },
    {
      id: '3',
      userName: '周八',
      phone: '136****9876',
      alertType: '连续缺卡',
      level: 'critical',
      location: '海淀区中关村街道',
      time: '2025-11-19 12:00',
      status: 'processing',
      description: '连续3天未打卡',
    },
    {
      id: '4',
      userName: '吴九',
      phone: '137****5432',
      alertType: '位置偏离',
      level: 'info',
      location: '东城区东华门街道',
      time: '2025-11-19 11:30',
      status: 'resolved',
      description: '打卡位置与备案地址相差300米',
    },
    {
      id: '5',
      userName: '郑十',
      phone: '135****8765',
      alertType: '请假超时',
      level: 'warning',
      location: '丰台区右安门街道',
      time: '2025-11-19 10:15',
      status: 'pending',
      description: '请假到期后未及时销假',
    },
    {
      id: '6',
      userName: '王二',
      phone: '133****4321',
      alertType: '人脸不匹配',
      level: 'critical',
      location: '石景山区八宝山街道',
      time: '2025-11-19 09:50',
      status: 'processing',
      description: '打卡人脸与系统照片严重不符',
    },
    {
      id: '7',
      userName: '李五',
      phone: '132****6543',
      alertType: '位置偏离',
      level: 'warning',
      location: '西城区月坛街道',
      time: '2025-11-19 09:20',
      status: 'pending',
      description: '打卡位置与备案地址相差400米',
    },
    {
      id: '8',
      userName: '张三',
      phone: '131****2109',
      alertType: '连续缺卡',
      level: 'info',
      location: '朝阳区三里屯街道',
      time: '2025-11-19 08:45',
      status: 'resolved',
      description: '连续2天未打卡，已补卡',
    },
  ];

  // 图表数据 - 打卡率趋势（折线图）
  const attendanceTrendData = [
    { date: '11-13', rate: 93.2 },
    { date: '11-14', rate: 94.1 },
    { date: '11-15', rate: 92.8 },
    { date: '11-16', rate: 95.3 },
    { date: '11-17', rate: 93.5 },
    { date: '11-18', rate: 96.1 },
    { date: '11-19', rate: 95.6 },
  ];

  // 图表数据 - 预警类型分布（柱状图）
  const alertTypeData = [
    { type: '位置偏离', count: 12 },
    { type: '人脸不匹配', count: 8 },
    { type: '连续缺卡', count: 5 },
    { type: '请假超时', count: 3 },
  ];

  // 图表数据 - 打卡人数趋势（面积图）
  const attendanceCountData = [
    { date: '11-13', count: 1165 },
    { date: '11-14', count: 1176 },
    { date: '11-15', count: 1160 },
    { date: '11-16', count: 1191 },
    { date: '11-17', count: 1169 },
    { date: '11-18', count: 1201 },
    { date: '11-19', count: 1195 },
  ];

  const alertLevelConfig = {
    critical: { text: '严重', color: 'red' },
    warning: { text: '警告', color: 'orange' },
    info: { text: '提示', color: 'blue' },
  };

  const alertStatusConfig = {
    pending: { text: '待处理', color: 'orange' },
    processing: { text: '处理中', color: 'blue' },
    resolved: { text: '已解决', color: 'green' },
  };

  // 预警列表表格列配置
  const alertColumns = [
    {
      title: '姓名',
      dataIndex: 'userName',
      key: 'userName',
      width: 100,
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
      render: (type: string, record: any) => (
        <Tag color={alertLevelConfig[record.level as keyof typeof alertLevelConfig].color}>
          {type}
        </Tag>
      ),
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
      width: 150,
    },
    {
      title: '处理状态',
      dataIndex: 'status',
      key: 'status',
      width: 100,
      render: (status: string) => (
        <Badge
          status={
            status === 'resolved'
              ? 'success'
              : status === 'processing'
              ? 'processing'
              : 'warning'
          }
          text={alertStatusConfig[status as keyof typeof alertStatusConfig].text}
        />
      ),
    },
    {
      title: '预警说明',
      dataIndex: 'description',
      key: 'description',
      ellipsis: true,
    },
    {
      title: '操作',
      key: 'action',
      width: 150,
      fixed: 'right' as const,
      render: (_: any, record: any) => (
        <Space size="small">
          <Button
            type="link"
            size="small"
            onClick={() => navigate(`/alert/detail/${record.id}`)}
          >
            查看
          </Button>
          {record.status !== 'resolved' && (
            <Button
              type="link"
              size="small"
              onClick={() => console.log('处理预警', record.id)}
            >
              处理
            </Button>
          )}
        </Space>
      ),
    },
  ];

  const expiringColumns = [
    {
      title: '姓名',
      dataIndex: 'name',
      key: 'name',
    },
    {
      title: '类型',
      dataIndex: 'type',
      key: 'type',
      render: (type: string) => (
        <Tag color={type === 'leave' ? 'blue' : 'green'}>
          {type === 'leave' ? '请假' : '备案'}
        </Tag>
      ),
    },
    {
      title: '到期时间',
      dataIndex: 'expireDate',
      key: 'expireDate',
    },
    {
      title: '剩余天数',
      dataIndex: 'days',
      key: 'days',
      render: (days: number) => (
        <span style={{ color: days <= 1 ? '#ff4d4f' : days <= 3 ? '#faad14' : '#52c41a' }}>
          {days} 天
        </span>
      ),
    },
  ];

  return (
    <div className="dashboard-container">
      {/* 核心指标卡片 */}
      <Row gutter={[16, 16]}>
        <Col xs={24} sm={12} lg={6}>
          <Card className="stat-card" bordered={false}>
            <Statistic
              title="今日打卡率"
              value={liveStats?.attendanceRate ?? `${mockData.attendance.rate}%`}
              prefix={<UserOutlined />}
              valueStyle={{ color: '#3f8600' }}
            />
            <div className="stat-footer">
              <Space>
                {mockData.attendance.trend > 0 ? (
                  <RiseOutlined style={{ color: '#3f8600' }} />
                ) : (
                  <FallOutlined style={{ color: '#cf1322' }} />
                )}
                <span className={mockData.attendance.trend > 0 ? 'trend-up' : 'trend-down'}>
                  {Math.abs(mockData.attendance.trend)}%
                </span>
                <span className="trend-desc">较昨日</span>
              </Space>
            </div>
            <Progress
              percent={parseFloat(liveStats?.attendanceRate ?? '0') || mockData.attendance.rate}
              strokeColor="#52c41a"
              showInfo={false}
              size="small"
              style={{ marginTop: 8 }}
            />
          </Card>
        </Col>

        <Col xs={24} sm={12} lg={6}>
          <Card className="stat-card" bordered={false}>
            <Statistic
              title="预警总数"
              value={liveStats?.totalAlerts ?? liveAlertCount}
              prefix={<AlertOutlined />}
              valueStyle={{ color: '#cf1322' }}
            />
            <div className="stat-footer">
              <Space>
                <span className="alert-critical">红色 {liveCritical}</span>
                <span className="alert-warning">活跃 {liveStats?.activeAlerts ?? mockData.alerts.warning}</span>
                <span className="alert-info">已处置 {liveStats?.resolvedAlerts ?? mockData.alerts.info}</span>
              </Space>
            </div>
          </Card>
        </Col>

        <Col xs={24} sm={12} lg={6}>
          <Card className="stat-card" bordered={false}>
            <Statistic
              title="待审批"
              value={liveStats?.pending ?? mockData.approvals.pending}
              prefix={<FileTextOutlined />}
              valueStyle={{ color: '#1890ff' }}
            />
            <div className="stat-footer">
              <Space>
                <span>材料 {mockData.approvals.material}</span>
                <span>请假 {mockData.approvals.leave}</span>
                <span>备案 {mockData.approvals.filing}</span>
              </Space>
            </div>
          </Card>
        </Col>

        <Col xs={24} sm={12} lg={6}>
          <Card className="stat-card" bordered={false}>
            <Statistic
              title="保障户总数"
              value={liveStats?.totalResidents ?? mockData.attendance.total}
              prefix={<TeamOutlined />}
              valueStyle={{ color: '#722ed1' }}
            />
            <div className="stat-footer">
              <Space>
                <CheckCircleOutlined style={{ color: '#52c41a' }} />
                <span>活跃家庭 {liveStats?.activeHouseholds ?? mockData.attendance.checkedIn}</span>
              </Space>
            </div>
          </Card>
        </Col>
      </Row>

      {/* 数据展示区域 */}
      <Row gutter={[16, 16]} style={{ marginTop: 16 }}>
        {/* 最近预警 */}
        <Col xs={24} lg={12}>
          <Card
            title={
              <Space>
                <WarningOutlined />
                最近预警
              </Space>
            }
            extra={<a onClick={() => navigate('/alert/list')}>查看全部</a>}
            bordered={false}
          >
            <List
              dataSource={mockData.recentAlerts}
              renderItem={(item) => (
                <List.Item
                  actions={[
                    <Button type="link" size="small" onClick={() => navigate(`/alert/detail/${item.id}`)}>
                      处理
                    </Button>,
                  ]}
                >
                  <List.Item.Meta
                    avatar={
                      <Badge dot color={alertLevelConfig[item.level as keyof typeof alertLevelConfig].color}>
                        <Avatar icon={<AlertOutlined />} style={{ backgroundColor: '#f5f5f5', color: '#999' }} />
                      </Badge>
                    }
                    title={
                      <Space>
                        <span>{item.user}</span>
                        <Tag color={alertLevelConfig[item.level as keyof typeof alertLevelConfig].color}>
                          {item.type}
                        </Tag>
                      </Space>
                    }
                    description={
                      <Space>
                        <ClockCircleOutlined />
                        <span style={{ color: '#999' }}>{item.time}</span>
                      </Space>
                    }
                  />
                </List.Item>
              )}
            />
          </Card>
        </Col>

        {/* 到期提醒 */}
        <Col xs={24} lg={12}>
          <Card
            title={
              <Space>
                <ClockCircleOutlined />
                到期提醒
              </Space>
            }
            extra={<Badge count={mockData.expiring.length} />}
            bordered={false}
          >
            <Table
              dataSource={mockData.expiring}
              columns={expiringColumns}
              pagination={false}
              size="small"
              rowKey="id"
            />
          </Card>
        </Col>
      </Row>

      {/* 图表展示区域 */}
      <Row gutter={[16, 16]} style={{ marginTop: 16 }}>
        {/* 打卡率趋势折线图 */}
        <Col xs={24} lg={12}>
          <Card
            title={
              <Space>
                <LineChartOutlined />
                打卡率趋势
              </Space>
            }
            bordered={false}
          >
            <Line
              data={attendanceTrendData}
              xField="date"
              yField="rate"
              smooth
              point={{
                size: 5,
                shape: 'circle',
              }}
              label={{
                style: {
                  fill: '#aaa',
                },
              }}
              color="#1890ff"
              yAxis={{
                min: 90,
                max: 100,
                label: {
                  formatter: (v) => `${v}%`,
                },
              }}
              tooltip={{
                formatter: (datum) => {
                  return { name: '打卡率', value: `${datum.rate}%` };
                },
              }}
              height={300}
            />
          </Card>
        </Col>

        {/* 打卡人数趋势面积图 */}
        <Col xs={24} lg={12}>
          <Card
            title={
              <Space>
                <LineChartOutlined />
                打卡人数趋势
              </Space>
            }
            bordered={false}
          >
            <Area
              data={attendanceCountData}
              xField="date"
              yField="count"
              smooth
              areaStyle={{
                fill: 'l(270) 0:#ffffff 0.5:#7ec2f3 1:#1890ff',
              }}
              color="#1890ff"
              yAxis={{
                label: {
                  formatter: (v) => `${v}人`,
                },
              }}
              tooltip={{
                formatter: (datum) => {
                  return { name: '打卡人数', value: `${datum.count}人` };
                },
              }}
              height={300}
            />
          </Card>
        </Col>
      </Row>

      {/* 预警统计柱状图 */}
      <Row gutter={[16, 16]} style={{ marginTop: 16 }}>
        <Col xs={24} lg={12}>
          <Card
            title={
              <Space>
                <BarChartOutlined />
                预警类型分布
              </Space>
            }
            bordered={false}
          >
            <Column
              data={alertTypeData}
              xField="type"
              yField="count"
              label={{
                position: 'top',
                style: {
                  fill: '#000000',
                  opacity: 0.6,
                },
              }}
              color="#ff4d4f"
              columnStyle={{
                radius: [8, 8, 0, 0],
              }}
              yAxis={{
                label: {
                  formatter: (v) => `${v}次`,
                },
              }}
              tooltip={{
                formatter: (datum) => {
                  return { name: '预警次数', value: `${datum.count}次` };
                },
              }}
              height={300}
            />
          </Card>
        </Col>

        {/* 快捷操作 */}
        <Col xs={24} lg={12}>
          <Card title="快捷操作" bordered={false}>
            <Space size="large" wrap>
              <Button
                type="primary"
                icon={<FileTextOutlined />}
                onClick={() => navigate('/approval/list')}
                size="large"
              >
                审批队列
              </Button>
              <Button
                icon={<WarningOutlined />}
                onClick={() => navigate('/alert/list')}
                size="large"
              >
                预警处置
              </Button>
              <Button
                icon={<UserOutlined />}
                onClick={() => navigate('/attendance/list')}
                size="large"
              >
                打卡记录
              </Button>
              <Button
                icon={<EnvironmentOutlined />}
                onClick={() => navigate('/report/export')}
                size="large"
              >
                导出报表
              </Button>
            </Space>
          </Card>
        </Col>
      </Row>

      {/* 预警列表 */}
      <Row gutter={[16, 16]} style={{ marginTop: 16 }}>
        <Col span={24}>
          <Card
            title={
              <Space>
                <AlertOutlined />
                预警列表
              </Space>
            }
            extra={
              <Space>
                <Button
                  type="primary"
                  size="small"
                  onClick={() => navigate('/alert/list')}
                >
                  查看更多
                </Button>
              </Space>
            }
            bordered={false}
          >
            <Table
              dataSource={alertListData}
              columns={alertColumns}
              rowKey="id"
              scroll={{ x: 1200 }}
              pagination={{
                pageSize: 5,
                showSizeChanger: true,
                showQuickJumper: true,
                showTotal: (total) => `共 ${total} 条`,
                pageSizeOptions: ['5', '10', '20', '50'],
              }}
            />
          </Card>
        </Col>
      </Row>
    </div>
  );
});

export default Dashboard;
