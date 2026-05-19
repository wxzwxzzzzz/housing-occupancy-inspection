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
  DownloadOutlined,
  EnvironmentOutlined,
  FileImageOutlined,
  FileSearchOutlined,
  FileTextOutlined,
  FilterOutlined,
  LineChartOutlined,
  LogoutOutlined,
  MenuOutlined,
  MonitorOutlined,
  SettingOutlined,
  TeamOutlined,
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
import { appStore, userStore } from '../stores';

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
};

// 路由标题映射
const routeTitleMap: Record<string, string> = {
  '/dashboard': '工作台',
  '/residents': '居民档案',
  '/monitor/attendance': '打卡核验',
  '/monitor/alert': '预警处置',
  '/approval/material': '材料审批',
  '/approval/leave': '请假管理',
  '/approval/filing': '备案管理',
  '/approval/workflow': '流程配置',
  '/report/statistics': '数据统计',
  '/report/export': '报表导出',
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

/** 动态路径生成 Tab 标题:目前只支持 /residents/:id */
function dynamicTabTitle(pathname: string): string | null {
  const matchResident = pathname.match(/^\/residents\/([^/]+)$/);
  if (matchResident) {
    const id = matchResident[1];
    return `居民 ${id.length > 8 ? id.slice(-6) : id}`;
  }
  return null;
}

// 本地存储键名
const TABS_STORAGE_KEY = 'app_tabs';
const LEFT_RAIL_KEY = 'layout_left_rail_expanded';

const BasicLayout: React.FC<{ children?: React.ReactNode }> = observer(
  ({ children }) => {
    const location = useLocation();
    const navigate = useNavigate();
    const [notificationOpen, setNotificationOpen] = useState(false);
    const [themeDrawerOpen, setThemeDrawerOpen] = useState(false);
    const [activeQuickMenu, setActiveQuickMenu] = useState<string | null>(null);

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
      '/dashboard': [], // 所有人可见
      '/residents': [ROLE.APPROVER, ROLE.STAFF],
      '/monitor': [ROLE.APPROVER, ROLE.STAFF],
      '/monitor/attendance': [ROLE.APPROVER, ROLE.STAFF],
      '/monitor/alert': [ROLE.APPROVER, ROLE.STAFF],
      '/approval': [ROLE.APPROVER, ROLE.STAFF],
      '/approval/material': [ROLE.APPROVER, ROLE.STAFF],
      '/approval/leave': [ROLE.APPROVER, ROLE.STAFF],
      '/approval/filing': [ROLE.APPROVER, ROLE.STAFF],
      '/approval/workflow': [ROLE.APPROVER], // 工作人员看不到流程配置
      '/report': [ROLE.APPROVER],
      '/report/statistics': [ROLE.APPROVER],
      '/report/export': [ROLE.APPROVER],
      '/system': [], // 系统组保留给 ADMIN(其他人通过子项控制)
      '/system/message': [ROLE.APPROVER, ROLE.STAFF, ROLE.RESIDENT],
      '/system/personnel': [], // 仅 ADMIN
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
          key: '/residents',
          icon: iconMap['team'],
          label: <Link to="/residents">居民档案</Link>,
        },
        {
          key: '/monitor',
          icon: iconMap['monitor'],
          label: '监测与处置',
          children: [
            {
              key: '/monitor/attendance',
              icon: iconMap['check-circle'],
              label: <Link to="/monitor/attendance">打卡核验</Link>,
            },
            {
              key: '/monitor/alert',
              icon: iconMap['warning'],
              label: <Link to="/monitor/alert">预警处置</Link>,
            },
          ],
        },
        {
          key: '/approval',
          icon: iconMap['file-text'],
          label: '申请与审批',
          children: [
            {
              key: '/approval/material',
              icon: iconMap['file-image'],
              label: <Link to="/approval/material">材料审批</Link>,
            },
            {
              key: '/approval/leave',
              icon: iconMap['calendar'],
              label: <Link to="/approval/leave">请假管理</Link>,
            },
            {
              key: '/approval/filing',
              icon: iconMap['environment'],
              label: <Link to="/approval/filing">备案管理</Link>,
            },
            {
              key: '/approval/workflow',
              icon: iconMap['apartment'],
              label: <Link to="/approval/workflow">流程配置</Link>,
            },
          ],
        },
        {
          key: '/report',
          icon: iconMap['bar-chart'],
          label: '分析与报表',
          children: [
            {
              key: '/report/statistics',
              icon: iconMap['line-chart'],
              label: <Link to="/report/statistics">数据统计</Link>,
            },
            {
              key: '/report/export',
              icon: iconMap['download'],
              label: <Link to="/report/export">报表导出</Link>,
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

    // 快捷菜单分组数据 - 使用更柔和的色彩方案(按角色过滤)
    const allQuickMenuGroups = [
      {
        key: 'monitor',
        icon: <MonitorOutlined />,
        label: '监测',
        color: '#52c41a',
        lightColor: '#f6ffed',
        hoverColor: '#d9f7be',
        children: [
          {
            label: '打卡核验',
            path: '/monitor/attendance',
            icon: <CheckCircleOutlined />,
          },
          {
            label: '预警处置',
            path: '/monitor/alert',
            icon: <WarningOutlined />,
          },
        ],
      },
      {
        key: 'approval',
        icon: <FileTextOutlined />,
        label: '审批',
        color: '#1890ff',
        lightColor: '#e6f7ff',
        hoverColor: '#bae7ff',
        children: [
          {
            label: '材料审批',
            path: '/approval/material',
            icon: <FileImageOutlined />,
          },
          {
            label: '请假管理',
            path: '/approval/leave',
            icon: <CalendarOutlined />,
          },
          {
            label: '备案管理',
            path: '/approval/filing',
            icon: <EnvironmentOutlined />,
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
            label: '数据统计',
            path: '/report/statistics',
            icon: <LineChartOutlined />,
          },
          {
            label: '报表导出',
            path: '/report/export',
            icon: <DownloadOutlined />,
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
        <Layout style={{ height: '100vh', overflow: 'hidden' }}>
          <Layout style={{ height: '100%' }}>
            <Header
              style={{
                height: 48,
                padding: '0 16px',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                background:
                  'color-mix(in srgb, var(--ant-color-bg-container) 72%, transparent)',
                backdropFilter: 'blur(22px) saturate(180%)',
                WebkitBackdropFilter: 'blur(22px) saturate(180%)',
                boxShadow: '0 1px 0 var(--ant-color-border-secondary)',
                fontSize: 13,
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
                    height: 48,
                    display: 'flex',
                    alignItems: 'center',
                    gap: 8,
                    paddingRight: 12,
                    fontSize: 15,
                    fontWeight: 700,
                    color: appStore.primaryColor,
                    cursor: 'pointer',
                    userSelect: 'none',
                    transition: 'opacity .15s ease',
                  }}
                >
                  <DashboardOutlined style={{ fontSize: 20 }} />
                  {collapsed ? '公租房' : '公租房监测系统'}
                </div>
              </Tooltip>
              <Space size={18}>
                {/* 通知消息 */}
                <Popover
                  content={notificationContent}
                  trigger="click"
                  open={notificationOpen}
                  onOpenChange={setNotificationOpen}
                  placement="bottomRight"
                >
                  <Badge count={unreadCount} offset={[-5, 5]}>
                    <BellOutlined
                      style={{
                        fontSize: 16,
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
                        fontSize: 16,
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
                  <Space size={8} style={{ cursor: 'pointer' }}>
                    <Avatar size={26} icon={<UserOutlined />}>
                      {(userStore.user as any)?.fullName?.[0] ||
                        (userStore.user as any)?.account?.[0] ||
                        'U'}
                    </Avatar>
                    <span
                      style={{
                        fontSize: 13,
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
                height: 'calc(100vh - 48px - 36px)',
                position: 'relative',
              }}
            >
              <Sider
                collapsed={collapsed}
                collapsedWidth={56}
                width={220}
                theme={appStore.isDark ? 'dark' : 'light'}
                trigger={null}
                style={{
                  height: '100%',
                  overflow: 'auto',
                  transition: 'width .2s cubic-bezier(.2,.8,.2,1)',
                }}
              >
                <Menu
                  mode="inline"
                  selectedKeys={[location.pathname]}
                  defaultOpenKeys={[
                    location.pathname.startsWith('/monitor') ? '/monitor' : '',
                    location.pathname.startsWith('/approval')
                      ? '/approval'
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
                  height: '100%',
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

              {/* 右侧快捷菜单子面板 — 点击 rail 图标弹出 */}
              {activeQuickMenu && (
                <Sider
                  width={280}
                  theme={appStore.isDark ? 'dark' : 'light'}
                  style={{
                    background: 'var(--ant-color-bg-container)',
                    borderLeft: '1px solid var(--ant-color-border-secondary)',
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
                      {
                        quickMenuGroups.find((g) => g.key === activeQuickMenu)
                          ?.label
                      }
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
                      height: 'calc(100vh - 48px - 36px - 48px)',
                      overflowY: 'auto',
                      padding: '8px 8px',
                    }}
                  >
                    {quickMenuGroups
                      .find((g) => g.key === activeQuickMenu)
                      ?.children.map((item) => {
                        const isActive = location.pathname === item.path;
                        const groupColor =
                          quickMenuGroups.find((g) => g.key === activeQuickMenu)
                            ?.color || appStore.primaryColor;

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
                            onClick={() => handleQuickMenuItemClick(item.path)}
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
                      })}
                  </div>
                </Sider>
              )}

              {/* 右侧 rail — 固定 44px,点图标弹/收子菜单 */}
              <Sider
                width={44}
                theme={appStore.isDark ? 'dark' : 'light'}
                style={{
                  background: 'var(--ant-color-bg-container)',
                  borderLeft: '1px solid var(--ant-color-border-secondary)',
                  flex: '0 0 auto',
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
                              e.currentTarget.style.background = 'transparent';
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
