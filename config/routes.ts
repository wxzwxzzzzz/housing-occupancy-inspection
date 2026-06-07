/**
 * @name umi 的路由配置
 * @description 只支持 path,component,routes,redirect,wrappers,name,icon 的配置
 * @doc https://umijs.org/docs/guides/routes
 *
 * 菜单按业务化分组(对应本体的语义):
 *   1. 工作台
 *   2. 居民档案 — Resident / Household / Residence / Employment / PersonalIncome
 *   3. 保障业务 — EligibilityApplication / HousingAllocation / RentalSubsidy / EligibilityTermination
 *   4. 监测与处置 — Attendance + 各类申请单(Leave/Makeup/MigrantWork/三类变更)
 *   5. 考勤配置 — AttendanceSolution / AttendanceRule / LeaveType / Calendar
 *   6. 分析与报表 — *Fact 事实模型
 *   7. 系统与运维 — Fence / Region / 用户角色 / 配置 / 日志 / 消息
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

      // ========== 居民档案 ==========
      {
        name: '居民档案',
        icon: 'team',
        path: '/profile',
        routes: [
          {
            path: '/profile/residents',
            name: '保障居民',
            icon: 'user',
            component: './Residents',
          },
          {
            path: '/profile/residents/detail/:id',
            name: '居民详情',
            component: './Residents/ResidentDetail',
            hideInMenu: true,
          },
          {
            path: '/profile/households',
            name: '保障家庭',
            icon: 'home',
            component: './Profile/Households',
          },
          {
            path: '/profile/households/detail/:id',
            name: '家庭详情',
            component: './Profile/HouseholdDetail',
            hideInMenu: true,
          },
        ],
      },

      // ========== 保障业务 ==========
      {
        name: '保障业务',
        icon: 'safety',
        path: '/eligibility',
        routes: [
          {
            path: '/eligibility/applications',
            name: '资质申请',
            icon: 'file-text',
            component: './Eligibility/Applications',
          },
          {
            path: '/eligibility/applications/detail/:id',
            name: '资质申请详情',
            component: './Eligibility/ApplicationDetail',
            hideInMenu: true,
          },
          {
            path: '/eligibility/allocations',
            name: '实物配租',
            icon: 'home',
            component: './Eligibility/Allocations',
          },
          {
            path: '/eligibility/allocations/detail/:id',
            name: '配租详情',
            component: './Eligibility/AllocationDetail',
            hideInMenu: true,
          },
          {
            path: '/eligibility/subsidies',
            name: '租赁补贴',
            icon: 'pay-circle',
            component: './Eligibility/Subsidies',
          },
          {
            path: '/eligibility/subsidies/detail/:id',
            name: '补贴详情',
            component: './Eligibility/SubsidyDetail',
            hideInMenu: true,
          },
          {
            path: '/eligibility/terminations',
            name: '资格终止',
            icon: 'stop',
            component: './Eligibility/Terminations',
          },
          {
            path: '/eligibility/terminations/detail/:id',
            name: '终止详情',
            component: './Eligibility/TerminationDetail',
            hideInMenu: true,
          },
        ],
      },

      // ========== 监测与处置 ==========
      {
        name: '监测与处置',
        icon: 'monitor',
        path: '/monitor',
        routes: [
          {
            path: '/monitor/attendance',
            name: '考勤打卡',
            icon: 'check-circle',
            component: './Monitor/Attendance',
          },
          {
            path: '/monitor/attendance/detail/:id',
            name: '打卡详情',
            component: './Monitor/AttendanceDetail',
            hideInMenu: true,
          },
          {
            path: '/monitor/leaves',
            name: '请假申请',
            icon: 'calendar',
            component: './Monitor/Leaves',
          },
          {
            path: '/monitor/leaves/detail/:id',
            name: '请假详情',
            component: './Monitor/LeaveDetail',
            hideInMenu: true,
          },
          {
            path: '/monitor/makeups',
            name: '补卡申请',
            icon: 'reload',
            component: './Monitor/Makeups',
          },
          {
            path: '/monitor/makeups/detail/:id',
            name: '补卡详情',
            component: './Monitor/MakeupDetail',
            hideInMenu: true,
          },
          {
            path: '/monitor/migrant-works',
            name: '外出务工',
            icon: 'rocket',
            component: './Monitor/MigrantWorks',
          },
          {
            path: '/monitor/migrant-works/detail/:id',
            name: '外出务工详情',
            component: './Monitor/MigrantWorkDetail',
            hideInMenu: true,
          },
          {
            path: '/monitor/residence-changes',
            name: '居住地址变更',
            icon: 'environment',
            component: './Monitor/ResidenceChanges',
          },
          {
            path: '/monitor/residence-changes/detail/:id',
            name: '居住变更详情',
            component: './Monitor/ResidenceChangeDetail',
            hideInMenu: true,
          },
          {
            path: '/monitor/employment-changes',
            name: '工作地址变更',
            icon: 'shop',
            component: './Monitor/EmploymentChanges',
          },
          {
            path: '/monitor/employment-changes/detail/:id',
            name: '工作变更详情',
            component: './Monitor/EmploymentChangeDetail',
            hideInMenu: true,
          },
          {
            path: '/monitor/member-changes',
            name: '家庭成员变更',
            icon: 'usergroup-add',
            component: './Monitor/MemberChanges',
          },
          {
            path: '/monitor/member-changes/detail/:id',
            name: '成员变更详情',
            component: './Monitor/MemberChangeDetail',
            hideInMenu: true,
          },
          {
            path: '/monitor/alert-list',
            name: '预警列表',
            icon: 'alert',
            component: './Monitor/AlertList',
            hideInMenu: true,
          },
          {
            path: '/monitor/alert',
            name: '预警处置',
            icon: 'warning',
            component: './Monitor/Alert',
            hideInMenu: true,
          },
          {
            path: '/monitor/alert/detail/:id',
            name: '预警详情',
            component: './Monitor/AlertDetail',
            hideInMenu: true,
          },
        ],
      },

      // ========== 考勤配置 ==========
      {
        name: '考勤配置',
        icon: 'schedule',
        path: '/attendance-config',
        routes: [
          {
            path: '/attendance-config/solutions',
            name: '考勤方案',
            icon: 'apartment',
            component: './AttendanceConfig/Solutions',
          },
          {
            path: '/attendance-config/rules',
            name: '考勤规则',
            icon: 'control',
            component: './AttendanceConfig/Rules',
          },
          {
            path: '/attendance-config/leave-types',
            name: '请假类型',
            icon: 'tag',
            component: './AttendanceConfig/LeaveTypes',
          },
          {
            path: '/attendance-config/calendars',
            name: '资源日历',
            icon: 'calendar',
            component: './AttendanceConfig/Calendars',
          },
          {
            path: '/attendance-config/workflow',
            name: '审批流程',
            icon: 'partition',
            component: './Approval/Workflow',
          },
        ],
      },

      // ========== 分析与报表 ==========
      {
        name: '分析与报表',
        icon: 'bar-chart',
        path: '/report',
        routes: [
          // 监测预警(复用 AttendanceFact)
          {
            path: '/report/attendance-alert',
            name: '监测预警事实表',
            icon: 'warning',
            component: './Report/AttendanceAlert',
          },
          // 档案快照(5)
          {
            path: '/report/resident-snapshot',
            name: '居民快照',
            icon: 'pie-chart',
            component: './Report/ResidentSnapshot',
          },
          {
            path: '/report/household-snapshot',
            name: '家庭快照',
            icon: 'pie-chart',
            component: './Report/HouseholdSnapshot',
          },
          {
            path: '/report/household-member-snapshot',
            name: '家庭成员快照',
            icon: 'pie-chart',
            component: './Report/HouseholdMemberSnapshot',
          },
          {
            path: '/report/residence-snapshot',
            name: '居住信息快照',
            icon: 'pie-chart',
            component: './Report/ResidenceSnapshot',
          },
          {
            path: '/report/employment-snapshot',
            name: '工作信息快照',
            icon: 'pie-chart',
            component: './Report/EmploymentSnapshot',
          },
          // 收入与考勤(4)
          {
            path: '/report/personal-income',
            name: '个人收入',
            icon: 'line-chart',
            component: './Report/PersonalIncome',
          },
          {
            path: '/report/attendance',
            name: '考勤打卡',
            icon: 'line-chart',
            component: './Report/Attendance',
          },
          {
            path: '/report/leave',
            name: '请假',
            icon: 'line-chart',
            component: './Report/Leave',
          },
          {
            path: '/report/attendance-makeup',
            name: '补卡申请',
            icon: 'line-chart',
            component: './Report/AttendanceMakeup',
          },
          // 业务与变更(8)
          {
            path: '/report/eligibility-application',
            name: '资质申请',
            icon: 'fund',
            component: './Report/EligibilityApplication',
          },
          {
            path: '/report/housing-allocation',
            name: '实物配租',
            icon: 'fund',
            component: './Report/HousingAllocation',
          },
          {
            path: '/report/rental-subsidy',
            name: '租赁补贴',
            icon: 'fund',
            component: './Report/RentalSubsidy',
          },
          {
            path: '/report/eligibility-termination',
            name: '资格终止',
            icon: 'fund',
            component: './Report/EligibilityTermination',
          },
          {
            path: '/report/migrant-work',
            name: '外出务工',
            icon: 'swap',
            component: './Report/MigrantWork',
          },
          {
            path: '/report/household-member-change',
            name: '家庭成员变更',
            icon: 'swap',
            component: './Report/HouseholdMemberChange',
          },
          {
            path: '/report/residence-change',
            name: '居住地址变更',
            icon: 'swap',
            component: './Report/ResidenceChange',
          },
          {
            path: '/report/employment-change',
            name: '工作地址变更',
            icon: 'swap',
            component: './Report/EmploymentChange',
          },
        ],
      },

      // ========== 系统与运维 ==========
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
            path: '/system/personnel/detail/:id',
            name: '人员详情',
            component: './System/PersonnelDetail',
            hideInMenu: true,
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

      // 兼容旧链接(从原 /residents/* 与 /approval/* 路径跳转)
      { path: '/residents', redirect: '/profile/residents' },
      {
        path: '/residents/:id',
        redirect: '/profile/residents/detail/:id',
      },
      {
        path: '/residents/detail/:id',
        redirect: '/profile/residents/detail/:id',
      },
      { path: '/approval/leave', redirect: '/monitor/leaves' },
      { path: '/approval/filing', redirect: '/monitor/migrant-works' },
      { path: '/approval/material', redirect: '/eligibility/applications' },
      {
        path: '/approval/leave/detail/:id',
        redirect: '/monitor/leaves/detail/:id',
      },
      {
        path: '/approval/filing/detail/:id',
        redirect: '/monitor/migrant-works/detail/:id',
      },
      {
        path: '/approval/material/detail/:id',
        redirect: '/eligibility/applications/detail/:id',
      },
      { path: '/approval/workflow', redirect: '/attendance-config/workflow' },
      {
        path: '/approval/detail/:type/:id',
        component: './Approval/Detail',
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
