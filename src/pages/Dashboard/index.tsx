import { useNavigate } from '@umijs/max';
import {
  IconAlertCircle,
  IconAlertTriangle,
  IconArrowDownRight,
  IconArrowUpRight,
  IconBuildingBank,
  IconCalendarEvent,
  IconChartBar,
  IconChecklist,
  IconChevronDown,
  IconCircleCheck,
  IconCircleX,
  IconClock,
  IconEye,
  IconEyeOff,
  IconFileText,
  IconHome,
  IconUserPlus,
  IconUsers,
  IconWallet,
} from '@tabler/icons-react';
import { observer } from 'mobx-react-lite';
import type React from 'react';
import { useEffect } from 'react';
import Chart from 'react-apexcharts';
import { alertStore, dashboardStore, userStore } from '@/stores';
import './tabler-cards.less';
import './index.less';

// =================== 配色板 — 完全对齐 Tabler 原型(tabler.css v1.4) ===================
// 取自 --tblr-* 真值:primary/azure/indigo/purple/green/teal/orange/red/gray。
const C = {
  primary: '#066fd1', // --tblr-primary / blue
  warning: '#f59f00', // --tblr-yellow(原型 warning)
  danger: '#d63939', // --tblr-red
  green: '#2fb344', // --tblr-green
  gray: '#9ca3af', // --tblr-gray-400(对比 series)
  text: '#1f2937', // --tblr-body-color
  sub: '#6b7280', // --tblr-gray-500
  grid: 'rgba(4, 32, 69, 0.1)', // --tblr-border-color-translucent
};
/** 折线多 series 色板 — 取 Tabler 主题色轮(blue/azure/indigo/purple/orange/teal) */
const SERIES_PALETTE = [
  '#066fd1', // 资质申请 — blue
  '#4299e1', // 实物配租 — azure
  '#4263eb', // 租赁补贴 — indigo
  '#d63939', // 资格终止 — red
  '#f76707', // 外出务工 — orange
  '#ae3ec9', // 信息变更 — purple
];

// =================== 时间窗下拉(纯样式,数据不切换,对齐原型 dropdown-toggle) ===================

