/**
 * @name umi 的路由配置
 * @description 只支持 path,component,routes,redirect,wrappers,name,icon 的配置
 * @doc https://umijs.org/docs/guides/routes
 */
export default [
  {
    path: '/login',
    layout: false,
    component: './Login',
  },
  {
    path: '/',
    component: '@/layouts/BasicLayout',
    routes: [
      {
        path: '/dashboard',
        name: '工作台',
        icon: 'dashboard',
        component: './Dashboard',
      },
      {
        name: '监测与处置',
        icon: 'monitor',
        path: '/monitor',
        routes: [
          {
            path: '/monitor/attendance',
            name: '打卡核验',
            icon: 'check-circle',
            component: './Monitor/Attendance',
          },
          {
            path: '/monitor/alert-list',
            name: '预警列表',
            icon: 'alert',
            component: './Monitor/AlertList',
          },
          {
            path: '/monitor/alert',
            name: '预警处置',
            icon: 'warning',
            component: './Monitor/Alert',
          },
          {
            path: '/monitor/alert/detail/:id',
            name: '预警详情',
            component: './Monitor/AlertDetail',
            hideInMenu: true,
          },
        ],
      },
      {
        name: '申请与审批',
        icon: 'file-text',
        path: '/approval',
        routes: [
          {
            path: '/approval/material',
            name: '材料审批',
            icon: 'file-image',
            component: './Approval/Material',
          },
          {
            path: '/approval/leave',
            name: '请假管理',
            icon: 'calendar',
            component: './Approval/Leave',
          },
          {
            path: '/approval/filing',
            name: '备案管理',
            icon: 'environment',
            component: './Approval/Filing',
          },
          {
            path: '/approval/workflow',
            name: '流程配置',
            icon: 'apartment',
            component: './Approval/Workflow',
          },
          {
            path: '/approval/detail/:type/:id',
            name: '审批详情',
            component: './Approval/Detail',
            hideInMenu: true,
          },
        ],
      },
      {
        name: '分析与报表',
        icon: 'bar-chart',
        path: '/report',
        routes: [
          {
            path: '/report/statistics',
            name: '数据统计',
            icon: 'line-chart',
            component: './Report/Statistics',
          },
          {
            path: '/report/export',
            name: '报表导出',
            icon: 'download',
            component: './Report/Export',
          },
        ],
      },
      {
        name: '系统与运维',
        icon: 'setting',
        path: '/system',
        routes: [
          {
            path: '/system/message',
            name: '消息中心',
            icon: 'bell',
            component: './System/Message',
          },
          {
            path: '/system/personnel',
            name: '人员管理',
            icon: 'team',
            component: './System/Personnel',
          },
          {
            path: '/system/role',
            name: '角色管理',
            icon: 'user',
            component: './System/Role',
          },
          {
            path: '/system/menu',
            name: '菜单配置',
            icon: 'menu',
            component: './System/Menu',
          },
          {
            path: '/system/config',
            name: '系统配置',
            icon: 'control',
            component: './System/Config',
          },
          {
            path: '/system/log',
            name: '日志审计',
            icon: 'file-search',
            component: './System/Log',
          },
          {
            path: '/system/filter',
            name: '筛选器管理',
            icon: 'filter',
            component: './Filter',
          },
          {
            path: '/system/fence',
            name: '电子围栏',
            icon: 'environment',
            component: './Fence',
          },
        ],
      },
      {
        path: '/',
        redirect: '/dashboard',
      },
    ],
  },
  {
    path: '*',
    layout: false,
    component: './404',
  },
];
