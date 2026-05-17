import React, { useEffect } from 'react';
import { observer } from 'mobx-react-lite';
import { Card, Row, Col, Table, Tag, Badge, Button, Space, List, Avatar, Dropdown } from 'antd';
import {
  AlertOutlined,
  ClockCircleOutlined,
  WarningOutlined,
  RiseOutlined,
  FallOutlined,
  MinusOutlined,
  LineChartOutlined,
  BarChartOutlined,
  DownOutlined,
  CheckCircleOutlined,
  FileImageOutlined,
  TeamOutlined,
  ArrowRightOutlined,
} from '@ant-design/icons';
import Chart from 'react-apexcharts';
import type { ApexOptions } from 'apexcharts';
import { useNavigate } from '@umijs/max';
import { dashboardStore, alertStore, userStore } from '@/stores';
import './index.less';

// =================== ApexCharts 公用配置 ===================

/** sparkline 通用底色配置 */
const sparkBase: Partial<ApexOptions> = {
  chart: {
    fontFamily: 'inherit',
    sparkline: { enabled: true },
    animations: { enabled: false },
    toolbar: { show: false },
  },
  tooltip: { theme: 'dark' },
  grid: { strokeDashArray: 4 },
};

// =================== KpiCard 子组件 ===================

type TrendType = 'up' | 'down' | 'flat';
type SparkType = 'area' | 'line' | 'column' | 'gauge';

interface KpiCardProps {
  label: string;
  value: React.ReactNode;
  /** 涨跌百分比,正数=涨,负数=跌,0=持平,undefined=不显示徽章 */
  trendValue?: number;
  /** 涨= 好(默认绿)? 设 false 表示涨= 坏(预警卡用) */
  trendIsGood?: boolean;
  subText?: React.ReactNode;
  sparkData: number[];
  sparkType: SparkType;
  /** sparkline 着色 */
  color: string;
  /** sparkline 高度,默认 60(小) / 96(大) / 130(gauge) */
  sparkHeight?: number;
  /** 仪表盘数值(0~1),仅 gauge 类型需要 */
  gaugePercent?: number;
}

function getTrendType(v: number | undefined): TrendType {
  if (v === undefined || v === 0) return 'flat';
  return v > 0 ? 'up' : 'down';
}

const KpiCard: React.FC<KpiCardProps> = ({
  label,
  value,
  trendValue,
  trendIsGood = true,
  subText,
  sparkData,
  sparkType,
  color,
  sparkHeight,
  gaugePercent,
}) => {
  const trendType = getTrendType(trendValue);
  const visualClass =
    trendType === 'flat'
      ? 'trend-flat'
      : (trendType === 'up') === trendIsGood
      ? 'trend-up'
      : 'trend-down';
  const trendIcon =
    trendType === 'up' ? (
      <RiseOutlined />
    ) : trendType === 'down' ? (
      <FallOutlined />
    ) : (
      <MinusOutlined />
    );

  const height = sparkHeight ?? (sparkType === 'gauge' ? 130 : 60);

  // ---------- 各类型 ApexCharts options ----------
  let options: ApexOptions = { ...sparkBase, colors: [color] };
  let series: any = [{ name: label, data: sparkData }];

  if (sparkType === 'area') {
    options = {
      ...sparkBase,
      chart: { ...sparkBase.chart, type: 'area', height },
      stroke: { width: 2, lineCap: 'round', curve: 'smooth' },
      fill: { type: 'solid', opacity: 0.16 },
      colors: [color],
    };
  } else if (sparkType === 'line') {
    options = {
      ...sparkBase,
      chart: { ...sparkBase.chart, type: 'line', height },
      stroke: { width: 2, lineCap: 'round', curve: 'smooth' },
      colors: [color],
    };
  } else if (sparkType === 'column') {
    options = {
      ...sparkBase,
      chart: { ...sparkBase.chart, type: 'bar', height },
      plotOptions: { bar: { columnWidth: '50%' } },
      dataLabels: { enabled: false },
      colors: [color],
    };
  } else if (sparkType === 'gauge') {
    // 半圆仪表盘
    options = {
      chart: {
        type: 'radialBar',
        fontFamily: 'inherit',
        height,
        sparkline: { enabled: true },
        animations: { enabled: false },
      },
      plotOptions: {
        radialBar: {
          startAngle: -120,
          endAngle: 120,
          hollow: { margin: 16, size: '50%' },
          track: { background: '#f0f0f0', strokeWidth: '100%' },
          dataLabels: {
            name: { show: false },
            value: {
              offsetY: -4,
              fontSize: '20px',
              fontWeight: 700,
              color: '#1f1f1f',
              formatter: () => String(value),
            },
          },
        },
      },
      colors: [color],
      stroke: { lineCap: 'round' },
    };
    series = [Math.round((gaugePercent ?? 0) * 100)];
  }

  return (
    <Card className={`kpi-card${sparkType === 'gauge' ? ' kpi-card-gauge' : ''}`} bordered={false}>
      <div className="kpi-body">
        <div className="kpi-head">
          <span className="kpi-label">{label}</span>
          {trendValue !== undefined && (
            <span className={`kpi-trend ${visualClass}`}>
              {trendIcon}
              <span>{Math.abs(trendValue)}%</span>
            </span>
          )}
        </div>
        {sparkType !== 'gauge' && <div className="kpi-value">{value}</div>}
        {subText && <div className="kpi-subtext">{subText}</div>}
      </div>
      <div className="kpi-sparkline" style={{ height }}>
        <Chart
          options={options}
          series={series}
          type={sparkType === 'gauge' ? 'radialBar' : sparkType === 'column' ? 'bar' : sparkType}
          height={height}
        />
      </div>
    </Card>
  );
};