const TimeRangeDropdown: React.FC = () => (
  <span className="time-range">
    近 7 天 <IconChevronDown size={12} />
  </span>
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

  // 我的待办 = 消息中心三类(待办 / 业务 / 预警)
  const mcTodo = dashboardStore.messageCounts;
  const todoItems = [
    { key: 'todo', label: '待办消息', desc: '审批结果、待处理事项通知', icon: <IconChecklist size={22} />, count: mcTodo?.todo ?? 0, path: '/system/message' },
    { key: 'biz', label: '业务通知', desc: '打卡提醒、到期提醒等', icon: <IconBuildingBank size={22} />, count: mcTodo?.business ?? 0, path: '/system/message' },
    { key: 'alert', label: '预警消息', desc: '考勤异常、缺勤等预警', icon: <IconAlertTriangle size={22} />, count: mcTodo?.alert ?? 0, path: '/monitor/alert-list' },
  ];
  const todoTotal = todoItems.reduce((s, it) => s + it.count, 0);

  // ① 快捷入口(统一主色,不用彩虹色)
  const quickEntries = [
    { key: 'add-resident', label: '新增居民', icon: <IconUserPlus size={24} />, path: '/residents' },
    { key: 'add-household', label: '新增家庭', icon: <IconUsers size={24} />, path: '/profile/households' },
    { key: 'checkin', label: '考勤打卡', icon: <IconCircleCheck size={24} />, path: '/monitor/attendance' },
    { key: 'leave', label: '请假审批', icon: <IconCalendarEvent size={24} />, path: '/monitor/leaves' },
    { key: 'application', label: '资质申请', icon: <IconFileText size={24} />, path: '/eligibility/applications' },
    { key: 'report', label: '报表中心', icon: <IconChartBar size={24} />, path: '/report/resident-snapshot' },
    { key: 'message', label: '消息中心', icon: <IconAlertTriangle size={24} />, path: '/system/message' },
    { key: 'config', label: '系统配置', icon: <IconBuildingBank size={24} />, path: '/system/config' },
  ];

  // ② 核心指标总览 — 去重后的全局 KPI(合并原 顶部KPI + ③指标)
  const rs = dashboardStore.reportSummaries;
  const rb = dashboardStore.residentBreakdown;
  const ab = dashboardStore.attendanceBreakdown;
  const alb = dashboardStore.alertBreakdown;
  const bizMonthly = dashboardStore.bizMonthlyTrend;
  const fundMonthly = dashboardStore.fundMonthlyTrend;
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

  // KPI 卡底部 sparkline 用的真实序列(来自 store 聚合)
  const sparkAlert =
    rs.alert?.sparkData?.length
      ? rs.alert.sparkData
      : alertTypeTrend.map((d) => d.invalid + d.missed);
  const sparkAllocation = bizMonthly.map((d) => d.allocation);
  const sparkSubsidy = fundMonthly.map((d) => d.subsidy);
  // 居民/打卡率/保障家庭 也补 sparkline,让核心指标 6 张卡形态统一
  const sparkAttendance = attendanceRateTrend.map((d) => d.rate);
  // 居民总数:业务办理里的资质申请按月累计(近似入库趋势)
  const sparkResidents = bizMonthly.reduce<number[]>((acc, d) => {
    acc.push((acc[acc.length - 1] ?? 0) + d.application);
    return acc;
  }, []);
  // 保障家庭:实物配租按月累计(近似在保户增长)
  const sparkHouseholds = bizMonthly.reduce<number[]>((acc, d) => {
    acc.push((acc[acc.length - 1] ?? 0) + d.allocation);
    return acc;
  }, []);

  /** 从序列估算涨跌%(首个非零 → 末位),数据不足返回 null */
  const pctDelta = (s: number[]): number | null => {
    if (!s || s.length < 2) return null;
    const first = s.find((v) => v > 0);
    const last = s[s.length - 1];
    if (!first) return null;
    return Math.round(((last - first) / first) * 100);
  };

  // KPI 卡:6 张统一形态 — 标签 + 大数字 + 涨跌 + 底部铺满 sparkline
  type Kpi = {
    key: string;
    label: string;
    value: number | string;
    foot: string;
    format?: 'currency';
    danger?: boolean;
    path: string;
    spark: number[];
    sparkType: 'area' | 'column';
    trend: number | null;
  };
  const coreKpis: Kpi[] = [
    {
      key: 'residents',
      label: '居民总数',
      value: residentTotal,
      foot: `已激活 ${activatedResidents} · 激活率 ${activationRate}%`,
      spark: sparkResidents,
      sparkType: 'area',
      trend: pctDelta(sparkResidents),
      path: '/residents',
    },
    {
      key: 'attendance',
      label: '今日打卡率',
      value: `${attendanceRateNum}%`,
      foot: `已打卡 ${ab?.checked ?? 0} / 应打卡 ${ab?.required ?? 0}`,
      spark: sparkAttendance,
      sparkType: 'area',
      trend: pctDelta(sparkAttendance),
      path: '/monitor/attendance',
    },
    {
      key: 'households',
      label: '保障家庭',
      value: liveStats?.activeHouseholds ?? sumVal('householdSnapshot'),
      foot: `未激活居民 ${inactiveResidents}`,
      spark: sparkHouseholds,
      sparkType: 'area',
      trend: pctDelta(sparkHouseholds),
      path: '/profile/households',
    },
    {
      key: 'alert',
      label: '待处置预警',
      value: alb?.missed ?? liveStats?.activeAlerts ?? 0,
      foot: `预警总数 ${alb?.total ?? 0} · 未读 ${alb?.unread ?? 0}`,
      danger: true,
      spark: sparkAlert,
      sparkType: 'column',
      trend: pctDelta(sparkAlert),
      path: '/monitor/alert-list',
    },
    {
      key: 'allocation',
      label: '实物配租',
      value: rs.housingAllocation?.value ?? 0,
      foot: rs.housingAllocation?.sub ?? '生效配租户',
      spark: sparkAllocation,
      sparkType: 'area',
      trend: pctDelta(sparkAllocation),
      path: '/eligibility/allocations',
    },
    {
      key: 'subsidy',
      label: '租赁补贴',
      value: rs.rentalSubsidy?.value ?? 0,
      foot: rs.rentalSubsidy?.sub ?? '生效补贴户',
      format: 'currency',
      spark: sparkSubsidy,
      sparkType: 'area',
      trend: pctDelta(sparkSubsidy),
      path: '/eligibility/subsidies',
    },
  ];

  // ④ 打卡分项磁贴(图标 + 数字)— 仅状态项用语义色,其余主色
  const attendanceMetrics = [
    { key: 'total', label: '打卡总数', value: ab?.total ?? 0, icon: <IconChecklist size={18} />, tone: 'tone-blue' },
    { key: 'employment', label: '工作打卡', value: ab?.employment ?? 0, icon: <IconBuildingBank size={18} />, tone: 'tone-blue' },
    { key: 'residence', label: '居住打卡', value: ab?.residence ?? 0, icon: <IconHome size={18} />, tone: 'tone-blue' },
    { key: 'checked', label: '已打卡', value: ab?.checked ?? 0, icon: <IconCircleCheck size={18} />, tone: 'tone-blue' },
    { key: 'pending', label: '预计打卡', value: ab?.pending ?? 0, icon: <IconClock size={18} />, tone: 'tone-warning' },
    { key: 'missed', label: '超时未打', value: ab?.missed ?? 0, icon: <IconCircleX size={18} />, tone: 'tone-red' },
  ];

  // ⑤ 预警分项磁贴(图标 + 数字)
  const alertMetrics = [
    { key: 'total', label: '预警总数', value: alb?.total ?? 0, icon: <IconAlertCircle size={18} />, tone: 'tone-blue' },
    { key: 'invalid', label: '异常', value: alb?.invalid ?? 0, icon: <IconAlertTriangle size={18} />, tone: 'tone-warning' },
    { key: 'missed', label: '缺勤', value: alb?.missed ?? 0, icon: <IconCircleX size={18} />, tone: 'tone-red' },
    { key: 'read', label: '已读', value: alb?.read ?? 0, icon: <IconEye size={18} />, tone: 'tone-blue' },
    { key: 'unread', label: '未读', value: alb?.unread ?? 0, icon: <IconEyeOff size={18} />, tone: 'tone-warning' },
  ];

  // ④ 业务报表合并图表(近 12 月,来自 store 真实聚合)
  // bizMonthly / fundMonthly 已在核心指标处声明
  const profileScale = dashboardStore.profileScale;

  return (
    <div className="dashboard-container">
      {/* ========== 区① 我的工作台 — 待办(大) + 快捷入口 ========== */}
      <div className="row row-deck g-3">
        <div className="col-sm-12 col-lg-6">
          <div className="card">
            <div className="card-body todo-card-body">
              <div className="todo-head">
                <div className="todo-head-left">
                  <span className="todo-title">我的待办</span>
                  <span className="todo-sub text-secondary">
                    {userName},您有待处理事项
                  </span>
                </div>
                <div className="todo-total">
                  <span className="todo-total-num">{todoTotal}</span>
                  <span className="todo-total-unit text-secondary">项待处理</span>
                </div>
              </div>
              {todoTotal === 0 ? (
                <div className="todo-empty">
                  <IconCircleCheck size={36} />
                  <span>暂无待办,一切已处理</span>
                </div>
              ) : (
                <div className="todo-list divide-y">
                  {todoItems.map((it) => (
                    <button
                      type="button"
                      key={it.key}
                      className={`todo-item${it.count > 0 ? ' has' : ''}`}
                      onClick={() => navigate(it.path)}
                    >
                      <span className="avatar avatar-square todo-item-icon">
                        {it.icon}
                      </span>
                      <div className="todo-item-main">
                        <span className="todo-item-label">{it.label}</span>
                        <span className="todo-item-desc text-secondary">
                          {it.desc}
                        </span>
                      </div>
                      <span className="todo-item-count">{it.count}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* 快捷入口 */}
        <div className="col-sm-12 col-lg-6">
          <div className="card">
            <div className="card-body">
              <h3 className="card-title quick-entry-title">快捷入口</h3>
              <div className="quick-entry-grid">
                {quickEntries.map((q) => (
                  <button
                    type="button"
                    key={q.key}
                    className="quick-entry-item"
                    onClick={() => navigate(q.path)}
                  >
                    <span className="avatar avatar-square quick-entry-icon">
                      {q.icon}
                    </span>
                    <span className="quick-entry-label">{q.label}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ========== 区② 核心指标总览 — Tabler stat 卡范式 ========== */}
      <SectionTitle title="核心指标" desc="全局保障与监测概览" />
      <div className="row row-deck g-3 kpi-row">
        {coreKpis.map((k) => {
          const display =
            k.format === 'currency'
              ? `¥${Number(k.value).toLocaleString()}`
              : k.value;
          const trendCls =
            k.trend == null
              ? ''
              : k.trend > 0
                ? k.danger
                  ? 'trend-down'
                  : 'trend-up'
                : k.trend < 0
                  ? k.danger
                    ? 'trend-up'
                    : 'trend-down'
                  : 'trend-flat';
          return (
            <div key={k.key} className="col-sm-6 col-lg-4 kpi-col">
              <button
                type="button"
                className={`card kpi-stat-card${k.danger ? ' is-danger' : ''}${k.spark ? ' has-spark' : ''}`}
                onClick={() => navigate(k.path)}
              >
                <div className="card-body">
                  <div className="d-flex align-items-center">
                    <div className="subheader">{k.label}</div>
                    {k.trend != null && (
                      <div className="ms-auto">
                        <span className={`trend ${trendCls}`}>
                          {Math.abs(k.trend)}%
                          {k.trend >= 0 ? (
                            <IconArrowUpRight size={16} />
                          ) : (
                            <IconArrowDownRight size={16} />
                          )}
                        </span>
                      </div>
                    )}
                  </div>
                  <div className="kpi-stat-value h1">{display}</div>
                  <div className="kpi-stat-foot text-secondary">{k.foot}</div>
                </div>
                {k.spark && (
                  <div className="kpi-stat-spark">
                    <Chart
                      type={k.sparkType === 'column' ? 'bar' : 'area'}
                      height={44}
                      options={{
                        chart: {
                          fontFamily: 'inherit',
                          sparkline: { enabled: true },
                          animations: { enabled: false },
                        },
                        stroke:
                          k.sparkType === 'column'
                            ? { width: 0 }
                            : { width: 2, lineCap: 'round', curve: 'smooth' },
                        plotOptions:
                          k.sparkType === 'column'
                            ? { bar: { columnWidth: '25%', borderRadius: 2 } }
                            : {},
                        fill:
                          k.sparkType === 'column'
                            ? { opacity: 1 }
                            : {
                                type: 'gradient',
                                gradient: {
                                  shadeIntensity: 1,
                                  opacityFrom: 0.4,
                                  opacityTo: 0.05,
                                  stops: [0, 100],
                                },
                              },
                        colors: [k.danger ? C.danger : C.primary],
                        tooltip: { enabled: false },
                      }}
                      series={[{ name: k.label, data: k.spark }]}
                    />
                  </div>
                )}
              </button>
            </div>
          );
        })}
      </div>

      {/* ========== 区③ 态势图表 — 打卡趋势 + 预警类型 ========== */}
      <SectionTitle title="监测态势" desc="近 7 天打卡与预警走势" />
      <div className="row row-deck g-3">
        <div className="col-sm-12 col-lg-6">
          <div className="card">
            <div className="card-header">
              <h3 className="card-title">打卡趋势</h3>
              <span className="ms-auto">
                <TimeRangeDropdown />
              </span>
            </div>
            <div className="card-body">
              <div className="metric-tiles">
                {attendanceMetrics.map((m) => (
                  <div key={m.key} className="metric-tile">
                    <span className={`avatar avatar-square metric-tile-icon ${m.tone}`}>
                      {m.icon}
                    </span>
                    <span className="metric-tile-num">{m.value}</span>
                    <span className="metric-tile-lbl text-secondary">
                      {m.label}
                    </span>
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
                    axisTicks: { show: false },
                    labels: { style: { colors: C.sub, fontSize: '12px' } },
                  },
                  yaxis: {
                    min: 0,
                    max: 100,
                    labels: {
                      formatter: (v) => `${v}%`,
                      style: { colors: C.sub, fontSize: '12px' },
                    },
                  },
                  grid: { strokeDashArray: 4, borderColor: C.grid },
                  tooltip: { theme: 'dark', y: { formatter: (v) => `${v}%` } },
                }}
                series={[
                  { name: '打卡率', data: attendanceRateTrend.map((d) => d.rate) },
                ]}
              />
            </div>
          </div>
        </div>

        <div className="col-sm-12 col-lg-6">
          <div className="card">
            <div className="card-header">
              <h3 className="card-title">预警类型</h3>
              <span className="ms-auto">
                <TimeRangeDropdown />
              </span>
            </div>
            <div className="card-body">
              <div className="metric-tiles">
                {alertMetrics.map((m) => (
                  <div key={m.key} className="metric-tile">
                    <span className={`avatar avatar-square metric-tile-icon ${m.tone}`}>
                      {m.icon}
                    </span>
                    <span className="metric-tile-num">{m.value}</span>
                    <span className="metric-tile-lbl text-secondary">
                      {m.label}
                    </span>
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
                  plotOptions: { bar: { columnWidth: '25%' } },
                  dataLabels: { enabled: false },
                  colors: [C.warning, C.danger],
                  xaxis: {
                    categories: alertTypeTrend.map((d) => d.date),
                    axisBorder: { show: false },
                    axisTicks: { show: false },
                    labels: { style: { colors: C.sub, fontSize: '12px' } },
                  },
                  yaxis: {
                    labels: {
                      formatter: (v) => `${v}`,
                      style: { colors: C.sub, fontSize: '12px' },
                    },
                  },
                  grid: { strokeDashArray: 4, borderColor: C.grid },
                  legend: { position: 'top', horizontalAlign: 'right' },
                  tooltip: { theme: 'dark', y: { formatter: (v) => `${v} 次` } },
                }}
                series={[
                  { name: '打卡异常', data: alertTypeTrend.map((d) => d.invalid) },
                  { name: '缺勤', data: alertTypeTrend.map((d) => d.missed) },
                ]}
              />
            </div>
          </div>
        </div>
      </div>

      {/* ========== 区④ 业务报表 — 合并图表(近 12 月) ========== */}
      <SectionTitle
        title="业务报表"
        desc="近 12 个月业务办理与规模分析"
        extra={
          <button
            type="button"
            className="link-btn"
            onClick={() => navigate('/report/resident-snapshot')}
          >
            报表
          </button>
        }
      />

      {/* 图1 — 业务办理趋势(多业务折线) */}
      <div className="card biz-chart-card">
        <div className="card-header">
          <h3 className="card-title">业务办理趋势</h3>
          <span className="ms-auto chart-axis-note text-secondary">
            单位:笔 · 近 12 个月
          </span>
        </div>
        <div className="card-body">
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
              stroke: { width: 2, lineCap: 'round', curve: 'smooth' },
              markers: { size: 0, hover: { size: 5 } },
              dataLabels: { enabled: false },
              colors: SERIES_PALETTE,
              xaxis: {
                categories: bizMonthly.map((d) => `${d.month}月`),
                axisBorder: { show: false },
                axisTicks: { show: false },
                tooltip: { enabled: false },
                labels: { style: { colors: C.sub, fontSize: '12px' } },
              },
              yaxis: {
                labels: {
                  formatter: (v) => `${Math.round(v)}`,
                  style: { colors: C.sub, fontSize: '12px' },
                },
              },
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
        </div>
      </div>

      <div className="row row-deck g-3">
        {/* 图2 — 档案规模对比(柱状) */}
        <div className="col-sm-12 col-lg-6">
          <div className="card biz-chart-card">
            <div className="card-header">
              <h3 className="card-title">档案规模对比</h3>
              <span className="ms-auto chart-axis-note text-secondary">
                单位:条
              </span>
            </div>
            <div className="card-body">
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
                      columnWidth: '25%',
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
                    labels: { style: { colors: C.sub, fontSize: '12px' } },
                  },
                  yaxis: {
                    labels: {
                      formatter: (v) => `${Math.round(v)}`,
                      style: { colors: C.sub, fontSize: '12px' },
                    },
                  },
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
            </div>
          </div>
        </div>

        {/* 图3 — 资金发放(分组柱状 ¥) */}
        <div className="col-sm-12 col-lg-6">
          <div className="card biz-chart-card">
            <div className="card-header">
              <h3 className="card-title">资金发放趋势</h3>
              <span className="ms-auto chart-axis-note text-secondary">
                单位:元 · 近 12 个月
              </span>
            </div>
            <div className="card-body">
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
                  plotOptions: { bar: { columnWidth: '25%' } },
                  dataLabels: { enabled: false },
                  colors: ['#066fd1', '#4299e1', '#4263eb'],
                  xaxis: {
                    categories: fundMonthly.map((d) => `${d.month}月`),
                    axisBorder: { show: false },
                    axisTicks: { show: false },
                    labels: { style: { colors: C.sub, fontSize: '12px' } },
                  },
                  yaxis: {
                    labels: {
                      formatter: (v) =>
                        v >= 10000
                          ? `${(v / 10000).toFixed(1)}万`
                          : `${Math.round(v)}`,
                      style: { colors: C.sub, fontSize: '12px' },
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
            </div>
          </div>
        </div>
      </div>
    </div>
  );
});

export default Dashboard;
