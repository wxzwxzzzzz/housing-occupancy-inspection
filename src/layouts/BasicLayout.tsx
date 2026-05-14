import React, {useState, useMemo, useEffect} from 'react'
import {Layout, Menu, Avatar, Dropdown, Badge, Popover, List, Button, Space, Tabs} from 'antd'
import {
  FileTextOutlined,
  WarningOutlined,
  CalendarOutlined,
  EnvironmentOutlined,
  SettingOutlined,
  DashboardOutlined,
  BellOutlined,
  UserOutlined,
  LogoutOutlined,
  MonitorOutlined,
  BarChartOutlined,
  FileImageOutlined,
  CheckCircleOutlined,
  TeamOutlined,
  MenuOutlined,
  ControlOutlined,
  FileSearchOutlined,
  LineChartOutlined,
  DownloadOutlined,
  ApartmentOutlined,
  FilterOutlined,
  CloseOutlined,
} from '@ant-design/icons'
import {observer} from 'mobx-react-lite'
import {userStore} from '../stores'
import {Link, useLocation, useNavigate, Outlet} from 'react-router-dom'
import type {MenuProps} from 'antd'

const {Header, Sider, Content} = Layout

// 页签类型定义
interface TabItem {
  key: string
  label: string
  path: string
  closable: boolean
}

// 图标映射
const iconMap: Record<string, React.ReactNode> = {
  dashboard: <DashboardOutlined/>,
  monitor: <MonitorOutlined/>,
  'check-circle': <CheckCircleOutlined/>,
  warning: <WarningOutlined/>,
  'file-text': <FileTextOutlined/>,
  'file-image': <FileImageOutlined/>,
  calendar: <CalendarOutlined/>,
  environment: <EnvironmentOutlined/>,
  apartment: <ApartmentOutlined/>,
  'bar-chart': <BarChartOutlined/>,
  'line-chart': <LineChartOutlined/>,
  download: <DownloadOutlined/>,
  setting: <SettingOutlined/>,
  bell: <BellOutlined/>,
  team: <TeamOutlined/>,
  user: <UserOutlined/>,
  menu: <MenuOutlined/>,
  control: <ControlOutlined/>,
  'file-search': <FileSearchOutlined/>,
  filter: <FilterOutlined/>,
}

// 路由标题映射
const routeTitleMap: Record<string, string> = {
  '/dashboard': '工作台',
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
}

// 本地存储键名
const TABS_STORAGE_KEY = 'app_tabs'