// =================== 时间窗下拉(纯样式,数据不切换) ===================

const timeRangeMenuItems = [
  { key: '7d', label: '近 7 天' },
  { key: '30d', label: '近 30 天' },
  { key: '3m', label: '近 3 月' },
];

const TimeRangeDropdown: React.FC = () => (
  <Dropdown menu={{ items: timeRangeMenuItems, defaultSelectedKeys: ['7d'], selectable: true }}>
    <a onClick={(e) => e.preventDefault()} style={{ color: '#8c8c8c', fontSize: 12 }}>
      近 7 天 <DownOutlined style={{ fontSize: 10 }} />
    </a>
  </Dropdown>
);

// =================== Dashboard ===================

const Dashboard: React.FC = observer(() => {
  const navigate = useNavigate();

  useEffect(() => {
    dashboardStore.fetchDashboardData();
    if (alertStore.alerts.length === 0) {
      alertStore.fetchAlerts({ pageSize: 50 });
    }
  }, []);

  const liveStats = dashboardStore.stats;
  const liveAlertCount = alertStore.total;
  const liveCritical = alertStore.criticalAlerts.length;

  // 模拟数据
  const mockData = {
    attendance: { rate: 95.6, total: 1250, checkedIn: 1195, absent: 55, trend: 2.3 },
    alerts: { total: 28, critical: 5, warning: 12, info: 11, trend: -15.2 },
    approvals: { pending: 18, material: 8, leave: 6, filing: 4, trend: 8.5 },
    households: { total: 1250, active: 1195, trend: 0 },
    expiring: [
      { id: '1', name: '张三', type: 'leave', expireDate: '2025-11-20', days: 2 },
      { id: '2', name: '李四', type: 'filing', expireDate: '2025-11-22', days: 4 },
      { id: '3', name: '王五', type: 'leave', expireDate: '2025-11-19', days: 1 },
      { id: '4', name: '赵六', type: 'filing', expireDate: '2025-11-23', days: 5 },
      { id: '5', name: '钱七', type: 'leave', expireDate: '2025-11-21', days: 3 },
      { id: '6', name: '孙八', type: 'filing', expireDate: '2025-11-25', days: 7 },
      { id: '7', name: '周九', type: 'leave', expireDate: '2025-11-19', days: 1 },
      { id: '8', name: '吴十', type: 'filing', expireDate: '2025-11-26', days: 8 },
      { id: '9', name: '郑十一', type: 'leave', expireDate: '2025-11-22', days: 4 },
      { id: '10', name: '王十二', type: 'filing', expireDate: '2025-11-28', days: 10 },
      { id: '11', name: '冯十三', type: 'leave', expireDate: '2025-11-20', days: 2 },
      { id: '12', name: '陈十四', type: 'filing', expireDate: '2025-12-01', days: 13 },
    ],
    recentAlerts: [
      { id: '1', user: '赵六', type: '位置偏离', level: 'critical', time: '10分钟前' },
      { id: '2', user: '孙七', type: '人脸不匹配', level: 'warning', time: '25分钟前' },
      { id: '3', user: '周八', type: '连续缺卡', level: 'critical', time: '1小时前' },
      { id: '4', user: '吴九', type: '位置偏离', level: 'info', time: '2小时前' },
      { id: '5', user: '郑十', type: '请假超时', level: 'warning', time: '3小时前' },
      { id: '6', user: '王二', type: '人脸不匹配', level: 'critical', time: '4小时前' },
      { id: '7', user: '李五', type: '位置偏离', level: 'warning', time: '5小时前' },
      { id: '8', user: '张三', type: '连续缺卡', level: 'info', time: '6小时前' },
      { id: '9', user: '陈一', type: '备案过期', level: 'warning', time: '8小时前' },
      { id: '10', user: '刘四', type: '异常打卡', level: 'critical', time: '昨天' },
      { id: '11', user: '黄二', type: '位置偏离', level: 'info', time: '昨天' },
      { id: '12', user: '林六', type: '人脸不匹配', level: 'warning', time: '昨天' },
    ],
  };

  // 4 张 KPI 卡的 sparkline mock(7 个数据点)
  const sparkAttendance = [93.2, 94.1, 92.8, 95.3, 93.5, 96.1, 95.6];
  const sparkAlerts = [22, 35, 28, 42, 30, 31, 28];
  const sparkApprovals = [12, 14, 16, 13, 17, 19, 18];
  const sparkHouseholds = [1180, 1185, 1190, 1188, 1192, 1198, 1195];

  // 详细预警列表数据(底部 Table)
  const alertListData = [
    { id: '1', userName: '赵六', phone: '138****5678', alertType: '位置偏离', level: 'critical', location: '西城区德胜街道', time: '2025-11-19 14:20', status: 'pending', description: '打卡位置与备案地址相差超过500米' },
    { id: '2', userName: '孙七', phone: '139****1234', alertType: '人脸不匹配', level: 'warning', location: '朝阳区建外街道', time: '2025-11-19 13:45', status: 'pending', description: '人脸识别相似度低于阈值' },
    { id: '3', userName: '周八', phone: '136****9876', alertType: '连续缺卡', level: 'critical', location: '海淀区中关村街道', time: '2025-11-19 12:00', status: 'processing', description: '连续3天未打卡' },
    { id: '4', userName: '吴九', phone: '137****5432', alertType: '位置偏离', level: 'info', location: '东城区东华门街道', time: '2025-11-19 11:30', status: 'resolved', description: '打卡位置与备案地址相差300米' },
    { id: '5', userName: '郑十', phone: '135****8765', alertType: '请假超时', level: 'warning', location: '丰台区右安门街道', time: '2025-11-19 10:15', status: 'pending', description: '请假到期后未及时销假' },
    { id: '6', userName: '王二', phone: '133****4321', alertType: '人脸不匹配', level: 'critical', location: '石景山区八宝山街道', time: '2025-11-19 09:50', status: 'processing', description: '打卡人脸与系统照片严重不符' },
    { id: '7', userName: '李五', phone: '132****6543', alertType: '位置偏离', level: 'warning', location: '西城区月坛街道', time: '2025-11-19 09:20', status: 'pending', description: '打卡位置与备案地址相差400米' },
    { id: '8', userName: '张三', phone: '131****2109', alertType: '连续缺卡', level: 'info', location: '朝阳区三里屯街道', time: '2025-11-19 08:45', status: 'resolved', description: '连续2天未打卡，已补卡' },
  ];

  // 打卡率趋势(中部 Line)
  const attendanceTrendData = [
    { date: '11-13', rate: 93.2 },
    { date: '11-14', rate: 94.1 },
    { date: '11-15', rate: 92.8 },
    { date: '11-16', rate: 95.3 },
    { date: '11-17', rate: 93.5 },
    { date: '11-18', rate: 96.1 },
    { date: '11-19', rate: 95.6 },
  ];

  // 预警趋势叠加柱(7 天 × 3 类预警)
  const alertStackData = [
    { date: '11-13', type: '位置偏离', value: 5 },
    { date: '11-13', type: '人脸不匹配', value: 3 },
    { date: '11-13', type: '连续缺卡', value: 2 },
    { date: '11-14', type: '位置偏离', value: 7 },
    { date: '11-14', type: '人脸不匹配', value: 4 },
    { date: '11-14', type: '连续缺卡', value: 1 },
    { date: '11-15', type: '位置偏离', value: 4 },
    { date: '11-15', type: '人脸不匹配', value: 5 },
    { date: '11-15', type: '连续缺卡', value: 3 },
    { date: '11-16', type: '位置偏离', value: 8 },
    { date: '11-16', type: '人脸不匹配', value: 4 },
    { date: '11-16', type: '连续缺卡', value: 2 },
    { date: '11-17', type: '位置偏离', value: 6 },
    { date: '11-17', type: '人脸不匹配', value: 6 },
    { date: '11-17', type: '连续缺卡', value: 4 },
    { date: '11-18', type: '位置偏离', value: 9 },
    { date: '11-18', type: '人脸不匹配', value: 5 },
    { date: '11-18', type: '连续缺卡', value: 3 },
    { date: '11-19', type: '位置偏离', value: 12 },
    { date: '11-19', type: '人脸不匹配', value: 8 },
    { date: '11-19', type: '连续缺卡', value: 5 },
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

  const alertColumns = [
    { title: '姓名', dataIndex: 'userName', key: 'userName', width: 100 },
    { title: '联系电话', dataIndex: 'phone', key: 'phone', width: 120 },
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
    { title: '所属区域', dataIndex: 'location', key: 'location', width: 150 },
    { title: '预警时间', dataIndex: 'time', key: 'time', width: 150 },
    {
      title: '处理状态',
      dataIndex: 'status',
      key: 'status',
      width: 100,
      render: (status: string) => (
        <Badge
          status={status === 'resolved' ? 'success' : status === 'processing' ? 'processing' : 'warning'}
          text={alertStatusConfig[status as keyof typeof alertStatusConfig].text}
        />
      ),
    },
    { title: '预警说明', dataIndex: 'description', key: 'description', ellipsis: true },
    {
      title: '操作',
      key: 'action',
      width: 150,
      fixed: 'right' as const,
      render: (_: any, record: any) => (
        <Space size="small">
          <Button type="link" size="small" onClick={() => navigate(`/monitor/alert/detail/${record.id}`)}>
            查看
          </Button>
          {record.status !== 'resolved' && (
            <Button type="link" size="small" onClick={() => console.log('处理预警', record.id)}>
              处理
            </Button>
          )}
        </Space>
      ),
    },
  ];

  const expiringColumns = [
    { title: '姓名', dataIndex: 'name', key: 'name' },
    {
      title: '类型',
      dataIndex: 'type',
      key: 'type',
      render: (type: string) => (
        <Tag color={type === 'leave' ? 'blue' : 'green'}>{type === 'leave' ? '请假' : '备案'}</Tag>
      ),
    },
    { title: '到期时间', dataIndex: 'expireDate', key: 'expireDate' },
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

  // 大数字优先用 store 真实值
  const kpiAttendanceValue = liveStats?.attendanceRate ?? `${mockData.attendance.rate}%`;
  const kpiAlertsValue = liveStats?.totalAlerts ?? liveAlertCount ?? mockData.alerts.total;
  const kpiPendingValue = liveStats?.pending ?? mockData.approvals.pending;
  const kpiHouseholdsValue = liveStats?.totalResidents ?? mockData.households.total;

  // 当前用户姓名(回退到账号、占位)
  const userName =
    (userStore.user as any)?.fullName ||
    (userStore.user as any)?.account ||
    '用户';

  // 顶部 4 张 stat 小卡数据(对齐 Tabler card-sm:方头像 + 主标题 + 副文案)
  const statCards = [
    {
      icon: <CheckCircleOutlined />,
      bg: '#1677ff',
      title: `${mockData.attendance.checkedIn} 人已打卡`,
      sub: `共 ${mockData.attendance.total} 人 / 缺卡 ${mockData.attendance.absent}`,
      onClick: () => navigate('/monitor/attendance'),
    },
    {
      icon: <AlertOutlined />,
      bg: '#cf1322',
      title: `${liveCritical || mockData.alerts.critical} 条严重预警`,
      sub: `共 ${liveStats?.totalAlerts ?? mockData.alerts.total} 条 / 待处理`,
      onClick: () => navigate('/monitor/alert-list'),
    },
    {
      icon: <FileImageOutlined />,
      bg: '#fa8c16',
      title: `${liveStats?.pending ?? mockData.approvals.pending} 条待审批`,
      sub: `材料 ${mockData.approvals.material} / 请假 ${mockData.approvals.leave} / 备案 ${mockData.approvals.filing}`,
      onClick: () => navigate('/approval/material'),
    },
    {
      icon: <ClockCircleOutlined />,
      bg: '#722ed1',
      title: `${mockData.expiring.length} 条到期提醒`,
      sub: `${mockData.expiring.filter((e) => e.days <= 3).length} 条 3 天内到期`,
      onClick: () => navigate('/monitor/alert-list'),
    },
  ];

  return (
    <div className="dashboard-container">
      {/* 第一行 — 左欢迎卡(占 6) + 右两张大 KPI(各占 3) */}
      <Row gutter={[16, 16]}>
        <Col xs={24} lg={12}>
          <Card className="welcome-card" bordered={false}>
            <div className="welcome-body">
              <div className="welcome-text">
                <div className="welcome-greeting">欢迎回来，{userName}</div>
                <div className="welcome-subtitle">
                  您有 {liveStats?.activeAlerts ?? mockData.alerts.warning} 条活跃预警，
                  {liveStats?.pending ?? mockData.approvals.pending} 条申请待审批。
                </div>
                <div className="welcome-mini-stats">
                  <div className="mini-stat">
                    <div className="mini-label">今日打卡率</div>
                    <div className="mini-value-row">
                      <span className="mini-value">{kpiAttendanceValue}</span>
                      <span className="mini-trend trend-up">
                        <RiseOutlined /> {mockData.attendance.trend}%
                      </span>
                    </div>
                  </div>
                  <div className="mini-stat">
                    <div className="mini-label">活跃保障户</div>
                    <div className="mini-value-row">
                      <span className="mini-value">
                        {liveStats?.activeHouseholds ?? mockData.households.active}
                      </span>
                      <span className="mini-trend trend-flat">
                        <MinusOutlined /> 持平
                      </span>
                    </div>
                  </div>
                </div>
                <div className="welcome-actions">
                  <Button
                    type="primary"
                    icon={<ArrowRightOutlined />}
                    onClick={() => navigate('/monitor/alert-list')}
                  >
                    查看全部预警
                  </Button>
                  <Button onClick={() => navigate('/approval/material')}>处理审批</Button>
                </div>
              </div>
              <div className="welcome-illustration">
                <div className="illu-tile illu-blue">
                  <CheckCircleOutlined />
                  <div className="illu-num">{mockData.attendance.checkedIn}</div>
                  <div className="illu-label">今日打卡</div>
                </div>
                <div className="illu-tile illu-red">
                  <AlertOutlined />
                  <div className="illu-num">{liveCritical || mockData.alerts.critical}</div>
                  <div className="illu-label">严重预警</div>
                </div>
                <div className="illu-tile illu-purple">
                  <TeamOutlined />
                  <div className="illu-num">
                    {liveStats?.totalResidents ?? mockData.households.total}
                  </div>
                  <div className="illu-label">保障户</div>
                </div>
                <div className="illu-tile illu-orange">
                  <ClockCircleOutlined />
                  <div className="illu-num">{mockData.expiring.length}</div>
                  <div className="illu-label">到期</div>
                </div>
              </div>
            </div>
          </Card>
        </Col>

        {/* 右上两张大 KPI — 对应原型 Total Users / Active Users */}
        <Col xs={24} sm={12} lg={6}>
          <KpiCard
            label="保障户总数"
            value={kpiHouseholdsValue}
            trendValue={mockData.households.trend}
            subText={`活跃家庭 ${liveStats?.activeHouseholds ?? mockData.households.active}`}
            sparkData={sparkHouseholds}
            sparkType="area"
            sparkHeight={96}
            color="#722ed1"
          />
        </Col>

        <Col xs={24} sm={12} lg={6}>
          <KpiCard
            label="今日打卡率"
            value={kpiAttendanceValue}
            trendValue={mockData.attendance.trend}
            sparkData={sparkAttendance}
            sparkType="gauge"
            gaugePercent={
              parseFloat(String(kpiAttendanceValue).replace(/%/g, '')) / 100 || 0.956
            }
            color="#52c41a"
          />
        </Col>
      </Row>

      {/* 第二行 — 4 张业务 stat 小卡(原型「sales/orders/shares/likes」位置) */}
      <Row gutter={[16, 16]} style={{ marginTop: 16 }}>
        {statCards.map((s, i) => (
          <Col key={i} xs={12} lg={6}>
            <Card
              className="stat-mini"
              bordered={false}
              hoverable
              onClick={s.onClick}
            >
              <div className="stat-mini-row">
                <div className="stat-mini-icon" style={{ background: s.bg }}>
                  {s.icon}
                </div>
                <div className="stat-mini-text">
                  <div className="stat-mini-title">{s.title}</div>
                  <div className="stat-mini-sub">{s.sub}</div>
                </div>
              </div>
            </Card>
          </Col>
        ))}
      </Row>

      {/* 第三行 — 2 张带 sparkline 的 KPI 卡(预警总数 + 待审批) */}
      <Row gutter={[16, 16]} style={{ marginTop: 16 }}>
        <Col xs={24} sm={12} lg={12}>
          <KpiCard
            label="预警总数"
            value={kpiAlertsValue}
            trendValue={mockData.alerts.trend}
            trendIsGood={false}
            subText={
              <span className="kpi-pills">
                <span className="pill-critical">严重 {liveCritical || mockData.alerts.critical}</span>
                <span className="pill-warning">活跃 {liveStats?.activeAlerts ?? mockData.alerts.warning}</span>
                <span className="pill-info">已处置 {liveStats?.resolvedAlerts ?? mockData.alerts.info}</span>
              </span>
            }
            sparkData={sparkAlerts}
            sparkType="column"
            color="#cf1322"
          />
        </Col>

        <Col xs={24} sm={12} lg={12}>
          <KpiCard
            label="待审批"
            value={kpiPendingValue}
            trendValue={mockData.approvals.trend}
            trendIsGood={false}
            subText={
              <span className="kpi-pills">
                <span>材料 {mockData.approvals.material}</span>
                <span>请假 {mockData.approvals.leave}</span>
                <span>备案 {mockData.approvals.filing}</span>
              </span>
            }
            sparkData={sparkApprovals}
            sparkType="line"
            color="#1677ff"
          />
        </Col>
      </Row>

      {/* 数据展示区 — 最近预警 / 到期提醒 */}
      <Row gutter={[16, 16]} style={{ marginTop: 16 }} align="top" className="dashboard-scroll-row">
        <Col xs={24} lg={12} className="dashboard-scroll-col">
          <Card
            className="dashboard-scroll-card"
            styles={{
              body: {
                height: 380,
                maxHeight: 380,
                overflowY: 'auto',
                display: 'block',
                flex: 'none',
                padding: '8px 24px 16px',
              },
            }}
            title={
              <Space>
                <WarningOutlined />
                最近预警
              </Space>
            }
            extra={<a onClick={() => navigate('/monitor/alert-list')}>查看全部</a>}
            bordered={false}
          >
            <List
              dataSource={mockData.recentAlerts}
              renderItem={(item) => (
                <List.Item
                  actions={[
                    <Button type="link" size="small" onClick={() => navigate(`/monitor/alert/detail/${item.id}`)}>
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

        <Col xs={24} lg={12} className="dashboard-scroll-col">
          <Card
            className="dashboard-scroll-card"
            styles={{
              body: {
                height: 380,
                maxHeight: 380,
                overflowY: 'auto',
                display: 'block',
                flex: 'none',
                padding: '8px 24px 16px',
              },
            }}
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

      {/* 图表区 — 打卡率趋势 + 预警趋势叠加柱 */}
      <Row gutter={[16, 16]} style={{ marginTop: 16 }}>
        <Col xs={24} lg={12}>
          <Card
            title={
              <Space>
                <LineChartOutlined />
                打卡率趋势
              </Space>
            }
            extra={<TimeRangeDropdown />}
            bordered={false}
          >
            <Chart
              type="area"
              height={240}
              options={{
                chart: {
                  fontFamily: 'inherit',
                  toolbar: { show: false },
                  animations: { enabled: false },
                  parentHeightOffset: 0,
                },
                stroke: { width: 2, lineCap: 'round', curve: 'smooth' },
                fill: { type: 'gradient', gradient: { shadeIntensity: 1, opacityFrom: 0.32, opacityTo: 0.04, stops: [0, 100] } },
                dataLabels: { enabled: false },
                colors: ['#1677ff'],
                xaxis: { categories: attendanceTrendData.map((d) => d.date), axisBorder: { show: false } },
                yaxis: { min: 90, max: 100, labels: { formatter: (v) => `${v}%` } },
                grid: { strokeDashArray: 4 },
                tooltip: { theme: 'dark', y: { formatter: (v) => `${v}%` } },
              }}
              series={[{ name: '打卡率', data: attendanceTrendData.map((d) => d.rate) }]}
            />
          </Card>
        </Col>

        <Col xs={24} lg={12}>
          <Card
            title={
              <Space>
                <BarChartOutlined />
                预警趋势
              </Space>
            }
            extra={<TimeRangeDropdown />}
            bordered={false}
          >
            <Chart
              type="bar"
              height={240}
              options={{
                chart: {
                  fontFamily: 'inherit',
                  toolbar: { show: false },
                  animations: { enabled: false },
                  stacked: true,
                  parentHeightOffset: 0,
                },
                plotOptions: { bar: { columnWidth: '50%', borderRadius: 4 } },
                dataLabels: { enabled: false },
                colors: ['#1677ff', '#722ed1', '#fa8c16'],
                xaxis: {
                  categories: Array.from(new Set(alertStackData.map((d) => d.date))),
                  axisBorder: { show: false },
                },
                yaxis: { labels: { formatter: (v) => `${v}` } },
                grid: { strokeDashArray: 4 },
                legend: { position: 'top', horizontalAlign: 'right' },
                tooltip: { theme: 'dark', y: { formatter: (v) => `${v} 次` } },
              }}
              series={[
                {
                  name: '位置偏离',
                  data: alertStackData.filter((d) => d.type === '位置偏离').map((d) => d.value),
                },
                {
                  name: '人脸不匹配',
                  data: alertStackData.filter((d) => d.type === '人脸不匹配').map((d) => d.value),
                },
                {
                  name: '连续缺卡',
                  data: alertStackData.filter((d) => d.type === '连续缺卡').map((d) => d.value),
                },
              ]}
            />
          </Card>
        </Col>
      </Row>

      {/* 预警列表(底部) */}
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
                <Button type="primary" size="small" onClick={() => navigate('/monitor/alert-list')}>
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
