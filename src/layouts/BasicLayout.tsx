import {
  ApartmentOutlined,
  BarChartOutlined,
  BellOutlined,
  BgColorsOutlined,
  CalendarOutlined,
  CheckCircleOutlined,
  CloseOutlined,
  ControlOutlined,
  DashboardOutlined,
  DotChartOutlined,
  DownloadOutlined,
  EnvironmentOutlined,
  FileImageOutlined,
  FileSearchOutlined,
  FileTextOutlined,
  FilterOutlined,
  FundOutlined,
  HomeOutlined,
  LineChartOutlined,
  LogoutOutlined,
  MenuOutlined,
  MonitorOutlined,
  PartitionOutlined,
  PayCircleOutlined,
  PieChartOutlined,
  ReloadOutlined,
  RocketOutlined,
  SafetyOutlined,
  ScheduleOutlined,
  SettingOutlined,
  ShopOutlined,
  StopOutlined,
  SwapOutlined,
  TagOutlined,
  TeamOutlined,
  UsergroupAddOutlined,
  UserOutlined,
  WarningOutlined,
} from '@ant-design/icons';
import type { MenuProps } from 'antd';
import {
  Avatar,
  theme as antdTheme,
  Badge,
  Button,
  ConfigProvider,
  Drawer,
  Dropdown,
  Layout,
  List,
  Menu,
  Popover,
  Space,
  Tabs,
  Tooltip,
} from 'antd';
import { observer } from 'mobx-react-lite';
import React, { useEffect, useMemo, useState } from 'react';
import { Link, Outlet, useLocation, useNavigate } from 'react-router-dom';
import ThemeSettings from '@/components/ThemeSettings';
import ApprovalPanel from '../components/ApprovalPanel';
import LifecyclePanel from '../components/LifecyclePanel';
import {
  approvalPanelStore,
  appStore,
  lifecyclePanelStore,
  userStore,
} from '../stores';

const { Header, Sider, Content } = Layout;

// 页签类型定义
interface TabItem {
  key: string;
  label: string;
  path: string;
  closable: boolean;
}

// 图标映射
const iconMap: Record<string, React.ReactNode> = {
  dashboard: <DashboardOutlined />,
  monitor: <MonitorOutlined />,
  'check-circle': <CheckCircleOutlined />,
  warning: <WarningOutlined />,
  'file-text': <FileTextOutlined />,
  'file-image': <FileImageOutlined />,
  calendar: <CalendarOutlined />,
  environment: <EnvironmentOutlined />,
  apartment: <ApartmentOutlined />,
  'bar-chart': <BarChartOutlined />,
  'line-chart': <LineChartOutlined />,
  download: <DownloadOutlined />,
  setting: <SettingOutlined />,
  bell: <BellOutlined />,
  team: <TeamOutlined />,
  user: <UserOutlined />,
  menu: <MenuOutlined />,
  control: <ControlOutlined />,
  'file-search': <FileSearchOutlined />,
  filter: <FilterOutlined />,
  home: <HomeOutlined />,
  safety: <SafetyOutlined />,
  'pay-circle': <PayCircleOutlined />,
  shop: <ShopOutlined />,
  stop: <StopOutlined />,
  reload: <ReloadOutlined />,
  rocket: <RocketOutlined />,
  'usergroup-add': <UsergroupAddOutlined />,
  schedule: <ScheduleOutlined />,
  partition: <PartitionOutlined />,
  tag: <TagOutlined />,
  'pie-chart': <PieChartOutlined />,
  fund: <FundOutlined />,
  swap: <SwapOutlined />,
  'dot-chart': <DotChartOutlined />,
};

// 路由标题映射(用于 Tab 标题)
const routeTitleMap: Record<string, string> = {
  '/dashboard': '工作台',
  '/profile/residents': '保障居民',
  '/profile/households': '保障家庭',
  '/eligibility/applications': '资质申请',
  '/eligibility/allocations': '实物配租',
  '/eligibility/subsidies': '租赁补贴',
  '/eligibility/terminations': '资格终止',
  '/monitor/attendance': '考勤打卡',
  '/monitor/leaves': '请假申请',
  '/monitor/makeups': '补卡申请',
  '/monitor/migrant-works': '外出务工',
  '/monitor/residence-changes': '居住地址变更',
  '/monitor/employment-changes': '工作地址变更',
  '/monitor/member-changes': '家庭成员变更',
  '/monitor/alert': '预警处置',
  '/monitor/alert-list': '预警列表',
  '/attendance-config/solutions': '考勤方案',
  '/attendance-config/rules': '考勤规则',
  '/attendance-config/leave-types': '请假类型',
  '/attendance-config/calendars': '资源日历',
  '/attendance-config/workflow': '审批流程',
  '/report/attendance-alert': '监测预警事实表',
  '/report/resident-snapshot': '居民快照',
  '/report/household-snapshot': '家庭快照',
  '/report/household-member-snapshot': '家庭成员快照',
  '/report/residence-snapshot': '居住信息快照',
  '/report/employment-snapshot': '工作信息快照',
  '/report/personal-income': '个人收入',
  '/report/attendance': '考勤打卡',
  '/report/leave': '请假',
  '/report/attendance-makeup': '补卡申请',
  '/report/eligibility-application': '资质申请',
  '/report/housing-allocation': '实物配租',
  '/report/rental-subsidy': '租赁补贴',
  '/report/eligibility-termination': '资格终止',
  '/report/migrant-work': '外出务工',
  '/report/household-member-change': '家庭成员变更',
  '/report/residence-change': '居住地址变更',
  '/report/employment-change': '工作地址变更',
  '/system/message': '消息中心',
  '/system/personnel': '人员管理',
  '/system/role': '角色管理',
  '/system/menu': '菜单配置',
  '/system/config': '系统配置',
  '/system/log': '日志审计',
  '/system/filter': '筛选器管理',
  '/system/fence': '电子围栏',
  '/profile': '个人中心',
  '/settings': '账户设置',
};

