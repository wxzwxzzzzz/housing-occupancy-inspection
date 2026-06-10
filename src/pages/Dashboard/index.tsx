import {
  AlertOutlined,
  BankOutlined,
  BarChartOutlined,
  CalendarOutlined,
  CheckCircleOutlined,
  DownOutlined,
  FallOutlined,
  HomeOutlined,
  MinusOutlined,
  ReloadOutlined,
  RiseOutlined,
  RocketOutlined,
  SolutionOutlined,
  StopOutlined,
  TeamOutlined,
  UserAddOutlined,
} from '@ant-design/icons';
import { useNavigate } from '@umijs/max';
import {
  Button,
  Card,
  Col,
  Dropdown,
  Row,
  Space,
} from 'antd';
import type { ApexOptions } from 'apexcharts';
import { observer } from 'mobx-react-lite';
import React, { useEffect } from 'react';
import Chart from 'react-apexcharts';
import { alertStore, dashboardStore, userStore } from '@/stores';
import { wallCards } from './reportCards';
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
  /** 大卡(右上两张核心 KPI):更大数字 + 更高 sparkline */
  large?: boolean;
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
  large,
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

  const height = sparkHeight ?? (sparkType === 'gauge' ? 130 : large ? 96 : 60);

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
    <Card
      className={`kpi-card${sparkType === 'gauge' ? ' kpi-card-gauge' : ''}${
        large ? ' kpi-card-lg' : ''
      }`}
      bordered={false}
    >
      <div className="kpi-body">
        {/* 原型范式:小标题独占一行 → 大数字+涨跌同基线 → 副文案 */}
        <span className="kpi-label">{label}</span>
        {sparkType !== 'gauge' && (
          <div className="kpi-value-row">
            <span className="kpi-value">{value}</span>
            {trendValue !== undefined && (
              <span className={`kpi-trend ${visualClass}`}>
                {trendIcon}
                <span>{Math.abs(trendValue)}%</span>
              </span>
            )}
          </div>
        )}
        {subText && <div className="kpi-subtext">{subText}</div>}
      </div>
      <div className="kpi-sparkline" style={{ height }}>
        <Chart
          options={options}
          series={series}
          type={
            sparkType === 'gauge'
              ? 'radialBar'
              : sparkType === 'column'
                ? 'bar'
                : sparkType
          }
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
  <Dropdown
    menu={{
      items: timeRangeMenuItems,
      defaultSelectedKeys: ['7d'],
      selectable: true,
    }}
  >
    <a
      onClick={(e) => e.preventDefault()}
      style={{ color: '#8c8c8c', fontSize: 12 }}
    >
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
  const _liveCritical = alertStore.criticalAlerts.length;
  const summaries = dashboardStore.reportSummaries;

  // 真实趋势(来自 store,基于 AttendanceFact 按日聚合)
  const attendanceRateTrend = dashboardStore.attendanceRateTrend;
  const alertTypeTrend = dashboardStore.alertTypeTrend;

  // 顶部仪表盘/监测预警的 sparkline 回退(store 未就绪时用)
  const sparkAttendance = attendanceRateTrend.map((d) => d.rate);
  const sparkAlerts = alertTypeTrend.map((d) => d.invalid + d.missed);

  // 预警列表级别/状态展示配置(对齐 AlertItem: level=ALERT_*, status=pending/processing/resolved)
  const _levelTag: Record<string, { text: string; color: string }> = {
    ALERT_RED: { text: '红色预警', color: 'red' },
    ALERT_WARNING: { text: '预警', color: 'orange' },
    ALERT_INFO: { text: '提示', color: 'blue' },
  };
  const _statusTag: Record<string, { text: string; color: string }> = {
    pending: { text: '待处理', color: 'orange' },
    processing: { text: '处理中', color: 'blue' },
    resolved: { text: '已处置', color: 'green' },
  };

  // 欢迎卡 / KPI 的真实派生值(全部来自 store,无写死)
  const sumVal = (k: string) => summaries[k]?.value ?? 0;
  const checkedInToday = sumVal('attendance'); // 出勤率%(gauge 值)
  const _activeAlerts = liveStats?.activeAlerts ?? sumVal('alert');
  const _pendingApprovals =
    liveStats?.pending ??
    sumVal('eligibilityApplication') +
      sumVal('leave') +
      sumVal('attendanceMakeup');
  const _totalResidents =
    liveStats?.totalResidents ?? sumVal('residentSnapshot');
  const _activeHouseholds =
    liveStats?.activeHouseholds ?? sumVal('householdSnapshot');

  // 大数字优先用 store 真实值
  const kpiAttendanceValue = liveStats?.attendanceRate ?? `${checkedInToday}%`;
  const kpiAlertsValue = liveStats?.totalAlerts ?? liveAlertCount;

  // 当前用户姓名(回退到账号、占位)
  const userName =
    (userStore.user as any)?.fullName ||
    (userStore.user as any)?.account ||
    '用户';

  // 待办计数(各审批流 UNDER_APPROVAL + 待处置预警)
  const tc = dashboardStore.todoCounts;
  const todoItems = [
    { key: 'leave', label: '请假审批', icon: <CalendarOutlined />, count: tc?.leave ?? 0, path: '/monitor/leaves' },
    { key: 'makeup', label: '补卡审批', icon: <ReloadOutlined />, count: tc?.makeup ?? 0, path: '/monitor/makeups' },
    { key: 'migrant', label: '外出务工', icon: <RocketOutlined />, count: tc?.migrantWork ?? 0, path: '/monitor/migrant-works' },
    { key: 'application', label: '资质申请', icon: <SolutionOutlined />, count: tc?.application ?? 0, path: '/eligibility/applications' },
    { key: 'residence', label: '居住变更', icon: <HomeOutlined />, count: tc?.residenceChange ?? 0, path: '/monitor/residence-changes' },
    { key: 'employment', label: '工作变更', icon: <BankOutlined />, count: tc?.employmentChange ?? 0, path: '/monitor/employment-changes' },
    { key: 'member', label: '成员变更', icon: <TeamOutlined />, count: tc?.memberChange ?? 0, path: '/monitor/member-changes' },
    { key: 'termination', label: '资格终止', icon: <StopOutlined />, count: tc?.termination ?? 0, path: '/eligibility/terminations' },
    { key: 'alert', label: '待处置预警', icon: <AlertOutlined />, count: tc?.alert ?? 0, path: '/monitor/alert-list' },
  ];
  const todoTotal = todoItems.reduce((s, it) => s + it.count, 0);

  // ② 快捷入口
  const quickEntries = [
    { key: 'add-resident', label: '新增居民', icon: <UserAddOutlined />, bg: 'qe-blue', path: '/residents' },
    { key: 'add-household', label: '新增家庭', icon: <TeamOutlined />, bg: 'qe-green', path: '/profile/households' },
    { key: 'checkin', label: '考勤打卡', icon: <CheckCircleOutlined />, bg: 'qe-cyan', path: '/monitor/attendance' },
    { key: 'leave', label: '请假审批', icon: <CalendarOutlined />, bg: 'qe-orange', path: '/monitor/leaves' },
    { key: 'application', label: '资质申请', icon: <SolutionOutlined />, bg: 'qe-purple', path: '/eligibility/applications' },
    { key: 'report', label: '报表中心', icon: <BarChartOutlined />, bg: 'qe-gold', path: '/report/resident-snapshot' },
    { key: 'message', label: '消息中心', icon: <AlertOutlined />, bg: 'qe-pink', path: '/system/message' },
    { key: 'config', label: '系统配置', icon: <BankOutlined />, bg: 'qe-indigo', path: '/system/config' },
  ];

  // ③ 指标:居民激活 + 业务量
  const rs = dashboardStore.reportSummaries;
  const rb = dashboardStore.residentBreakdown;
  const activatedResidents = rb?.activated ?? 0;
  const inactiveResidents = rb?.inactive ?? 0;
  const indicatorCards = [
    { key: 'activated', label: '已激活居民', value: activatedResidents, color: '#389e0d', path: '/residents' },
    { key: 'inactive', label: '未激活居民', value: inactiveResidents, color: '#d46b08', path: '/residents' },
    { key: 'allocation', label: '实物配租', value: rs.housingAllocation?.value ?? 0, color: '#1d4ed8', path: '/eligibility/allocations' },
    { key: 'subsidy', label: '租赁补贴', value: rs.rentalSubsidy?.value ?? 0, color: '#08979c', path: '/eligibility/subsidies' },
    { key: 'termination', label: '资格终止', value: rs.eligibilityTermination?.value ?? 0, color: '#cf1322', path: '/eligibility/terminations' },
  ];

  // ④⑤⑥ 打卡/预警/消息 分项
  const ab = dashboardStore.attendanceBreakdown;
  const alb = dashboardStore.alertBreakdown;
  const mc = dashboardStore.messageCounts;

  return (
    <div className="dashboard-container">
      {/* 第一行 — 待办卡(占 6) + 右两张大 KPI(各占 3) */}
      <Row gutter={[16, 16]}>
        <Col xs={24} lg={12}>
          <Card className="todo-card" bordered={false}>
            <div className="todo-head">
              <div className="todo-head-left">
                <span className="todo-title">我的待办</span>
                <span className="todo-sub">
                  {userName}，您有待处理事项
                </span>
              </div>
              <div className="todo-total">
                <span className="todo-total-num">{todoTotal}</span>
                <span className="todo-total-unit">项待处理</span>
              </div>
            </div>
            {todoTotal === 0 ? (
              <div className="todo-empty">
                <CheckCircleOutlined />
                <span>暂无待办，一切已处理</span>
              </div>
            ) : (
              <div className="todo-grid">
                {todoItems.map((it) => (
                  <div
                    key={it.key}
                    className={`todo-item${it.count > 0 ? ' has' : ''}`}
                    onClick={() => navigate(it.path)}
                  >
                    <span className="todo-item-icon">{it.icon}</span>
                    <span className="todo-item-label">{it.label}</span>
                    <span className="todo-item-count">{it.count}</span>
                  </div>
                ))}
              </div>
            )}
          </Card>
        </Col>

        {/* 右上两张大 KPI — 今日打卡率(仪表盘) + 监测预警(柱) */}
        <Col xs={24} sm={12} lg={6}>
          <KpiCard
            label="今日打卡率"
            value={
              dashboardStore.reportSummaries.attendance
                ? `${dashboardStore.reportSummaries.attendance.value}%`
                : kpiAttendanceValue
            }
            sparkData={
              dashboardStore.reportSummaries.attendance?.sparkData?.length
                ? dashboardStore.reportSummaries.attendance.sparkData
                : sparkAttendance
            }
            sparkType="gauge"
            gaugePercent={
              dashboardStore.reportSummaries.attendance?.gauge ??
              (parseFloat(String(kpiAttendanceValue).replace(/%/g, '')) / 100 ||
                0.956)
            }
            color="#52c41a"
            large
          />
        </Col>

        <Col xs={24} sm={12} lg={6}>
          <KpiCard
            label="监测预警"
            value={
              dashboardStore.reportSummaries.alert?.value ?? kpiAlertsValue
            }
            trendIsGood={false}
            subText={dashboardStore.reportSummaries.alert?.sub ?? '异常 / 缺勤'}
            sparkData={
              dashboardStore.reportSummaries.alert?.sparkData?.length
                ? dashboardStore.reportSummaries.alert.sparkData
                : sparkAlerts
            }
            sparkType="column"
            color="#cf1322"
            large
          />
        </Col>
      </Row>

      {/* ② 快捷入口 */}
      <Card className="quick-entry-card" bordered={false} style={{ marginTop: 16 }}>
        <div className="quick-entry-grid">
          {quickEntries.map((q) => (
            <div
              key={q.key}
              className="quick-entry-item"
              onClick={() => navigate(q.path)}
            >
              <span className={`quick-entry-icon ${q.bg}`}>{q.icon}</span>
              <span className="quick-entry-label">{q.label}</span>
            </div>
          ))}
        </div>
      </Card>

      {/* ③ 指标 — 居民激活 + 业务量 */}
      <Row gutter={[16, 16]} style={{ marginTop: 16 }}>
        {indicatorCards.map((it) => (
          <Col key={it.key} xs={12} sm={8} lg={4}>
            <Card
              className="indicator-card"
              bordered={false}
              onClick={() => it.path && navigate(it.path)}
            >
              <div className="indicator-label">{it.label}</div>
              <div className="indicator-value" style={{ color: it.color }}>
                {it.value}
              </div>
            </Card>
          </Col>
        ))}
      </Row>

      <Row gutter={[16, 16]} style={{ marginTop: 16 }}>
        {wallCards.map((card) => {
          const s = dashboardStore.reportSummaries[card.key];
          const raw = s?.value ?? 0;
          const display =
            card.format === 'percent'
              ? `${raw}%`
              : card.format === 'currency'
                ? `¥${Number(raw).toLocaleString()}`
                : Number(raw).toLocaleString();
          const spark =
            s?.sparkData && s.sparkData.length > 0
              ? s.sparkData
              : [raw, raw, raw, raw, raw, raw, raw];
          return (
            <Col key={card.key} xs={12} sm={12} md={8} lg={6}>
              <div
                onClick={() => navigate(card.path)}
                style={{ cursor: 'pointer' }}
              >
                <KpiCard
                  label={card.title}
                  value={display}
                  subText={s?.sub}
                  sparkData={spark}
                  sparkType={card.spark === 'gauge' ? 'line' : card.spark}
                  color={card.color}
                  sparkHeight={48}
                />
              </div>
            </Col>
          );
        })}
      </Row>

      {/* ④ 打卡趋势 + ⑤ 预警类型 */}
      <Row gutter={[16, 16]} style={{ marginTop: 16 }}>
        <Col xs={24} lg={12}>
          <Card
            title="打卡趋势"
            extra={<TimeRangeDropdown />}
            bordered={false}
          >
            <div className="metric-strip">
              <div className="metric-cell">
                <span className="metric-num">{ab?.total ?? 0}</span>
                <span className="metric-lbl">打卡总数</span>
              </div>
              <div className="metric-cell">
                <span className="metric-num">{ab?.employment ?? 0}</span>
                <span className="metric-lbl">工作打卡</span>
              </div>
              <div className="metric-cell">
                <span className="metric-num">{ab?.residence ?? 0}</span>
                <span className="metric-lbl">居住打卡</span>
              </div>
              <div className="metric-cell">
                <span className="metric-num metric-good">{ab?.checked ?? 0}</span>
                <span className="metric-lbl">已打卡</span>
              </div>
              <div className="metric-cell">
                <span className="metric-num metric-warn">{ab?.pending ?? 0}</span>
                <span className="metric-lbl">预计打卡</span>
              </div>
              <div className="metric-cell">
                <span className="metric-num metric-bad">{ab?.missed ?? 0}</span>
                <span className="metric-lbl">超时未打</span>
              </div>
            </div>
            <Chart
              type="area"
              height={200}
              options={{
                chart: {
                  fontFamily: 'inherit',
                  toolbar: { show: false },
                  animations: { enabled: false },
                  parentHeightOffset: 0,
                },
                stroke: { width: 2, lineCap: 'round', curve: 'smooth' },
                fill: {
                  type: 'gradient',
                  gradient: {
                    shadeIntensity: 1,
                    opacityFrom: 0.32,
                    opacityTo: 0.04,
                    stops: [0, 100],
                  },
                },
                dataLabels: { enabled: false },
                colors: ['#1d4ed8'],
                xaxis: {
                  categories: attendanceRateTrend.map((d) => d.date),
                  axisBorder: { show: false },
                },
                yaxis: {
                  min: 0,
                  max: 100,
                  labels: { formatter: (v) => `${v}%` },
                },
                grid: { strokeDashArray: 4 },
                tooltip: { theme: 'dark', y: { formatter: (v) => `${v}%` } },
              }}
              series={[
                {
                  name: '打卡率',
                  data: attendanceRateTrend.map((d) => d.rate),
                },
              ]}
            />
          </Card>
        </Col>

        <Col xs={24} lg={12}>
          <Card title="预警类型" extra={<TimeRangeDropdown />} bordered={false}>
            <div className="metric-strip">
              <div className="metric-cell">
                <span className="metric-num">{alb?.total ?? 0}</span>
                <span className="metric-lbl">预警总数</span>
              </div>
              <div className="metric-cell">
                <span className="metric-num metric-warn">{alb?.invalid ?? 0}</span>
                <span className="metric-lbl">异常</span>
              </div>
              <div className="metric-cell">
                <span className="metric-num metric-bad">{alb?.missed ?? 0}</span>
                <span className="metric-lbl">缺勤</span>
              </div>
              <div className="metric-cell">
                <span className="metric-num metric-good">{alb?.read ?? 0}</span>
                <span className="metric-lbl">已读</span>
              </div>
              <div className="metric-cell">
                <span className="metric-num metric-bad">{alb?.unread ?? 0}</span>
                <span className="metric-lbl">未读</span>
              </div>
            </div>
            <Chart
              type="bar"
              height={200}
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
                colors: ['#fa8c16', '#cf1322'],
                xaxis: {
                  categories: alertTypeTrend.map((d) => d.date),
                  axisBorder: { show: false },
                },
                yaxis: { labels: { formatter: (v) => `${v}` } },
                grid: { strokeDashArray: 4 },
                legend: { position: 'top', horizontalAlign: 'right' },
                tooltip: { theme: 'dark', y: { formatter: (v) => `${v} 次` } },
              }}
              series={[
                {
                  name: '打卡异常',
                  data: alertTypeTrend.map((d) => d.invalid),
                },
                { name: '缺勤', data: alertTypeTrend.map((d) => d.missed) },
              ]}
            />
          </Card>
        </Col>
      </Row>

      {/* ⑥ 消息中心(精简版:三类计数 + 最近消息) */}
      <Row gutter={[16, 16]} style={{ marginTop: 16 }}>
        <Col span={24}>
          <Card
            title={
              <Space>
                <AlertOutlined />
                消息中心
              </Space>
            }
            extra={
              <Button
                type="primary"
                size="small"
                onClick={() => navigate('/system/message')}
              >
                查看全部
              </Button>
            }
            bordered={false}
          >
            <div className="msg-center-grid">
              <div
                className="msg-cat msg-cat-todo"
                onClick={() => navigate('/system/message')}
              >
                <div className="msg-cat-head">
                  <span className="msg-cat-name">待办消息</span>
                  <span className="msg-cat-count">{mc?.todo ?? 0}</span>
                </div>
                <div className="msg-cat-desc">审批结果、待处理事项通知</div>
              </div>
              <div
                className="msg-cat msg-cat-biz"
                onClick={() => navigate('/system/message')}
              >
                <div className="msg-cat-head">
                  <span className="msg-cat-name">业务通知</span>
                  <span className="msg-cat-count">{mc?.business ?? 0}</span>
                </div>
                <div className="msg-cat-desc">打卡提醒、到期提醒等</div>
              </div>
              <div
                className="msg-cat msg-cat-alert"
                onClick={() => navigate('/monitor/alert-list')}
              >
                <div className="msg-cat-head">
                  <span className="msg-cat-name">预警消息</span>
                  <span className="msg-cat-count">{mc?.alert ?? 0}</span>
                </div>
                <div className="msg-cat-desc">考勤异常、缺勤等预警</div>
              </div>
            </div>
          </Card>
        </Col>
      </Row>
    </div>
  );
});

export default Dashboard;
