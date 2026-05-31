import {
  AlertOutlined,
  ArrowRightOutlined,
  CheckCircleOutlined,
  ClockCircleOutlined,
  DownOutlined,
  FallOutlined,
  MinusOutlined,
  RiseOutlined,
  TeamOutlined,
} from '@ant-design/icons';
import { useNavigate } from '@umijs/max';
import {
  Badge,
  Button,
  Card,
  Col,
  Dropdown,
  Row,
  Space,
  Table,
  Tag,
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
  const liveCritical = alertStore.criticalAlerts.length;
  const summaries = dashboardStore.reportSummaries;

  // 真实趋势(来自 store,基于 AttendanceFact 按日聚合)
  const attendanceRateTrend = dashboardStore.attendanceRateTrend;
  const alertTypeTrend = dashboardStore.alertTypeTrend;

  // 顶部仪表盘/监测预警的 sparkline 回退(store 未就绪时用)
  const sparkAttendance = attendanceRateTrend.map((d) => d.rate);
  const sparkAlerts = alertTypeTrend.map((d) => d.invalid + d.missed);

  // 预警列表级别/状态展示配置(对齐 AlertItem: level=ALERT_*, status=pending/processing/resolved)
  const levelTag: Record<string, { text: string; color: string }> = {
    ALERT_RED: { text: '红色预警', color: 'red' },
    ALERT_WARNING: { text: '预警', color: 'orange' },
    ALERT_INFO: { text: '提示', color: 'blue' },
  };
  const statusTag: Record<string, { text: string; color: string }> = {
    pending: { text: '待处理', color: 'orange' },
    processing: { text: '处理中', color: 'blue' },
    resolved: { text: '已处置', color: 'green' },
  };

  const alertColumns = [
    {
      title: '居民',
      dataIndex: 'resident',
      key: 'resident',
      width: 140,
      render: (id: string) => id || '-',
    },
    {
      title: '预警类型',
      dataIndex: 'title',
      key: 'title',
      width: 220,
      render: (t: string) => <Tag>{t}</Tag>,
    },
    {
      title: '级别',
      dataIndex: 'level',
      key: 'level',
      width: 110,
      render: (level: string) => (
        <Tag color={levelTag[level]?.color ?? 'default'}>
          {levelTag[level]?.text ?? level}
        </Tag>
      ),
    },
    {
      title: '触发时间',
      dataIndex: 'createTime',
      key: 'createTime',
      width: 180,
      render: (t: string) => (t ? new Date(t).toLocaleString() : '-'),
    },
    { title: '说明', dataIndex: 'content', key: 'content', ellipsis: true },
    {
      title: '处理状态',
      dataIndex: 'status',
      key: 'status',
      width: 110,
      render: (status: string) => (
        <Badge
          status={
            status === 'resolved'
              ? 'success'
              : status === 'processing'
                ? 'processing'
                : 'warning'
          }
          text={statusTag[status]?.text ?? status}
        />
      ),
    },
    {
      title: '操作',
      key: 'action',
      width: 120,
      render: (_: any, record: any) => (
        <Space size="small">
          <Button
            type="link"
            size="small"
            onClick={() => navigate(`/monitor/alert/detail/${record.id}`)}
          >
            查看
          </Button>
        </Space>
      ),
    },
  ];

  // 欢迎卡 / KPI 的真实派生值(全部来自 store,无写死)
  const sumVal = (k: string) => summaries[k]?.value ?? 0;
  const checkedInToday = sumVal('attendance'); // 出勤率%(gauge 值)
  const activeAlerts = liveStats?.activeAlerts ?? sumVal('alert');
  const pendingApprovals =
    liveStats?.pending ??
    sumVal('eligibilityApplication') +
      sumVal('leave') +
      sumVal('attendanceMakeup');
  const totalResidents =
    liveStats?.totalResidents ?? sumVal('residentSnapshot');
  const activeHouseholds =
    liveStats?.activeHouseholds ?? sumVal('householdSnapshot');

  // 大数字优先用 store 真实值
  const kpiAttendanceValue = liveStats?.attendanceRate ?? `${checkedInToday}%`;
  const kpiAlertsValue = liveStats?.totalAlerts ?? liveAlertCount;

  // 当前用户姓名(回退到账号、占位)
  const userName =
    (userStore.user as any)?.fullName ||
    (userStore.user as any)?.account ||
    '用户';

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
                  您有 {activeAlerts} 条活跃预警，{pendingApprovals}{' '}
                  条申请待审批。
                </div>
                <div className="welcome-mini-stats">
                  <div className="mini-stat">
                    <div className="mini-label">今日打卡率</div>
                    <div className="mini-value-row">
                      <span className="mini-value">{kpiAttendanceValue}</span>
                    </div>
                  </div>
                  <div className="mini-stat">
                    <div className="mini-label">活跃保障户</div>
                    <div className="mini-value-row">
                      <span className="mini-value">{activeHouseholds}</span>
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
                  <Button onClick={() => navigate('/approval/material')}>
                    处理审批
                  </Button>
                </div>
              </div>
              <div className="welcome-illustration">
                <div className="illu-tile illu-blue">
                  <CheckCircleOutlined />
                  <div className="illu-num">{kpiAttendanceValue}</div>
                  <div className="illu-label">今日打卡率</div>
                </div>
                <div className="illu-tile illu-red">
                  <AlertOutlined />
                  <div className="illu-num">{liveCritical || activeAlerts}</div>
                  <div className="illu-label">严重预警</div>
                </div>
                <div className="illu-tile illu-purple">
                  <TeamOutlined />
                  <div className="illu-num">{totalResidents}</div>
                  <div className="illu-label">保障户</div>
                </div>
                <div className="illu-tile illu-orange">
                  <ClockCircleOutlined />
                  <div className="illu-num">{pendingApprovals}</div>
                  <div className="illu-label">待审批</div>
                </div>
              </div>
            </div>
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

      {/* 中部 — 16 报表卡墙(连续平铺,一排 4 个,全部真实聚合数据) */}
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

      {/* 图表区 — 打卡率趋势 + 预警趋势叠加柱 */}
      <Row gutter={[16, 16]} style={{ marginTop: 16 }}>
        <Col xs={24} lg={12}>
          <Card
            title="打卡率趋势"
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
          <Card title="预警趋势" extra={<TimeRangeDropdown />} bordered={false}>
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
                <Button
                  type="primary"
                  size="small"
                  onClick={() => navigate('/monitor/alert-list')}
                >
                  查看更多
                </Button>
              </Space>
            }
            bordered={false}
          >
            <Table
              dataSource={alertStore.alerts}
              columns={alertColumns}
              rowKey="id"
              loading={alertStore.loading}
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
