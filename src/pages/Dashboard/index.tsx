import {
  AlertOutlined,
  BankOutlined,
  BarChartOutlined,
  CalendarOutlined,
  CheckCircleOutlined,
  ClockCircleOutlined,
  CloseCircleOutlined,
  DownOutlined,
  EyeInvisibleOutlined,
  EyeOutlined,
  HomeOutlined,
  ReloadOutlined,
  RocketOutlined,
  ScheduleOutlined,
  SolutionOutlined,
  StopOutlined,
  TeamOutlined,
  UserAddOutlined,
  WalletOutlined,
  WarningOutlined,
} from '@ant-design/icons';
import { useNavigate } from '@umijs/max';
import {
  Button,
  Card,
  Col,
  Dropdown,
  Row,
} from 'antd';
import { observer } from 'mobx-react-lite';
import React, { useEffect } from 'react';
import Chart from 'react-apexcharts';
import { alertStore, dashboardStore, userStore } from '@/stores';
import './index.less';

// =================== 统一配色板(政务深蓝 + 语义色) ===================
// 规则:主色蓝做骨架;橙=警告,红=危险;不使用绿色与其它装饰色。
const C = {
  primary: '#1d4ed8',
  warning: '#d46b08',
  danger: '#cf1322',
  text: '#1f1f1f',
  sub: '#8c8c8c',
  grid: '#eef1f5',
};
/** 折线多 series 用蓝阶为主的协调色板(无绿:4 档蓝 + 橙 + 红) */
const SERIES_PALETTE = [
  '#1d4ed8', // 资质申请 — 主蓝
  '#3b82f6', // 实物配租 — 中蓝
  '#60a5fa', // 租赁补贴 — 浅蓝
  '#cf1322', // 资格终止 — 红(负向)
  '#d46b08', // 外出务工 — 橙
  '#1e3a5f', // 信息变更 — 深蓝
];

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

// =================== 分区标题 ===================