/** 动态路径生成 Tab 标题:支持居民/家庭/各类申请单详情 */
function dynamicTabTitle(pathname: string): string | null {
  const matchResident = pathname.match(
    /^\/profile\/residents\/detail\/([^/]+)$/,
  );
  if (matchResident) {
    const id = matchResident[1];
    return `居民 ${id.length > 8 ? id.slice(-6) : id}`;
  }
  const matchHousehold = pathname.match(
    /^\/profile\/households\/detail\/([^/]+)$/,
  );
  if (matchHousehold) {
    const id = matchHousehold[1];
    return `家庭 ${id.length > 8 ? id.slice(-6) : id}`;
  }
  const matchEligibility = pathname.match(
    /^\/eligibility\/[^/]+\/detail\/([^/]+)$/,
  );
  if (matchEligibility) {
    const id = matchEligibility[1];
    return `单据 ${id.length > 8 ? id.slice(-6) : id}`;
  }
  const matchMonitor = pathname.match(/^\/monitor\/[^/]+\/detail\/([^/]+)$/);
  if (matchMonitor) {
    const id = matchMonitor[1];
    return `单据 ${id.length > 8 ? id.slice(-6) : id}`;
  }
  return null;
}

// 本地存储键名
const TABS_STORAGE_KEY = 'app_tabs';
const LEFT_RAIL_KEY = 'layout_left_rail_expanded';
/** 右侧 rail 的「审批」特殊菜单 key */
const APPROVAL_MENU_KEY = '__approval__';
/** 右侧 rail 的「流程」特殊菜单 key(状态机生命周期) */
const LIFECYCLE_MENU_KEY = '__lifecycle__';