const BasicLayout: React.FC<{ children?: React.ReactNode }> = observer(({children}) => {
  const location = useLocation()
  const navigate = useNavigate()
  const [notificationOpen, setNotificationOpen] = useState(false)
  const [collapsed, setCollapsed] = useState(false)
  const [activeQuickMenu, setActiveQuickMenu] = useState<string | null>(null)

  // 页签状态管理
  const [tabs, setTabs] = useState<TabItem[]>(() => {
    // 从本地存储恢复页签
    const savedTabs = localStorage.getItem(TABS_STORAGE_KEY)
    if (savedTabs) {
      try {
        return JSON.parse(savedTabs)
      } catch (e) {
        console.error('Failed to parse saved tabs:', e)
      }
    }
    // 默认打开工作台
    return [{
      key: '/dashboard',
      label: '工作台',
      path: '/dashboard',
      closable: false,
    }]
  })

  // 保存页签到本地存储
  useEffect(() => {
    localStorage.setItem(TABS_STORAGE_KEY, JSON.stringify(tabs))
  }, [tabs])

  // 监听路由变化,自动添加页签
  useEffect(() => {
    const currentPath = location.pathname
    const title = routeTitleMap[currentPath]

    if (title && !tabs.find(tab => tab.path === currentPath)) {
      const newTab: TabItem = {
        key: currentPath,
        label: title,
        path: currentPath,
        closable: currentPath !== '/dashboard', // 工作台不可关闭
      }
      setTabs(prev => [...prev, newTab])
    }
  }, [location.pathname, tabs])

  // 切换页签
  const handleTabChange = (key: string) => {
    navigate(key)
  }

  // 关闭页签
  const handleTabRemove = (targetKey: string) => {
    const targetIndex = tabs.findIndex(tab => tab.key === targetKey)
    const newTabs = tabs.filter(tab => tab.key !== targetKey)

    // 如果关闭的是当前页签,需要跳转到相邻页签
    if (location.pathname === targetKey) {
      let nextTab: TabItem | undefined
      if (targetIndex > 0) {
        nextTab = newTabs[targetIndex - 1]
      } else if (newTabs.length > 0) {
        nextTab = newTabs[0]
      }

      if (nextTab) {
        navigate(nextTab.path)
      }
    }

    setTabs(newTabs)
  }

  // 关闭其他页签
  const handleCloseOthers = () => {
    const currentTab = tabs.find(tab => tab.path === location.pathname)
    const dashboardTab = tabs.find(tab => tab.path === '/dashboard')

    const newTabs: TabItem[] = []
    if (dashboardTab) newTabs.push(dashboardTab)
    if (currentTab && currentTab.path !== '/dashboard') newTabs.push(currentTab)

    setTabs(newTabs)
  }

  // 关闭所有页签
  const handleCloseAll = () => {
    const dashboardTab = tabs.find(tab => tab.path === '/dashboard')
    setTabs(dashboardTab ? [dashboardTab] : [])
    navigate('/dashboard')
  }

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
    if (allow.length === 0) return path === '/dashboard' || path === '/system/message';
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
      icon: <MonitorOutlined/>,
      label: '监测',
      color: '#52c41a',
      lightColor: '#f6ffed',
      hoverColor: '#d9f7be',
      children: [
        {label: '打卡核验', path: '/monitor/attendance', icon: <CheckCircleOutlined/>},
        {label: '预警处置', path: '/monitor/alert', icon: <WarningOutlined/>},
      ],
    },
    {
      key: 'approval',
      icon: <FileTextOutlined/>,
      label: '审批',
      color: '#1890ff',
      lightColor: '#e6f7ff',
      hoverColor: '#bae7ff',
      children: [
        {label: '材料审批', path: '/approval/material', icon: <FileImageOutlined/>},
        {label: '请假管理', path: '/approval/leave', icon: <CalendarOutlined/>},
        {label: '备案管理', path: '/approval/filing', icon: <EnvironmentOutlined/>},
      ],
    },
    {
      key: 'report',
      icon: <BarChartOutlined/>,
      label: '报表',
      color: '#faad14',
      lightColor: '#fffbe6',
      hoverColor: '#fff1b8',
      children: [
        {label: '数据统计', path: '/report/statistics', icon: <LineChartOutlined/>},
        {label: '报表导出', path: '/report/export', icon: <DownloadOutlined/>},
      ],
    },
    {
      key: 'system',
      icon: <SettingOutlined/>,
      label: '系统',
      color: '#722ed1',
      lightColor: '#f9f0ff',
      hoverColor: '#efdbff',
      children: [
        {label: '人员管理', path: '/system/personnel', icon: <TeamOutlined/>},
        {label: '角色管理', path: '/system/role', icon: <UserOutlined/>},
        {label: '系统配置', path: '/system/config', icon: <ControlOutlined/>},
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
    setActiveQuickMenu(activeQuickMenu === key ? null : key)
  }

  const handleQuickMenuItemClick = (path: string) => {
    navigate(path)
    setActiveQuickMenu(null)
  }

  // 模拟通知消息数据
  const notifications = [
    {id: '1', title: '待审批提醒', content: '您有3条材料审批待处理', time: '5分钟前', type: 'info'},
    {id: '2', title: '预警通知', content: '张三连续3天未打卡', time: '1小时前', type: 'warning'},
    {id: '3', title: '系统消息', content: '系统将于今晚22:00进行维护', time: '3小时前', type: 'info'},
  ]

  const unreadCount = notifications.length

  // 通知列表内容
  const notificationContent = (
    <div style={{width: 320}}>
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: '12px 16px',
        borderBottom: '1px solid #f0f0f0'
      }}>
        <span style={{fontWeight: 600}}>通知消息</span>
        <Button type="link" size="small" onClick={() => navigate('/system/message')}>
          查看全部
        </Button>
      </div>
      <List
        dataSource={notifications}
        renderItem={(item) => (
          <List.Item
            style={{padding: '12px 16px', cursor: 'pointer'}}
            onClick={() => {
              setNotificationOpen(false)
              navigate('/system/message')
            }}
          >
            <List.Item.Meta
              title={
                <Space>
                  <Badge status={item.type === 'warning' ? 'warning' : 'processing'}/>
                  <span style={{fontSize: 14}}>{item.title}</span>
                </Space>
              }
              description={
                <div>
                  <div style={{fontSize: 13, color: '#666'}}>{item.content}</div>
                  <div style={{fontSize: 12, color: '#999', marginTop: 4}}>{item.time}</div>
                </div>
              }
            />
          </List.Item>
        )}
      />
    </div>
  )

  // 用户下拉菜单
  const userMenuItems = [
    {
      key: 'profile',
      icon: <UserOutlined/>,
      label: '个人中心',
      onClick: () => navigate('/profile'),
    },
    {
      key: 'settings',
      icon: <SettingOutlined/>,
      label: '账户设置',
      onClick: () => navigate('/settings'),
    },
    {
      type: 'divider' as const,
    },
    {
      key: 'logout',
      icon: <LogoutOutlined/>,
      label: '退出登录',
      onClick: () => {
        userStore.logout();
        navigate('/login');
      },
    },
  ]

  return (
    <Layout style={{height: '100vh', overflow: 'hidden'}}>

      <Layout style={{height: '100%'}}>
        <Header style={{
          background: '#fff',
          padding: '0 24px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          boxShadow: '0 1px 4px rgba(0,21,41,.08)',
          height: 64,
          flexShrink: 0,
        }}>
          <div style={{
            height: 64,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: 18,
            fontWeight: 600,
            color: '#000',
            background: 'rgba(255,255,255,0.1)'
          }}>
            {collapsed ? '公租房' : '公租房监测系统'}
          </div>
          <Space size={24}>

            {/* 通知消息 */}
            <Popover
              content={notificationContent}
              trigger="click"
              open={notificationOpen}
              onOpenChange={setNotificationOpen}
              placement="bottomRight"
            >
              <Badge count={unreadCount} offset={[-5, 5]}>
                <BellOutlined style={{fontSize: 18, cursor: 'pointer', color: '#666'}}/>
              </Badge>
            </Popover>

            {/* 用户头像 */}
            <Dropdown menu={{items: userMenuItems}} placement="bottomRight">
              <Space style={{cursor: 'pointer'}}>
                <Avatar icon={<UserOutlined/>}>
                  {(userStore.user as any)?.fullName?.[0] || (userStore.user as any)?.account?.[0] || 'U'}
                </Avatar>
                <span style={{color: '#666'}}>
                  {(userStore.user as any)?.fullName || (userStore.user as any)?.account || '用户'}
                </span>
              </Space>
            </Dropdown>
          </Space>
        </Header>
        <Layout style={{height: 'calc(100vh - 64px)'}}>
          <Sider
            collapsible
            collapsed={collapsed}
            onCollapse={setCollapsed}
            width={220}
            theme={"light" }
            style={{
              height: '100%',
              overflow: 'auto',
            }}
          >

            <Menu
              mode="inline"
              selectedKeys={[location.pathname]}
              defaultOpenKeys={[
                location.pathname.startsWith('/monitor') ? '/monitor' : '',
                location.pathname.startsWith('/approval') ? '/approval' : '',
                location.pathname.startsWith('/report') ? '/report' : '',
                location.pathname.startsWith('/system') ? '/system' : '',
              ].filter(Boolean)}
              items={menuItems}
            />
          </Sider>

          <Layout style={{
            display: 'flex',
            flexDirection: 'column',
            height: 'calc(100vh - 64px)', // 减去 Header 高度
          }}>
            {/* 页签栏 */}
            <div style={{
              background: '#fff',
              padding: '0',
              borderBottom: '1px solid #f0f0f0',
              flexShrink: 0, // 防止页签栏被压缩
            }}>
              <Tabs
                type="editable-card"
                activeKey={location.pathname}
                onChange={handleTabChange}
                onEdit={(targetKey, action) => {
                  if (action === 'remove') {
                    handleTabRemove(targetKey as string)
                  }
                }}
                hideAdd
                items={tabs.map(tab => ({
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
                      <Button type="primary"  size="small" style={{marginRight: 8}}>
                        操作
                      </Button>
                    </Dropdown>
                  ),
                }}
                style={{
                  margin: 0,
                  padding: '4px 16px 0',
                }}
              />
            </div>

            <Content style={{
              background: '#f0f2f5',
              overflow: 'auto', // 内容区域可滚动
              flex: 1, // 占据剩余空间
            }}>
              {children || <Outlet/>}
            </Content>
          </Layout>

          {/* 右侧快捷菜单面板 - 优化后的设计 */}
          {activeQuickMenu && (
            <Sider
              width={260}
              theme="light"
              style={{
                background: '#fff',
                borderLeft: '1px solid #e8e8e8',
                boxShadow: '-4px 0 12px rgba(0,0,0,0.04)',
              }}
            >
              {/* 面板标题 */}
              <div style={{
                padding: '20px 24px',
                borderBottom: '1px solid #f0f0f0',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                background: `linear-gradient(135deg, ${quickMenuGroups.find((g) => g.key === activeQuickMenu)?.lightColor} 0%, #fff 100%)`,
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <span style={{
                    fontSize: 20,
                    color: quickMenuGroups.find((g) => g.key === activeQuickMenu)?.color,
                  }}>
                    {quickMenuGroups.find((g) => g.key === activeQuickMenu)?.icon}
                  </span>
                  <span style={{
                    fontSize: 16,
                    fontWeight: 600,
                    color: '#262626',
                    letterSpacing: '0.3px',
                  }}>
                    {quickMenuGroups.find((g) => g.key === activeQuickMenu)?.label}
                  </span>
                </div>
                <Button
                  type="text"
                  size="small"
                  icon={<CloseOutlined />}
                  onClick={() => setActiveQuickMenu(null)}
                  style={{
                    color: '#8c8c8c',
                    transition: 'all 0.2s',
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.color = '#262626';
                    e.currentTarget.style.background = 'rgba(0,0,0,0.04)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.color = '#8c8c8c';
                    e.currentTarget.style.background = 'transparent';
                  }}
                />
              </div>

              {/* 菜单列表 */}
              <div style={{
                height: 'calc(100vh - 64px - 61px)',
                overflowY: 'auto',
                padding: '12px 8px',
              }}>
                {quickMenuGroups
                  .find((g) => g.key === activeQuickMenu)
                  ?.children.map((item, index) => {
                    const isActive = location.pathname === item.path;
                    const groupColor = quickMenuGroups.find((g) => g.key === activeQuickMenu)?.color || '#1890ff';

                    return (
                      <div
                        key={index}
                        style={{
                          margin: '4px 0',
                          padding: '14px 16px',
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          gap: 14,
                          transition: 'all 0.25s cubic-bezier(0.4, 0, 0.2, 1)',
                          background: isActive
                            ? `linear-gradient(90deg, ${groupColor}15 0%, ${groupColor}08 100%)`
                            : 'transparent',
                          borderRadius: 10,
                          borderLeft: isActive ? `3px solid ${groupColor}` : '3px solid transparent',
                          position: 'relative',
                          overflow: 'hidden',
                        }}
                        onClick={() => handleQuickMenuItemClick(item.path)}
                        onMouseEnter={(e) => {
                          if (!isActive) {
                            e.currentTarget.style.background = '#fafafa';
                            e.currentTarget.style.transform = 'translateX(2px)';
                          }
                        }}
                        onMouseLeave={(e) => {
                          if (!isActive) {
                            e.currentTarget.style.background = 'transparent';
                            e.currentTarget.style.transform = 'translateX(0)';
                          }
                        }}
                      >
                        {/* 激活状态的背景装饰 */}
                        {isActive && (
                          <div style={{
                            position: 'absolute',
                            right: -10,
                            top: -10,
                            width: 40,
                            height: 40,
                            borderRadius: '50%',
                            background: `${groupColor}10`,
                            pointerEvents: 'none',
                          }} />
                        )}

                        <span style={{
                          fontSize: 20,
                          color: isActive ? groupColor : '#8c8c8c',
                          transition: 'all 0.25s',
                          position: 'relative',
                          zIndex: 1,
                        }}>
                          {item.icon}
                        </span>
                        <span style={{
                          fontSize: 14,
                          color: isActive ? groupColor : '#262626',
                          fontWeight: isActive ? 600 : 500,
                          transition: 'all 0.25s',
                          position: 'relative',
                          zIndex: 1,
                          letterSpacing: '0.3px',
                        }}>
                          {item.label}
                        </span>
                      </div>
                    );
                  })}
              </div>
            </Sider>
          )}

          {/* 右侧快捷菜单按钮 - 极简线条风格优化版 */}
          <Sider
            width={72}
            theme="light"
            style={{
              background: '#fff',
              borderLeft: '1px solid #f0f0f0',
            }}
          >
            <div style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              padding: '40px 0',
              gap: 32,
            }}>
              {quickMenuGroups.map((group) => {
                const isActive = activeQuickMenu === group.key;
                return (
                  <div
                    key={group.key}
                    style={{
                      width: 60,
                      height: 60,
                      borderRadius: 14,
                      background: isActive ? `${group.color}08` : 'transparent',
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      justifyContent: 'center',
                      cursor: 'pointer',
                      transition: 'all 0.2s ease',
                      border: isActive ? `1.5px solid ${group.color}` : '1.5px solid transparent',
                      position: 'relative',
                      padding: '10px 6px',
                    }}
                    onClick={() => handleQuickMenuToggle(group.key)}
                    onMouseEnter={(e) => {
                      if (!isActive) {
                        e.currentTarget.style.background = '#fafafa';
                        e.currentTarget.style.border = `1.5px solid #e8e8e8`;
                      }
                    }}
                    onMouseLeave={(e) => {
                      if (!isActive) {
                        e.currentTarget.style.background = 'transparent';
                        e.currentTarget.style.border = '1.5px solid transparent';
                      }
                    }}
                  >
                    <span
                      className="quick-icon"
                      style={{
                        fontSize: 24,
                        color: isActive ? group.color : '#bfbfbf',
                        transition: 'color 0.2s ease',
                        fontWeight: 300,
                        lineHeight: 1,
                        marginBottom: 8,
                      }}
                    >
                      {group.icon}
                    </span>
                    <span
                      className="quick-label"
                      style={{
                        fontSize: 11,
                        color: isActive ? group.color : '#bfbfbf',
                        fontWeight: isActive ? 500 : 400,
                        transition: 'color 0.2s ease',
                        letterSpacing: '0.3px',
                        lineHeight: 1.2,
                        textAlign: 'center',
                      }}
                    >
                      {group.label}
                    </span>
                  </div>
                );
              })}
            </div>
          </Sider>

        </Layout>
      </Layout>
    </Layout>
  )
})

export default BasicLayout