const SectionTitle: React.FC<{
  title: string;
  desc?: string;
  extra?: React.ReactNode;
}> = ({ title, desc, extra }) => (
  <div className="section-title">
    <div className="section-title-left">
      <span className="section-title-bar" />
      <span className="section-title-text">{title}</span>
      {desc && <span className="section-title-desc">{desc}</span>}
    </div>
    {extra && <div className="section-title-extra">{extra}</div>}
  </div>
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
  const summaries = dashboardStore.reportSummaries;

  // 真实趋势(来自 store,基于 AttendanceFact 按日聚合)
  const attendanceRateTrend = dashboardStore.attendanceRateTrend;
  const alertTypeTrend = dashboardStore.alertTypeTrend;

  const sumVal = (k: string) => summaries[k]?.value ?? 0;

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

  // ② 快捷入口(统一主色,不用彩虹色)
  const quickEntries = [
    { key: 'add-resident', label: '新增居民', icon: <UserAddOutlined />, path: '/residents' },
    { key: 'add-household', label: '新增家庭', icon: <TeamOutlined />, path: '/profile/households' },
    { key: 'checkin', label: '考勤打卡', icon: <CheckCircleOutlined />, path: '/monitor/attendance' },
    { key: 'leave', label: '请假审批', icon: <CalendarOutlined />, path: '/monitor/leaves' },
    { key: 'application', label: '资质申请', icon: <SolutionOutlined />, path: '/eligibility/applications' },
    { key: 'report', label: '报表中心', icon: <BarChartOutlined />, path: '/report/resident-snapshot' },
    { key: 'message', label: '消息中心', icon: <AlertOutlined />, path: '/system/message' },
    { key: 'config', label: '系统配置', icon: <BankOutlined />, path: '/system/config' },
  ];

  // ② 核心指标总览 — 去重后的全局 KPI(合并原 顶部KPI + ③指标)
  const rs = dashboardStore.reportSummaries;
  const rb = dashboardStore.residentBreakdown;
  const ab = dashboardStore.attendanceBreakdown;
  const alb = dashboardStore.alertBreakdown;
  const mc = dashboardStore.messageCounts;
  const activatedResidents = rb?.activated ?? 0;
  const inactiveResidents = rb?.inactive ?? 0;
  const residentTotal =
    liveStats?.totalResidents ?? activatedResidents + inactiveResidents;
  const activationRate =
    residentTotal > 0
      ? Math.round((activatedResidents / residentTotal) * 100)
      : 0;
  const attendanceRateNum = liveStats?.attendanceRate
    ? parseInt(String(liveStats.attendanceRate), 10)
    : ab && ab.required > 0
      ? Math.round((ab.checked / ab.required) * 100)
      : 0;

  const coreKpis = [
    {
      key: 'residents',
      label: '居民总数',
      value: residentTotal,
      icon: <TeamOutlined />,
      tone: 'tone-blue',
      foot: `已激活 ${activatedResidents} · 激活率 ${activationRate}%`,
      gauge: activationRate,
      path: '/residents',
    },
    {
      key: 'households',
      label: '保障家庭',
      value: liveStats?.activeHouseholds ?? sumVal('householdSnapshot'),
      icon: <HomeOutlined />,
      tone: 'tone-blue',
      foot: '在保家庭户数',
      path: '/profile/households',
    },
    {
      key: 'attendance',
      label: '今日打卡率',
      value: `${attendanceRateNum}%`,
      icon: <ScheduleOutlined />,
      tone: 'tone-blue',
      foot: `已打卡 ${ab?.checked ?? 0} / 应打卡 ${ab?.required ?? 0}`,
      gauge: attendanceRateNum,
      path: '/monitor/attendance',
    },
    {
      key: 'alert',
      label: '待处置预警',
      value: alb?.missed ?? liveStats?.activeAlerts ?? 0,
      icon: <AlertOutlined />,
      tone: 'tone-red',
      foot: `预警总数 ${alb?.total ?? 0} · 未读 ${alb?.unread ?? 0}`,
      danger: true,
      path: '/monitor/alert-list',
    },
    {
      key: 'allocation',
      label: '实物配租',
      value: rs.housingAllocation?.value ?? 0,
      icon: <BankOutlined />,
      tone: 'tone-blue',
      foot: rs.housingAllocation?.sub ?? '生效配租户',
      path: '/eligibility/allocations',
    },
    {
      key: 'subsidy',
      label: '租赁补贴',
      value: rs.rentalSubsidy?.value ?? 0,
      icon: <WalletOutlined />,
      tone: 'tone-blue',
      foot: rs.rentalSubsidy?.sub ?? '生效补贴户',
      format: 'currency' as const,
      path: '/eligibility/subsidies',
    },
  ];

  // ④ 打卡分项磁贴(图标 + 数字)— 仅状态项用语义色,其余主色
  const attendanceMetrics = [
    { key: 'total', label: '打卡总数', value: ab?.total ?? 0, icon: <ScheduleOutlined />, tone: 'tone-blue' },
    { key: 'employment', label: '工作打卡', value: ab?.employment ?? 0, icon: <BankOutlined />, tone: 'tone-blue' },
    { key: 'residence', label: '居住打卡', value: ab?.residence ?? 0, icon: <HomeOutlined />, tone: 'tone-blue' },
    { key: 'checked', label: '已打卡', value: ab?.checked ?? 0, icon: <CheckCircleOutlined />, tone: 'tone-blue' },
    { key: 'pending', label: '预计打卡', value: ab?.pending ?? 0, icon: <ClockCircleOutlined />, tone: 'tone-warning' },
    { key: 'missed', label: '超时未打', value: ab?.missed ?? 0, icon: <CloseCircleOutlined />, tone: 'tone-red' },
  ];

  // ⑤ 预警分项磁贴(图标 + 数字)
  const alertMetrics = [
    { key: 'total', label: '预警总数', value: alb?.total ?? 0, icon: <WarningOutlined />, tone: 'tone-blue' },
    { key: 'invalid', label: '异常', value: alb?.invalid ?? 0, icon: <AlertOutlined />, tone: 'tone-warning' },
    { key: 'missed', label: '缺勤', value: alb?.missed ?? 0, icon: <CloseCircleOutlined />, tone: 'tone-red' },
    { key: 'read', label: '已读', value: alb?.read ?? 0, icon: <EyeOutlined />, tone: 'tone-blue' },
    { key: 'unread', label: '未读', value: alb?.unread ?? 0, icon: <EyeInvisibleOutlined />, tone: 'tone-warning' },
  ];

  // ④ 业务报表合并图表(近 12 月,来自 store 真实聚合)
  const bizMonthly = dashboardStore.bizMonthlyTrend;
  const profileScale = dashboardStore.profileScale;
  const fundMonthly = dashboardStore.fundMonthlyTrend;

  return (
    <div className="dashboard-container">
      {/* ========== 区① 我的工作台 — 待办(大) + 快捷入口 ========== */}
      <Row gutter={[16, 16]}>
        <Col xs={24} lg={15}>
          <Card className="todo-card" bordered={false}>
            <div className="todo-head">
              <div className="todo-head-left">
                <span className="todo-title">我的待办</span>
                <span className="todo-sub">{userName}，您有待处理事项</span>
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

        {/* 快捷入口 */}
        <Col xs={24} lg={9}>
          <Card className="quick-entry-card" bordered={false}>
            <div className="quick-entry-title">快捷入口</div>
            <div className="quick-entry-grid">
              {quickEntries.map((q) => (
                <div
                  key={q.key}
                  className="quick-entry-item"
                  onClick={() => navigate(q.path)}
                >
                  <span className="quick-entry-icon">{q.icon}</span>
                  <span className="quick-entry-label">{q.label}</span>
                </div>
              ))}
            </div>
          </Card>
        </Col>
      </Row>

      {/* ========== 区② 核心指标总览 — 去重后的全局 KPI 一排 ========== */}
      <SectionTitle title="核心指标" desc="全局保障与监测概览" />
      <Row gutter={[16, 16]} className="core-kpi-row">
        {coreKpis.map((k) => {
          const display =
            k.format === 'currency'
              ? `¥${Number(k.value).toLocaleString()}`
              : k.value;
          return (
            <Col key={k.key} xs={12} sm={8} lg={4}>
              <Card
                className={`core-kpi-card${k.danger ? ' is-danger' : ''}`}
                bordered={false}
                onClick={() => navigate(k.path)}
              >
                <div className="core-kpi-top">
                  <span className={`core-kpi-icon ${k.tone}`}>{k.icon}</span>
                  {k.gauge !== undefined && (
                    <span className="core-kpi-ring">
                      <Chart
                        type="radialBar"
                        height={56}
                        width={56}
                        options={{
                          chart: {
                            sparkline: { enabled: true },
                            animations: { enabled: false },
                          },
                          plotOptions: {
                            radialBar: {
                              hollow: { size: '52%' },
                              track: { background: C.grid },
                              dataLabels: {
                                name: { show: false },
                                value: {
                                  offsetY: 4,
                                  fontSize: '11px',
                                  fontWeight: 700,
                                  color: C.text,
                                  formatter: (v) => `${v}%`,
                                },
                              },
                            },
                          },
                          colors: [k.danger ? C.danger : C.primary],
                          stroke: { lineCap: 'round' },
                        }}
                        series={[k.gauge]}
                      />
                    </span>
                  )}
                </div>
                <div className="core-kpi-value">{display}</div>
                <div className="core-kpi-label">{k.label}</div>
                <div className="core-kpi-foot">{k.foot}</div>
              </Card>
            </Col>
          );
        })}
      </Row>

      {/* ========== 区③ 态势图表 — 打卡趋势 + 预警类型 ========== */}
      <SectionTitle title="监测态势" desc="近 7 天打卡与预警走势" />
      <Row gutter={[16, 16]}>
        <Col xs={24} lg={12}>
          <Card title="打卡趋势" extra={<TimeRangeDropdown />} bordered={false}>
            <div className="metric-tiles">
              {attendanceMetrics.map((m) => (
                <div key={m.key} className="metric-tile">
                  <span className={`metric-tile-icon ${m.tone}`}>{m.icon}</span>
                  <span className="metric-tile-num">{m.value}</span>
                  <span className="metric-tile-lbl">{m.label}</span>
                </div>
              ))}
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
                colors: [C.primary],
                xaxis: {
                  categories: attendanceRateTrend.map((d) => d.date),
                  axisBorder: { show: false },
                },
                yaxis: {
                  min: 0,
                  max: 100,
                  labels: { formatter: (v) => `${v}%` },
                },
                grid: { strokeDashArray: 4, borderColor: C.grid },
                tooltip: { theme: 'dark', y: { formatter: (v) => `${v}%` } },
              }}
              series={[
                { name: '打卡率', data: attendanceRateTrend.map((d) => d.rate) },
              ]}
            />
          </Card>
        </Col>

        <Col xs={24} lg={12}>
          <Card title="预警类型" extra={<TimeRangeDropdown />} bordered={false}>
            <div className="metric-tiles">
              {alertMetrics.map((m) => (
                <div key={m.key} className="metric-tile">
                  <span className={`metric-tile-icon ${m.tone}`}>{m.icon}</span>
                  <span className="metric-tile-num">{m.value}</span>
                  <span className="metric-tile-lbl">{m.label}</span>
                </div>
              ))}
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
                colors: [C.warning, C.danger],
                xaxis: {
                  categories: alertTypeTrend.map((d) => d.date),
                  axisBorder: { show: false },
                },
                yaxis: { labels: { formatter: (v) => `${v}` } },
                grid: { strokeDashArray: 4, borderColor: C.grid },
                legend: { position: 'top', horizontalAlign: 'right' },
                tooltip: { theme: 'dark', y: { formatter: (v) => `${v} 次` } },
              }}
              series={[
                { name: '打卡异常', data: alertTypeTrend.map((d) => d.invalid) },
                { name: '缺勤', data: alertTypeTrend.map((d) => d.missed) },
              ]}
            />
          </Card>
        </Col>
      </Row>

      {/* ========== 消息中心(精简三类计数) ========== */}
      <SectionTitle
        title="消息中心"
        desc="待办 / 业务 / 预警"
        extra={
          <Button
            type="link"
            size="small"
            onClick={() => navigate('/system/message')}
          >
            查看全部
          </Button>
        }
      />
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

      {/* ========== 区④ 业务报表 — 合并图表(近 12 月) ========== */}
      <SectionTitle
        title="业务报表"
        desc="近 12 个月业务办理与规模分析"
        extra={
          <Button
            type="link"
            size="small"
            onClick={() => navigate('/report/resident-snapshot')}
          >
            报表中心
          </Button>
        }
      />

      {/* 图1 — 业务办理趋势(多业务折线) */}
      <Card
        className="biz-chart-card"
        title="业务办理趋势"
        extra={<span className="chart-axis-note">单位:笔 · 近 12 个月</span>}
        bordered={false}
        style={{ marginBottom: 16 }}
      >
        <Chart
          type="line"
          height={320}
          options={{
            chart: {
              fontFamily: 'inherit',
              toolbar: { show: false },
              animations: { enabled: false },
              parentHeightOffset: 0,
              zoom: { enabled: false },
            },
            stroke: { width: 2.5, lineCap: 'round', curve: 'smooth' },
            markers: { size: 0, hover: { size: 5 } },
            dataLabels: { enabled: false },
            colors: SERIES_PALETTE,
            xaxis: {
              categories: bizMonthly.map((d) => `${d.month}月`),
              axisBorder: { show: false },
              axisTicks: { show: false },
              tooltip: { enabled: false },
            },
            yaxis: { labels: { formatter: (v) => `${Math.round(v)}` } },
            grid: { strokeDashArray: 4, borderColor: C.grid },
            legend: {
              position: 'top',
              horizontalAlign: 'right',
              markers: { size: 6 },
              itemMargin: { horizontal: 10 },
            },
            tooltip: { theme: 'dark', shared: true, intersect: false },
          }}
          series={[
            { name: '资质申请', data: bizMonthly.map((d) => d.application) },
            { name: '实物配租', data: bizMonthly.map((d) => d.allocation) },
            { name: '租赁补贴', data: bizMonthly.map((d) => d.subsidy) },
            { name: '资格终止', data: bizMonthly.map((d) => d.termination) },
            { name: '外出务工', data: bizMonthly.map((d) => d.migrantWork) },
            { name: '信息变更', data: bizMonthly.map((d) => d.change) },
          ]}
        />
      </Card>

      <Row gutter={[16, 16]}>
        {/* 图2 — 档案规模对比(柱状) */}
        <Col xs={24} lg={12}>
          <Card
            className="biz-chart-card"
            title="档案规模对比"
            extra={<span className="chart-axis-note">单位:条</span>}
            bordered={false}
          >
            <Chart
              type="bar"
              height={300}
              options={{
                chart: {
                  fontFamily: 'inherit',
                  toolbar: { show: false },
                  animations: { enabled: false },
                  parentHeightOffset: 0,
                },
                plotOptions: {
                  bar: {
                    columnWidth: '46%',
                    borderRadius: 6,
                    dataLabels: { position: 'top' },
                  },
                },
                dataLabels: {
                  enabled: true,
                  offsetY: -18,
                  style: { fontSize: '12px', colors: [C.sub] },
                  formatter: (v) => `${v}`,
                },
                colors: [C.primary],
                xaxis: {
                  categories: profileScale.map((d) => d.label),
                  axisBorder: { show: false },
                  axisTicks: { show: false },
                },
                yaxis: { labels: { formatter: (v) => `${Math.round(v)}` } },
                grid: { strokeDashArray: 4, borderColor: C.grid },
                legend: { show: false },
                tooltip: {
                  theme: 'dark',
                  y: { formatter: (v) => `${v} 条` },
                },
              }}
              series={[
                { name: '档案数', data: profileScale.map((d) => d.value) },
              ]}
            />
          </Card>
        </Col>

        {/* 图3 — 资金发放(分组柱状 ¥) */}
        <Col xs={24} lg={12}>
          <Card
            className="biz-chart-card"
            title="资金发放趋势"
            extra={<span className="chart-axis-note">单位:元 · 近 12 个月</span>}
            bordered={false}
          >
            <Chart
              type="bar"
              height={300}
              options={{
                chart: {
                  fontFamily: 'inherit',
                  toolbar: { show: false },
                  animations: { enabled: false },
                  parentHeightOffset: 0,
                  stacked: true,
                },
                plotOptions: { bar: { columnWidth: '55%', borderRadius: 4 } },
                dataLabels: { enabled: false },
                colors: ['#1d4ed8', '#60a5fa', '#a5c4fb'],
                xaxis: {
                  categories: fundMonthly.map((d) => `${d.month}月`),
                  axisBorder: { show: false },
                  axisTicks: { show: false },
                },
                yaxis: {
                  labels: {
                    formatter: (v) =>
                      v >= 10000
                        ? `${(v / 10000).toFixed(1)}万`
                        : `${Math.round(v)}`,
                  },
                },
                grid: { strokeDashArray: 4, borderColor: C.grid },
                legend: {
                  position: 'top',
                  horizontalAlign: 'right',
                  markers: { size: 6 },
                  itemMargin: { horizontal: 10 },
                },
                tooltip: {
                  theme: 'dark',
                  y: { formatter: (v) => `¥${Number(v).toLocaleString()}` },
                },
              }}
              series={[
                { name: '个人收入', data: fundMonthly.map((d) => d.income) },
                { name: '租赁补贴', data: fundMonthly.map((d) => d.subsidy) },
                { name: '配租租金', data: fundMonthly.map((d) => d.rent) },
              ]}
            />
          </Card>
        </Col>
      </Row>
    </div>
  );
});

export default Dashboard;