const BasicLayout: React.FC<{ children?: React.ReactNode }> = observer(
  ({ children }) => {
    const location = useLocation();
    const navigate = useNavigate();
    const [notificationOpen, setNotificationOpen] = useState(false);
    const [themeDrawerOpen, setThemeDrawerOpen] = useState(false);
    const [activeQuickMenu, setActiveQuickMenu] = useState<string | null>(null);

    // 审批面板自动展开:进入含待审批数据的详情页时,默认打开右侧审批面板
    const apActive = approvalPanelStore.active;
    const apPending = approvalPanelStore.pending;
    const apBizRef = approvalPanelStore.bizRef;
    useEffect(() => {
      if (apActive && apPending) {
        setActiveQuickMenu(APPROVAL_MENU_KEY);
      } else if (!apActive) {
        // 离开详情页时,如果当前开着审批面板则收起
        setActiveQuickMenu((cur) => (cur === APPROVAL_MENU_KEY ? null : cur));
      }
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [apActive, apPending, apBizRef]);

    // 状态流程面板自动展开:进入状态机详情页(补贴/配租)默认打开右侧流程面板
    const lcActive = lifecyclePanelStore.active;
    const lcStatus = lifecyclePanelStore.currentStatus;
    useEffect(() => {
      if (lcActive) {
        setActiveQuickMenu(LIFECYCLE_MENU_KEY);
      } else {
        setActiveQuickMenu((cur) => (cur === LIFECYCLE_MENU_KEY ? null : cur));
      }
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [lcActive, lcStatus]);

    // 左侧主菜单 rail 展开/收起 — 收起时 56px 只显图标(rail 模式)
    const [leftExpanded, setLeftExpanded] = useState<boolean>(() => {
      const v = localStorage.getItem(LEFT_RAIL_KEY);
      return v === null ? true : v === 'true';
    });
    useEffect(() => {
      localStorage.setItem(LEFT_RAIL_KEY, String(leftExpanded));
    }, [leftExpanded]);

    const collapsed = !leftExpanded;

    // 页签状态管理
    const [tabs, setTabs] = useState<TabItem[]>(() => {
      // 从本地存储恢复页签
      const savedTabs = localStorage.getItem(TABS_STORAGE_KEY);
      if (savedTabs) {
        try {
          return JSON.parse(savedTabs);
        } catch (e) {
          console.error('Failed to parse saved tabs:', e);
        }
      }
      // 默认打开工作台
      return [
        {
          key: '/dashboard',
          label: '工作台',
          path: '/dashboard',
          closable: false,
        },
      ];
    });

    // 保存页签到本地存储
    useEffect(() => {
      localStorage.setItem(TABS_STORAGE_KEY, JSON.stringify(tabs));
    }, [tabs]);

    // 监听路由变化,自动添加页签
    useEffect(() => {
      const currentPath = location.pathname;
      const title = routeTitleMap[currentPath] ?? dynamicTabTitle(currentPath);

      if (title && !tabs.find((tab) => tab.path === currentPath)) {
        const newTab: TabItem = {
          key: currentPath,
          label: title,
          path: currentPath,
          closable: currentPath !== '/dashboard', // 工作台不可关闭
        };
        setTabs((prev) => [...prev, newTab]);
      }
    }, [location.pathname, tabs]);

    // 切换页签
    const handleTabChange = (key: string) => {
      navigate(key);
    };

    // 关闭页签
    const handleTabRemove = (targetKey: string) => {
      const targetIndex = tabs.findIndex((tab) => tab.key === targetKey);
      const newTabs = tabs.filter((tab) => tab.key !== targetKey);

      // 如果关闭的是当前页签,需要跳转到相邻页签
      if (location.pathname === targetKey) {
        let nextTab: TabItem | undefined;
        if (targetIndex > 0) {
          nextTab = newTabs[targetIndex - 1];
        } else if (newTabs.length > 0) {
          nextTab = newTabs[0];
        }

        if (nextTab) {
          navigate(nextTab.path);
        }
      }

      setTabs(newTabs);
    };

    // Ctrl/Cmd + W 关闭当前 Tab(工作台不可关闭)
    useEffect(() => {
      const onKey = (e: KeyboardEvent) => {
        if ((e.ctrlKey || e.metaKey) && (e.key === 'w' || e.key === 'W')) {
          const current = tabs.find((t) => t.path === location.pathname);
          if (current && current.closable) {
            e.preventDefault();
            handleTabRemove(current.key);
          }
        }
      };
      window.addEventListener('keydown', onKey);
      return () => window.removeEventListener('keydown', onKey);
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [tabs, location.pathname]);

    // 关闭其他页签
    const handleCloseOthers = () => {
      const currentTab = tabs.find((tab) => tab.path === location.pathname);
      const dashboardTab = tabs.find((tab) => tab.path === '/dashboard');

      const newTabs: TabItem[] = [];
      if (dashboardTab) newTabs.push(dashboardTab);
      if (currentTab && currentTab.path !== '/dashboard')
        newTabs.push(currentTab);

      setTabs(newTabs);
    };

    // 关闭所有页签
    const handleCloseAll = () => {
      const dashboardTab = tabs.find((tab) => tab.path === '/dashboard');
      setTabs(dashboardTab ? [dashboardTab] : []);
      navigate('/dashboard');
    };

    // 各菜单项要求的用户类型(userType)。空数组 = 所有登录用户可见。
    // ADMIN 始终拥有全部权限,在过滤时单独放行。
    const ROLE = {
      APPROVER: 'APPROVER',
      STAFF: 'STAFF',
      RESIDENT: 'RESIDENT',
    } as const;

    // 当前用户角色(由 userStore 从 user.userType 派生)
    const currentRole = userStore.role;
    const isAdmin = currentRole === 'ADMIN';

    // 给每个菜单标记可见角色;ADMIN 默认看全部。
    const menuAcl: Record<string, string[]> = {
      '/dashboard': [],
      // 居民档案
      '/profile': [ROLE.APPROVER, ROLE.STAFF],
      '/profile/residents': [ROLE.APPROVER, ROLE.STAFF],
      '/profile/households': [ROLE.APPROVER, ROLE.STAFF],
      // 保障业务
      '/eligibility': [ROLE.APPROVER, ROLE.STAFF],
      '/eligibility/applications': [ROLE.APPROVER, ROLE.STAFF],
      '/eligibility/allocations': [ROLE.APPROVER, ROLE.STAFF],
      '/eligibility/subsidies': [ROLE.APPROVER, ROLE.STAFF],
      '/eligibility/terminations': [ROLE.APPROVER, ROLE.STAFF],
      // 监测与处置
      '/monitor': [ROLE.APPROVER, ROLE.STAFF],
      '/monitor/attendance': [ROLE.APPROVER, ROLE.STAFF],
      '/monitor/leaves': [ROLE.APPROVER, ROLE.STAFF],
      '/monitor/makeups': [ROLE.APPROVER, ROLE.STAFF],
      '/monitor/migrant-works': [ROLE.APPROVER, ROLE.STAFF],
      '/monitor/residence-changes': [ROLE.APPROVER, ROLE.STAFF],
      '/monitor/employment-changes': [ROLE.APPROVER, ROLE.STAFF],
      '/monitor/member-changes': [ROLE.APPROVER, ROLE.STAFF],
      '/monitor/alert': [ROLE.APPROVER, ROLE.STAFF],
      '/monitor/alert-list': [ROLE.APPROVER, ROLE.STAFF],
      // 考勤配置
      '/attendance-config': [ROLE.APPROVER],
      '/attendance-config/solutions': [ROLE.APPROVER],
      '/attendance-config/rules': [ROLE.APPROVER],
      '/attendance-config/leave-types': [ROLE.APPROVER],
      '/attendance-config/calendars': [ROLE.APPROVER],
      '/attendance-config/workflow': [ROLE.APPROVER],
      // 报表
      '/report': [ROLE.APPROVER],
      '/report/attendance-alert': [ROLE.APPROVER],
      '/report/resident-snapshot': [ROLE.APPROVER],
      '/report/household-snapshot': [ROLE.APPROVER],
      '/report/household-member-snapshot': [ROLE.APPROVER],
      '/report/residence-snapshot': [ROLE.APPROVER],
      '/report/employment-snapshot': [ROLE.APPROVER],
      '/report/personal-income': [ROLE.APPROVER],
      '/report/attendance': [ROLE.APPROVER],
      '/report/leave': [ROLE.APPROVER],
      '/report/attendance-makeup': [ROLE.APPROVER],
      '/report/eligibility-application': [ROLE.APPROVER],
      '/report/housing-allocation': [ROLE.APPROVER],
      '/report/rental-subsidy': [ROLE.APPROVER],
      '/report/eligibility-termination': [ROLE.APPROVER],
      '/report/migrant-work': [ROLE.APPROVER],
      '/report/household-member-change': [ROLE.APPROVER],
      '/report/residence-change': [ROLE.APPROVER],
      '/report/employment-change': [ROLE.APPROVER],
      // 系统
      '/system': [],
      '/system/message': [ROLE.APPROVER, ROLE.STAFF, ROLE.RESIDENT],
      '/system/personnel': [],
      '/system/role': [],
      '/system/menu': [],
      '/system/config': [],
      '/system/log': [],
      '/system/filter': [],
      '/system/fence': [],
    };

    function canSee(path: string): boolean {
      if (isAdmin) return true;
      const allow = menuAcl[path];
      if (!allow) return true; // 未声明的默认放行
      if (allow.length === 0)
        return path === '/dashboard' || path === '/system/message';
      return allow.includes(currentRole);
    }

    // 构建菜单数据(按角色过滤)
    const menuItems: MenuProps['items'] = useMemo(() => {
      const all = [
        {
          key: '/dashboard',
          icon: iconMap['dashboard'],
          label: <Link to="/dashboard">工作台</Link>,
        },
        {
          key: '/profile',
          icon: iconMap['team'],
          label: '居民档案',
          children: [
            {
              key: '/profile/residents',
              icon: iconMap['user'],
              label: <Link to="/profile/residents">保障居民</Link>,
            },
            {
              key: '/profile/households',
              icon: iconMap['home'],
              label: <Link to="/profile/households">保障家庭</Link>,
            },
          ],
        },
        {
          key: '/applications',
          icon: iconMap['file-text'],
          label: '申请管理',
          children: [
            {
              key: '/eligibility/applications',
              icon: iconMap['safety'],
              label: <Link to="/eligibility/applications">资质申请</Link>,
            },
            {
              key: '/eligibility/allocations',
              icon: iconMap['home'],
              label: <Link to="/eligibility/allocations">实物配租</Link>,
            },
            {
              key: '/eligibility/subsidies',
              icon: iconMap['pay-circle'],
              label: <Link to="/eligibility/subsidies">租赁补贴</Link>,
            },
            {
              key: '/eligibility/terminations',
              icon: iconMap['stop'],
              label: <Link to="/eligibility/terminations">资格终止</Link>,
            },
            {
              key: '/monitor/leaves',
              icon: iconMap['calendar'],
              label: <Link to="/monitor/leaves">请假申请</Link>,
            },
            {
              key: '/monitor/makeups',
              icon: iconMap['reload'],
              label: <Link to="/monitor/makeups">补卡申请</Link>,
            },
            {
              key: '/monitor/migrant-works',
              icon: iconMap['rocket'],
              label: <Link to="/monitor/migrant-works">外出务工</Link>,
            },
            {
              key: '/monitor/residence-changes',
              icon: iconMap['environment'],
              label: <Link to="/monitor/residence-changes">居住地址变更</Link>,
            },
            {
              key: '/monitor/employment-changes',
              icon: iconMap['shop'],
              label: <Link to="/monitor/employment-changes">工作地址变更</Link>,
            },
            {
              key: '/monitor/member-changes',
              icon: iconMap['usergroup-add'],
              label: <Link to="/monitor/member-changes">家庭成员变更</Link>,
            },
          ],
        },
        {
          key: '/monitor',
          icon: iconMap['monitor'],
          label: '监测与处置',
          children: [
            {
              key: '/monitor/attendance',
              icon: iconMap['check-circle'],
              label: <Link to="/monitor/attendance">考勤打卡</Link>,
            },
          ],
        },
        {
          key: '/attendance-config',
          icon: iconMap['schedule'],
          label: '考勤配置',
          children: [
            {
              key: '/attendance-config/solutions',
              icon: iconMap['apartment'],
              label: <Link to="/attendance-config/solutions">考勤方案</Link>,
            },
            {
              key: '/attendance-config/rules',
              icon: iconMap['control'],
              label: <Link to="/attendance-config/rules">考勤规则</Link>,
            },
            {
              key: '/attendance-config/leave-types',
              icon: iconMap['tag'],
              label: <Link to="/attendance-config/leave-types">请假类型</Link>,
            },
            {
              key: '/attendance-config/calendars',
              icon: iconMap['calendar'],
              label: <Link to="/attendance-config/calendars">资源日历</Link>,
            },
            {
              key: '/attendance-config/workflow',
              icon: iconMap['partition'],
              label: <Link to="/attendance-config/workflow">审批流程</Link>,
            },
          ],
        },
        {
          key: '/report',
          icon: iconMap['bar-chart'],
          label: '分析与报表',
          children: [
            {
              key: 'report-group-alert',
              label: '监测预警',
              type: 'group' as const,
              children: [
                {
                  key: '/report/attendance-alert',
                  icon: iconMap['warning'],
                  label: (
                    <Link to="/report/attendance-alert">监测预警事实表</Link>
                  ),
                },
              ],
            },
            {
              key: 'report-group-snapshot',
              label: '档案快照',
              type: 'group' as const,
              children: [
                {
                  key: '/report/resident-snapshot',
                  icon: iconMap['pie-chart'],
                  label: <Link to="/report/resident-snapshot">居民快照</Link>,
                },
                {
                  key: '/report/household-snapshot',
                  icon: iconMap['pie-chart'],
                  label: <Link to="/report/household-snapshot">家庭快照</Link>,
                },
                {
                  key: '/report/household-member-snapshot',
                  icon: iconMap['pie-chart'],
                  label: (
                    <Link to="/report/household-member-snapshot">
                      家庭成员快照
                    </Link>
                  ),
                },
                {
                  key: '/report/residence-snapshot',
                  icon: iconMap['pie-chart'],
                  label: (
                    <Link to="/report/residence-snapshot">居住信息快照</Link>
                  ),
                },
                {
                  key: '/report/employment-snapshot',
                  icon: iconMap['pie-chart'],
                  label: (
                    <Link to="/report/employment-snapshot">工作信息快照</Link>
                  ),
                },
              ],
            },
            {
              key: 'report-group-income',
              label: '收入与考勤',
              type: 'group' as const,
              children: [
                {
                  key: '/report/personal-income',
                  icon: iconMap['line-chart'],
                  label: <Link to="/report/personal-income">个人收入</Link>,
                },
                {
                  key: '/report/attendance',
                  icon: iconMap['line-chart'],
                  label: <Link to="/report/attendance">考勤打卡</Link>,
                },
                {
                  key: '/report/leave',
                  icon: iconMap['line-chart'],
                  label: <Link to="/report/leave">请假</Link>,
                },
                {
                  key: '/report/attendance-makeup',
                  icon: iconMap['line-chart'],
                  label: <Link to="/report/attendance-makeup">补卡申请</Link>,
                },
              ],
            },
            {
              key: 'report-group-business',
              label: '业务与变更',
              type: 'group' as const,
              children: [
                {
                  key: '/report/eligibility-application',
                  icon: iconMap['fund'],
                  label: (
                    <Link to="/report/eligibility-application">资质申请</Link>
                  ),
                },
                {
                  key: '/report/housing-allocation',
                  icon: iconMap['fund'],
                  label: <Link to="/report/housing-allocation">实物配租</Link>,
                },
                {
                  key: '/report/rental-subsidy',
                  icon: iconMap['fund'],
                  label: <Link to="/report/rental-subsidy">租赁补贴</Link>,
                },
                {
                  key: '/report/eligibility-termination',
                  icon: iconMap['fund'],
                  label: (
                    <Link to="/report/eligibility-termination">资格终止</Link>
                  ),
                },
                {
                  key: '/report/migrant-work',
                  icon: iconMap['swap'],
                  label: <Link to="/report/migrant-work">外出务工</Link>,
                },
                {
                  key: '/report/household-member-change',
                  icon: iconMap['swap'],
                  label: (
                    <Link to="/report/household-member-change">
                      家庭成员变更
                    </Link>
                  ),
                },
                {
                  key: '/report/residence-change',
                  icon: iconMap['swap'],
                  label: (
                    <Link to="/report/residence-change">居住地址变更</Link>
                  ),
                },
                {
                  key: '/report/employment-change',
                  icon: iconMap['swap'],
                  label: (
                    <Link to="/report/employment-change">工作地址变更</Link>
                  ),
                },
              ],
            },
          ],
        },
        {
          key: '/system',
          icon: iconMap['setting'],
          label: '系统与运维',
          children: [
            {
              key: '/system/message',
              icon: iconMap['bell'],
              label: <Link to="/system/message">消息中心</Link>,
            },
            {
              key: '/system/personnel',
              icon: iconMap['team'],
              label: <Link to="/system/personnel">人员管理</Link>,
            },
            {
              key: '/system/role',
              icon: iconMap['user'],
              label: <Link to="/system/role">角色管理</Link>,
            },
            {
              key: '/system/menu',
              icon: iconMap['menu'],
              label: <Link to="/system/menu">菜单配置</Link>,
            },
            {
              key: '/system/config',
              icon: iconMap['control'],
              label: <Link to="/system/config">系统配置</Link>,
            },
            {
              key: '/system/log',
              icon: iconMap['file-search'],
              label: <Link to="/system/log">日志审计</Link>,
            },
            {
              key: '/system/filter',
              icon: iconMap['filter'],
              label: <Link to="/system/filter">筛选器管理</Link>,
            },
            {
              key: '/system/fence',
              icon: iconMap['environment'],
              label: <Link to="/system/fence">电子围栏</Link>,
            },
          ],
        },
      ];

      // 递归过滤:子项空了就移除父组
      const filterMenu = (nodes: any[]): any[] =>
        nodes
          .map((node) => {
            if (!canSee(node.key)) return null;
            if (node.children) {
              const kids = filterMenu(node.children);
              if (kids.length === 0) return null;
              return { ...node, children: kids };
            }
            return node;
          })
          .filter(Boolean);

      return filterMenu(all);
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [currentRole, isAdmin]);

    // 快捷菜单分组数据(rail 上的弹出小面板)
    const allQuickMenuGroups = [
      {
        key: 'profile',
        icon: <TeamOutlined />,
        label: '档案',
        color: '#13c2c2',
        lightColor: '#e6fffb',
        hoverColor: '#b5f5ec',
        children: [
          {
            label: '保障居民',
            path: '/profile/residents',
            icon: <UserOutlined />,
          },
          {
            label: '保障家庭',
            path: '/profile/households',
            icon: <HomeOutlined />,
          },
        ],
      },
      {
        key: 'eligibility',
        icon: <SafetyOutlined />,
        label: '业务',
        color: '#066fd1',
        lightColor: '#e6f7ff',
        hoverColor: '#bae7ff',
        children: [
          {
            label: '资质申请',
            path: '/eligibility/applications',
            icon: <FileTextOutlined />,
          },
          {
            label: '实物配租',
            path: '/eligibility/allocations',
            icon: <HomeOutlined />,
          },
          {
            label: '租赁补贴',
            path: '/eligibility/subsidies',
            icon: <PayCircleOutlined />,
          },
          {
            label: '资格终止',
            path: '/eligibility/terminations',
            icon: <StopOutlined />,
          },
        ],
      },
      {
        key: 'monitor',
        icon: <MonitorOutlined />,
        label: '监测',
        color: '#52c41a',
        lightColor: '#f6ffed',
        hoverColor: '#d9f7be',
        children: [
          {
            label: '考勤打卡',
            path: '/monitor/attendance',
            icon: <CheckCircleOutlined />,
          },
          {
            label: '请假申请',
            path: '/monitor/leaves',
            icon: <CalendarOutlined />,
          },
          {
            label: '补卡申请',
            path: '/monitor/makeups',
            icon: <ReloadOutlined />,
          },
          {
            label: '外出务工',
            path: '/monitor/migrant-works',
            icon: <RocketOutlined />,
          },
        ],
      },
      {
        key: 'report',
        icon: <BarChartOutlined />,
        label: '报表',
        color: '#faad14',
        lightColor: '#fffbe6',
        hoverColor: '#fff1b8',
        children: [
          {
            label: '居民/家庭画像',
            path: '/report/snapshots',
            icon: <PieChartOutlined />,
          },
          {
            label: '考勤分析',
            path: '/report/attendance',
            icon: <LineChartOutlined />,
          },
          {
            label: '业务流转',
            path: '/report/eligibility',
            icon: <FundOutlined />,
          },
          {
            label: '变更分析',
            path: '/report/changes',
            icon: <SwapOutlined />,
          },
        ],
      },
      {
        key: 'system',
        icon: <SettingOutlined />,
        label: '系统',
        color: '#722ed1',
        lightColor: '#f9f0ff',
        hoverColor: '#efdbff',
        children: [
          {
            label: '人员管理',
            path: '/system/personnel',
            icon: <TeamOutlined />,
          },
          { label: '角色管理', path: '/system/role', icon: <UserOutlined /> },
          {
            label: '系统配置',
            path: '/system/config',
            icon: <ControlOutlined />,
          },
        ],
      },
    ];

    const quickMenuGroups = allQuickMenuGroups
      .map((g) => ({
        ...g,
        children: g.children.filter((c) => canSee(c.path)),
      }))
      .filter((g) => g.children.length > 0);

    const handleQuickMenuToggle = (key: string) => {
      setActiveQuickMenu(activeQuickMenu === key ? null : key);
    };

    const handleQuickMenuItemClick = (path: string) => {
      navigate(path);
      setActiveQuickMenu(null);
    };

    // 模拟通知消息数据
    const notifications = [
      {
        id: '1',
        title: '待审批提醒',
        content: '您有3条材料审批待处理',
        time: '5分钟前',
        type: 'info',
      },
      {
        id: '2',
        title: '预警通知',
        content: '张三连续3天未打卡',
        time: '1小时前',
        type: 'warning',
      },
      {
        id: '3',
        title: '系统消息',
        content: '系统将于今晚22:00进行维护',
        time: '3小时前',
        type: 'info',
      },
    ];

    const unreadCount = notifications.length;

    // 通知列表内容
    const notificationContent = (
      <div style={{ width: 320 }}>
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            padding: '12px 16px',
            borderBottom: '1px solid var(--ant-color-border-secondary)',
          }}
        >
          <span style={{ fontWeight: 600 }}>通知消息</span>
          <Button
            type="link"
            size="small"
            onClick={() => navigate('/system/message')}
          >
            查看全部
          </Button>
        </div>
        <List
          dataSource={notifications}
          renderItem={(item) => (
            <List.Item
              style={{ padding: '12px 16px', cursor: 'pointer' }}
              onClick={() => {
                setNotificationOpen(false);
                navigate('/system/message');
              }}
            >
              <List.Item.Meta
                title={
                  <Space>
                    <Badge
                      status={
                        item.type === 'warning' ? 'warning' : 'processing'
                      }
                    />
                    <span style={{ fontSize: 14 }}>{item.title}</span>
                  </Space>
                }
                description={
                  <div>
                    <div
                      style={{
                        fontSize: 13,
                        color: 'var(--ant-color-text-secondary)',
                      }}
                    >
                      {item.content}
                    </div>
                    <div
                      style={{
                        fontSize: 12,
                        color: 'var(--ant-color-text-tertiary)',
                        marginTop: 4,
                      }}
                    >
                      {item.time}
                    </div>
                  </div>
                }
              />
            </List.Item>
          )}
        />
      </div>
    );

    // 用户下拉菜单
    const userMenuItems = [
      {
        key: 'profile',
        icon: <UserOutlined />,
        label: '个人中心',
        onClick: () => navigate('/profile'),
      },
      {
        key: 'settings',
        icon: <SettingOutlined />,
        label: '账户设置',
        onClick: () => navigate('/settings'),
      },
      {
        type: 'divider' as const,
      },
      {
        key: 'logout',
        icon: <LogoutOutlined />,
        label: '退出登录',
        onClick: () => {
          userStore.logout();
          navigate('/login');
        },
      },
    ];

    return (
      <ConfigProvider
        theme={{
          token: { colorPrimary: appStore.primaryColor },
          algorithm: appStore.isDark
            ? antdTheme.darkAlgorithm
            : antdTheme.defaultAlgorithm,
        }}
      >
        <Layout
          style={{
            height: '100vh',
            overflow: 'hidden',
            background: 'var(--ant-color-bg-layout)',
          }}
        >
          <Layout style={{ flex: 1, minHeight: 0 }}>
            <Header
              style={{
                height: 26,
                padding: '0 12px',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                background:
                  'color-mix(in srgb, var(--ant-color-bg-container) 72%, transparent)',
                backdropFilter: 'blur(22px) saturate(180%)',
                WebkitBackdropFilter: 'blur(22px) saturate(180%)',
                boxShadow: '0 1px 0 var(--ant-color-border-secondary)',
                fontSize: 12,
                lineHeight: 1,
                userSelect: 'none',
                flexShrink: 0,
                position: 'relative',
                zIndex: 20,
              }}
            >
              <Tooltip
                placement="bottomRight"
                title={leftExpanded ? '收起菜单' : '展开菜单'}
                mouseEnterDelay={0.4}
              >
                <div
                  className="layout-brand"
                  onClick={() => setLeftExpanded((v) => !v)}
                  style={{
                    height: 26,
                    display: 'flex',
                    alignItems: 'center',
                    gap: 6,
                    paddingRight: 10,
                    fontSize: 13,
                    fontWeight: 700,
                    color: appStore.primaryColor,
                    cursor: 'pointer',
                    userSelect: 'none',
                    transition: 'opacity .15s ease',
                  }}
                >
                  <DashboardOutlined style={{ fontSize: 16 }} />
                  {collapsed ? '公租房' : '公租房监测系统'}
                </div>
              </Tooltip>
              <Space size={14}>
                {/* 通知消息 */}
                <Popover
                  content={notificationContent}
                  trigger="click"
                  open={notificationOpen}
                  onOpenChange={setNotificationOpen}
                  placement="bottomRight"
                >
                  <Badge count={unreadCount} size="small" offset={[-3, 3]}>
                    <BellOutlined
                      style={{
                        fontSize: 14,
                        cursor: 'pointer',
                        color: 'var(--ant-color-text-secondary)',
                      }}
                    />
                  </Badge>
                </Popover>

                {/* 主题设置 */}
                <Tooltip title="主题设置" mouseEnterDelay={0.3}>
                  <span
                    style={{
                      cursor: 'pointer',
                      display: 'inline-flex',
                      alignItems: 'center',
                    }}
                    onClick={() => setThemeDrawerOpen(true)}
                  >
                    <BgColorsOutlined
                      style={{
                        fontSize: 14,
                        color: 'var(--ant-color-text-secondary)',
                      }}
                    />
                  </span>
                </Tooltip>

                {/* 用户头像 */}
                <Dropdown
                  menu={{ items: userMenuItems }}
                  placement="bottomRight"
                >
                  <Space size={6} style={{ cursor: 'pointer' }}>
                    <Avatar size={20} icon={<UserOutlined />}>
                      {(userStore.user as any)?.fullName?.[0] ||
                        (userStore.user as any)?.account?.[0] ||
                        'U'}
                    </Avatar>
                    <span
                      style={{
                        fontSize: 12,
                        color: 'var(--ant-color-text-secondary)',
                      }}
                    >
                      {(userStore.user as any)?.fullName ||
                        (userStore.user as any)?.account ||
                        '用户'}
                    </span>
                  </Space>
                </Dropdown>
              </Space>
            </Header>

            {/* 页签栏 — 横跨整个内容宽度,贴在 Header 下方(参考原型 tab-bar) */}
            <div
              className="app-layout-tabbar"
              style={{
                height: 36,
                background: 'var(--ant-color-bg-elevated)',
                padding: '0 8px',
                flexShrink: 0,
                display: 'flex',
                alignItems: 'flex-end',
              }}
            >
              <Tabs
                className="app-layout-tabs"
                type="editable-card"
                activeKey={location.pathname}
                onChange={handleTabChange}
                onEdit={(targetKey, action) => {
                  if (action === 'remove') {
                    handleTabRemove(targetKey as string);
                  }
                }}
                hideAdd
                items={tabs.map((tab) => ({
                  key: tab.key,
                  label: tab.label,
                  closable: tab.closable,
                }))}
                tabBarExtraContent={{
                  right: (
                    <Dropdown
                      menu={{
                        items: [
                          {
                            key: 'closeOthers',
                            label: '关闭其他',
                            onClick: handleCloseOthers,
                          },
                          {
                            key: 'closeAll',
                            label: '关闭所有',
                            onClick: handleCloseAll,
                          },
                        ],
                      }}
                      trigger={['click']}
                    >
                      <Button
                        type="text"
                        size="small"
                        style={{ marginRight: 8 }}
                      >
                        操作
                      </Button>
                    </Dropdown>
                  ),
                }}
                style={{
                  margin: 0,
                  flex: 1,
                }}
              />
            </div>

            <Layout
              style={{
                flex: 1,
                minHeight: 0,
                position: 'relative',
                padding: '10px 0px 10px 0px',
                background: 'var(--ant-color-bg-layout)',
              }}
            >
              <Sider
                collapsed={collapsed}
                collapsedWidth={44}
                width={220}
                theme={appStore.isDark ? 'dark' : 'light'}
                trigger={null}
                style={{
                  overflow: 'auto',
                  transition: 'width .2s cubic-bezier(.2,.8,.2,1)',
                  borderRadius: 12,
                }}
              >
                <Menu
                  mode="inline"
                  selectedKeys={[location.pathname]}
                  defaultOpenKeys={[
                    location.pathname.startsWith('/profile') ? '/profile' : '',
                    location.pathname.startsWith('/eligibility') ||
                    location.pathname.startsWith('/monitor/leaves') ||
                    location.pathname.startsWith('/monitor/makeups') ||
                    location.pathname.startsWith('/monitor/migrant-works') ||
                    location.pathname.startsWith(
                      '/monitor/residence-changes',
                    ) ||
                    location.pathname.startsWith(
                      '/monitor/employment-changes',
                    ) ||
                    location.pathname.startsWith('/monitor/member-changes')
                      ? '/applications'
                      : '',
                    location.pathname.startsWith('/monitor/attendance') ||
                    location.pathname.startsWith('/monitor/alert')
                      ? '/monitor'
                      : '',
                    location.pathname.startsWith('/attendance-config')
                      ? '/attendance-config'
                      : '',
                    location.pathname.startsWith('/report') ? '/report' : '',
                    location.pathname.startsWith('/system') ? '/system' : '',
                  ].filter(Boolean)}
                  items={menuItems}
                />
              </Sider>

              <Layout
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  flex: 1,
                  minHeight: 0,
                  background: 'transparent',
                  padding: '0 10px',
                }}
              >
                <Content
                  style={{
                    background: 'var(--ant-color-bg-layout)',
                    overflow: 'auto',
                    flex: 1,
                  }}
                >
                  {children || <Outlet />}
                </Content>
              </Layout>

              {/* 右侧快捷菜单子面板 — 点击 rail 图标弹出(首页不显示) */}
              {location.pathname !== '/dashboard' && activeQuickMenu && (
                <Sider
                  width={
                    activeQuickMenu === APPROVAL_MENU_KEY ||
                    activeQuickMenu === LIFECYCLE_MENU_KEY
                      ? 360
                      : 280
                  }
                  theme={appStore.isDark ? 'dark' : 'light'}
                  style={{
                    background: 'var(--ant-color-bg-container)',
                    borderLeft: '1px solid var(--ant-color-border-secondary)',
                    borderRadius: 12,
                    overflow: 'hidden',
                  }}
                >
                  {/* 面板头部 — 紧凑纯白 */}
                  <div
                    style={{
                      padding: '12px 16px',
                      borderBottom:
                        '1px solid var(--ant-color-border-secondary)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      background: 'var(--ant-color-bg-container)',
                      height: 48,
                      flexShrink: 0,
                    }}
                  >
                    <span
                      style={{
                        fontSize: 14,
                        fontWeight: 600,
                        color: 'var(--ant-color-text)',
                      }}
                    >
                      {activeQuickMenu === APPROVAL_MENU_KEY
                        ? '审批'
                        : activeQuickMenu === LIFECYCLE_MENU_KEY
                          ? lifecyclePanelStore.title ?? '状态流程'
                          : quickMenuGroups.find((g) => g.key === activeQuickMenu)
                              ?.label}
                    </span>
                    <div
                      onClick={() => setActiveQuickMenu(null)}
                      style={{
                        width: 28,
                        height: 28,
                        display: 'grid',
                        placeItems: 'center',
                        borderRadius: '50%',
                        cursor: 'pointer',
                        color: 'var(--ant-color-text-tertiary)',
                        transition: 'background .15s ease, color .15s ease',
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.color = 'var(--ant-color-text)';
                        e.currentTarget.style.background =
                          'var(--ant-color-fill-tertiary)';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.color =
                          'var(--ant-color-text-tertiary)';
                        e.currentTarget.style.background = 'transparent';
                      }}
                    >
                      <CloseOutlined style={{ fontSize: 14 }} />
                    </div>
                  </div>

                  {/* 菜单列表 — 紧凑 */}
                  <div
                    style={{
                      height: 'calc(100vh - 26px - 36px - 48px)',
                      overflowY: 'auto',
                      padding:
                        activeQuickMenu === APPROVAL_MENU_KEY ||
                        activeQuickMenu === LIFECYCLE_MENU_KEY
                          ? 0
                          : '8px 8px',
                    }}
                  >
                    {activeQuickMenu === APPROVAL_MENU_KEY &&
                    approvalPanelStore.active ? (
                      <ApprovalPanel
                        key={`${approvalPanelStore.bizRef}-${approvalPanelStore.version}`}
                        objectType={approvalPanelStore.objectType as string}
                        bizRef={approvalPanelStore.bizRef as string}
                        status={approvalPanelStore.status}
                        onApproved={() => approvalPanelStore.onApproved?.()}
                      />
                    ) : activeQuickMenu === LIFECYCLE_MENU_KEY &&
                      lifecyclePanelStore.active ? (
                      <LifecyclePanel
                        key={`lc-${lifecyclePanelStore.version}`}
                      />
                    ) : (
                      quickMenuGroups
                        .find((g) => g.key === activeQuickMenu)
                        ?.children.map((item) => {
                          const isActive = location.pathname === item.path;
                          const groupColor =
                            quickMenuGroups.find(
                              (g) => g.key === activeQuickMenu,
                            )?.color || appStore.primaryColor;

                          return (
                            <div
                              key={item.path}
                              style={{
                                margin: '2px 0',
                                padding: '10px 12px',
                                paddingLeft: isActive ? 9 : 12,
                                cursor: 'pointer',
                                display: 'flex',
                                alignItems: 'center',
                                gap: 10,
                                transition:
                                  'background .15s ease, color .15s ease',
                                background: isActive
                                  ? `${groupColor}14`
                                  : 'transparent',
                                borderRadius: 6,
                                borderLeft: isActive
                                  ? `3px solid ${groupColor}`
                                  : '3px solid transparent',
                              }}
                              onClick={() =>
                                handleQuickMenuItemClick(item.path)
                              }
                              onMouseEnter={(e) => {
                                if (!isActive) {
                                  e.currentTarget.style.background =
                                    'var(--ant-color-fill-tertiary)';
                                }
                              }}
                              onMouseLeave={(e) => {
                                if (!isActive) {
                                  e.currentTarget.style.background =
                                    'transparent';
                                }
                              }}
                            >
                              <span
                                style={{
                                  fontSize: 16,
                                  color: isActive
                                    ? groupColor
                                    : 'var(--ant-color-text-tertiary)',
                                  lineHeight: 1,
                                  display: 'flex',
                                  alignItems: 'center',
                                }}
                              >
                                {item.icon}
                              </span>
                              <span
                                style={{
                                  fontSize: 13,
                                  color: isActive
                                    ? groupColor
                                    : 'var(--ant-color-text)',
                                  fontWeight: isActive ? 600 : 400,
                                  lineHeight: 1,
                                }}
                              >
                                {item.label}
                              </span>
                            </div>
                          );
                        })
                    )}
                  </div>
                </Sider>
              )}

              {/* 右侧 rail — 固定 44px,点图标弹/收子菜单(首页不显示) */}
              {location.pathname !== '/dashboard' && (
                <Sider
                  width={44}
                  theme={appStore.isDark ? 'dark' : 'light'}
                  style={{
                    background: 'var(--ant-color-bg-container)',
                    borderLeft: '1px solid var(--ant-color-border-secondary)',
                    flex: '0 0 auto',
                    borderRadius: 12,
                  }}
                >
                  <div
                    style={{
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      padding: '12px 0',
                      gap: 8,
                    }}
                  >
                    {/* 审批入口 — 仅当前详情页有审批上下文时显示,默认高亮 */}
                    {approvalPanelStore.active && (
                      <Tooltip
                        placement="left"
                        title="审批"
                        mouseEnterDelay={0.3}
                      >
                        <div
                          style={{
                            width: 34,
                            height: 34,
                            borderRadius: 8,
                            background:
                              activeQuickMenu === APPROVAL_MENU_KEY
                                ? `${appStore.primaryColor}15`
                                : approvalPanelStore.pending
                                  ? '#faad1422'
                                  : 'transparent',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            cursor: 'pointer',
                            transition: 'all 0.15s ease',
                            color:
                              activeQuickMenu === APPROVAL_MENU_KEY
                                ? appStore.primaryColor
                                : approvalPanelStore.pending
                                  ? '#faad14'
                                  : 'var(--ant-color-text-tertiary)',
                            marginBottom: 4,
                          }}
                          onClick={() =>
                            setActiveQuickMenu(
                              activeQuickMenu === APPROVAL_MENU_KEY
                                ? null
                                : APPROVAL_MENU_KEY,
                            )
                          }
                        >
                          <SafetyOutlined style={{ fontSize: 18 }} />
                        </div>
                      </Tooltip>
                    )}
                    {/* 流程入口 — 仅状态机详情页(补贴/配租)显示,默认高亮 */}
                    {lifecyclePanelStore.active && (
                      <Tooltip
                        placement="left"
                        title="状态流程"
                        mouseEnterDelay={0.3}
                      >
                        <div
                          style={{
                            width: 34,
                            height: 34,
                            borderRadius: 8,
                            background:
                              activeQuickMenu === LIFECYCLE_MENU_KEY
                                ? `${appStore.primaryColor}15`
                                : 'transparent',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            cursor: 'pointer',
                            transition: 'all 0.15s ease',
                            color:
                              activeQuickMenu === LIFECYCLE_MENU_KEY
                                ? appStore.primaryColor
                                : 'var(--ant-color-text-tertiary)',
                            marginBottom: 4,
                          }}
                          onClick={() =>
                            setActiveQuickMenu(
                              activeQuickMenu === LIFECYCLE_MENU_KEY
                                ? null
                                : LIFECYCLE_MENU_KEY,
                            )
                          }
                        >
                          <ApartmentOutlined style={{ fontSize: 18 }} />
                        </div>
                      </Tooltip>
                    )}
                    {quickMenuGroups.map((group) => {
                      const isActive = activeQuickMenu === group.key;
                      return (
                        <Tooltip
                          key={group.key}
                          placement="left"
                          title={group.label}
                          mouseEnterDelay={0.3}
                        >
                          <div
                            style={{
                              width: 34,
                              height: 34,
                              borderRadius: 8,
                              background: isActive
                                ? `${group.color}15`
                                : 'transparent',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              cursor: 'pointer',
                              transition: 'all 0.15s ease',
                              color: isActive
                                ? group.color
                                : 'var(--ant-color-text-tertiary)',
                            }}
                            onClick={() => handleQuickMenuToggle(group.key)}
                            onMouseEnter={(e) => {
                              if (!isActive) {
                                e.currentTarget.style.background =
                                  'var(--ant-color-fill-tertiary)';
                                e.currentTarget.style.color =
                                  appStore.primaryColor;
                              }
                            }}
                            onMouseLeave={(e) => {
                              if (!isActive) {
                                e.currentTarget.style.background =
                                  'transparent';
                                e.currentTarget.style.color =
                                  'var(--ant-color-text-tertiary)';
                              }
                            }}
                          >
                            <span style={{ fontSize: 18, lineHeight: 1 }}>
                              {group.icon}
                            </span>
                          </div>
                        </Tooltip>
                      );
                    })}
                  </div>
                </Sider>
              )}
            </Layout>
          </Layout>
        </Layout>

        {/* 主题设置抽屉(右侧) — 参考原型 #offcanvas-settings */}
        <Drawer
          title="主题设置"
          placement="right"
          width={320}
          open={themeDrawerOpen}
          onClose={() => setThemeDrawerOpen(false)}
          styles={{ body: { padding: 16 } }}
        >
          <ThemeSettings />
        </Drawer>
      </ConfigProvider>
    );
  },
);

export default BasicLayout;
