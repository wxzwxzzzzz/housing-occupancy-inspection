# 动作使用指南（Action Usage Guide）

> 信息来源：本体 XML（`ontology/`）。本文档为辅助参考，以本体 XML 为准。
> 最后更新：2026-04-30

## Action Kind 分类说明

OMS 平台将所有动作按 `kind` 分类，每种 kind 有固定的语义约定：

| Kind | 中文 | 语义说明 | 典型参数模式 |
|------|------|---------|------------|
| add | 新增 | 创建新对象，执行前置规则后调用 `func:oms/add` | 业务字段（必填项） |
| modify | 修改 | 更新已有对象，code 等唯一标识通常只读 | 可修改字段 |
| delete | 删除 | 物理或逻辑删除，无额外参数 | 无 |
| list | 列表 | 分页查询，接受 QuerySpec | QuerySpec |
| detail | 详情 | 单对象查询，接受 QuerySpec | QuerySpec |
| querytree | 树查询 | 层级数据查询，接受 QuerySpec + TreeQueryOptions | QuerySpec |
| enable | 启用 | 将对象状态设为启用 | 无 |
| stop | 停用 | 将对象状态设为停用 | 无 |
| refer | 参照 | 用于下拉选择场景的轻量列表查询 | QuerySpec |
| submit | 提交 | 将草稿状态推进到审批/生效流程 | 无 |
| unsubmit | 取消提交 | 撤回已提交状态 | 无 |
| archive | 归档 | 将对象标记为历史归档状态 | archiveReason（必填）、archiveNote |
| verify | 验证 | 身份/资质验证，通常含人脸比对 | facePhoto 等 |
| checkin | 打卡 | 考勤打卡，记录当前时间 | attendanceType（必填） |
| signup | 注册 | 用户自助注册 | account、password 等 |
| authenticate | 认证 | 用户登录认证 | account/email/phone、password |
| activate | 激活 | 将对象从已认证状态推进到激活状态 | 无 |
| invite | 邀请 | 邀请成员加入家庭或租户 | 无 |
| terminate | 终止 | 强制终止生效中的记录 | 无 |
| expire | 到期 | 系统触发的到期处理 | 无 |
| suspend | 暂停 | 暂停生效中的记录 | 无 |
| resume | 恢复 | 恢复暂停中的记录 | 无 |
| approve | 审批通过 | 审批人通过申请 | 无 |
| lockAccount | 锁定账户 | 管理员锁定用户账户 | 无 |
| unlockAccount | 解锁账户 | 管理员解锁用户账户 | 无 |

## 调用方式说明

所有动作通过 `ActionSpec` 调用：

```typescript
import type { ActionSpec } from '../ap/oql'

const spec: ActionSpec = {
  objectType: 'cn.byteawake.ap.basedoc.AdministrativeRegion',
  actionName: 'add',
  payload: {
    code: 'CN-11',
    nationalCode: '110000',
    countryCode: 'CN',
    regionType: 'MUNICIPALITY',
  }
}
```

返回值统一为 `OntologyResult`：

```typescript
import type { OntologyResult } from '../ap/oms'
// result.success: boolean
// result.code: string
// result.message: string
// result.data: OntologyObject[]  // 新增/修改成功时包含对象
// result.fieldErrors: FieldError[]  // 校验失败时包含字段错误
```

---

## cn.byteawake.ap.basedoc — 基础档案

### AdministrativeRegion（行政区划）

#### add — 新增区划

| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| code | string | 是 | 区划编码 |
| nationalCode | string | 是 | 国标码 |
| countryCode | string | 是 | 国家码 |
| regionType | RegionType | 是 | 区划类型（PROVINCE/MUNICIPALITY/DISTRICT/SUBDISTRICT 等） |

**使用场景：** 管理员录入新的行政区划节点，如新增街道或村委会。执行前会初始化时间轴（ITimeline）。

#### modify — 修改区划

| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| code | string | — | 只读，不可修改 |
| nationalCode | string | — | 只读，不可修改 |
| countryCode | string | — | 只读，不可修改 |
| regionType | RegionType | 否 | 区划类型 |
| shortName | string | 否 | 简称 |
| pinyin | string | 否 | 拼音 |
| pinyinShort | string | 否 | 拼音缩写 |
| longitude | number | 否 | 中心点经度（精度10位，小数6位） |
| latitude | number | 否 | 中心点纬度（精度10位，小数6位） |

**注意：** code、nationalCode、countryCode 在修改时只读，不可变更。

#### delete — 删除区划

无额外参数，通过对象 id 定位。

#### list — 列表查询

接受 `QuerySpec`，支持分页、过滤、排序。

#### detail — 详情查询

接受 `QuerySpec`，按 id 或条件查询单条记录。

#### querytree — 树查询

接受 `QuerySpec`，返回层级树结构，适用于行政区划级联选择场景。

#### import — 导入

批量导入区划数据，调用 `func:oms/save`，支持 UPSERT 模式。

#### enable — 启用

将区划的 `enable` 状态设为 `true`。

#### stop — 停用

将区划的 `enable` 状态设为 `false`。

#### refer — 参照

轻量列表查询，用于下拉选择场景，调用 `func:oms/list`。


---

## cn.byteawake.ap.resource — 资源排班

### Resource（资源）

#### add — 新增资源

| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| code | string | 是 | 资源编码 |
| name | string | 是 | 资源名称 |
| resourceType | ResourceType | 是 | 资源类型（HUMAN/MATERIAL） |
| calendar | string（Calendar id） | 否 | 默认日历 |
| timezone | string | 否 | 时区（如 Asia/Shanghai） |
| efficiencyFactor | number | 否 | 效率因子（精度10位，小数2位） |

#### modify — 修改资源

| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| code | string | — | 只读，不可修改 |
| name | string | 否 | 资源名称 |
| resourceType | ResourceType | 否 | 资源类型 |
| calendar | string | 否 | 默认日历 |
| timezone | string | 否 | 时区 |
| efficiencyFactor | number | 否 | 效率因子 |

#### delete — 删除资源

无额外参数。

#### list — 列表查询

接受 `QuerySpec`。

#### detail — 详情查询

接受 `QuerySpec`。

#### enable — 启用

将资源 `enable` 设为 `true`。

#### stop — 停用

将资源 `enable` 设为 `false`。

#### refer — 参照

轻量列表，用于资源下拉选择。

---

### Calendar（资源日历）

#### add — 新增日历

| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| code | string | 是 | 日历编码 |
| name | string | 是 | 日历名称 |
| scheduleType | ScheduleType | 是 | 调度类型（FIXED/FLEXIBLE） |
| timezone | string | 否 | 时区 |
| hoursPerDay | number | 否 | 每日小时数（由 CalendarAttendance 自动推算） |
| hoursPerWeek | number | 否 | 每周小时数（由 CalendarAttendance 自动推算） |
| twoWeeksCalendar | boolean | 否 | 是否双周日历 |
| description | string | 否 | 描述 |

#### modify — 修改日历

| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| code | string | — | 只读，不可修改 |
| name | string | 否 | 日历名称 |
| scheduleType | ScheduleType | 否 | 调度类型 |
| timezone | string | 否 | 时区 |
| hoursPerDay | number | 否 | 每日小时数 |
| hoursPerWeek | number | 否 | 每周小时数 |
| twoWeeksCalendar | boolean | 否 | 是否双周日历 |
| description | string | 否 | 描述 |

#### delete / list / detail / enable / stop / refer

语义同 Resource，无额外参数差异。

---

### CalendarAttendance（工作时段）

#### add — 新增工作时段

| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| calendar | string（Calendar id） | 是 | 所属日历 |
| name | string | 是 | 时段名称 |
| dayOfWeek | Weekday | 是 | 星期（MONDAY～SUNDAY） |
| hourFrom | number | 是 | 开始小时（如 9.0 表示 09:00） |
| hourTo | number | 是 | 结束小时（如 18.0 表示 18:00） |
| dayPeriod | DayPeriod | 否 | 日内时段（MORNING/BREAK/AFTERNOON/FULL_DAY） |
| weekType | WeekType | 否 | 双周类型（FIRST/SECOND），双周日历时使用 |
| ordinal | number | 否 | 序号 |

#### modify — 修改工作时段

| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| calendar | string | — | 只读，不可修改 |
| name | string | 否 | 时段名称 |
| dayOfWeek | Weekday | 否 | 星期 |
| hourFrom | number | 否 | 开始小时 |
| hourTo | number | 否 | 结束小时 |
| dayPeriod | DayPeriod | 否 | 日内时段 |
| weekType | WeekType | 否 | 双周类型 |
| ordinal | number | 否 | 序号 |

#### delete / list / detail / enable / stop / refer

语义同 Resource。

---

### CalendarLeave（日历休班）

#### add — 新增休班安排

| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| name | string | 是 | 休班名称（如"元旦"） |
| dateFrom | string（ISO DateTime） | 是 | 开始时间 |
| dateTo | string（ISO DateTime） | 是 | 结束时间 |
| effect | LeaveEffect | 是 | 休班效果（TIME_OFF/MAKE_UP_WORKDAY） |
| calendar | string（Calendar id） | 否 | 所属日历（calendar 与 resource 至少提供一个） |
| resource | string（Resource id） | 否 | 所属资源 |
| timeType | TimeType | 否 | 时间类型（LEAVE/OTHER） |
| description | string | 否 | 描述 |

#### modify — 修改休班安排

| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| calendar | string | — | 只读，不可修改 |
| resource | string | — | 只读，不可修改 |
| name | string | 否 | 休班名称 |
| dateFrom | string | 否 | 开始时间 |
| dateTo | string | 否 | 结束时间 |
| effect | LeaveEffect | 否 | 休班效果 |
| timeType | TimeType | 否 | 时间类型 |
| description | string | 否 | 描述 |

#### delete / list / detail / enable / stop / refer

语义同 Resource。


---

## cn.byteawake.ap.arche — 启元（账户/企业/租户）

### User（用户）

#### signup — 注册

**requestType:** `SignupRequest` | **responseType:** `AuthenticateResponse`

| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| account | string | 是 | 登录账号（字母开头，4-60位字母数字下划线）；手机号注册时非必填 |
| email | string | 是 | 邮箱；手机号注册时非必填 |
| phone | string | 否 | 手机号；手机号注册模式时必填 |
| password | string | 是 | 密码（8-72位，需包含要求字符集）；联邦/手机号注册时非必填 |
| confirmPassword | string | 是 | 确认密码；联邦注册时非必填 |
| provider | string | 否 | 身份提供者（默认 email）；联邦注册时必填 |
| providerId | string | 否 | Provider 侧用户 ID；联邦注册时必填 |
| identityData | string | 否 | 身份数据（JSON） |
| rawUserMetaData | string | 否 | 用户元数据（JSON） |

**响应字段：** `userId`、`userStatus`、`sessionId`、`sessionAal`

**校验规则：** 两次密码一致、密码长度 8-72 位、密码字符集、密码未泄露。

**TypeScript 调用示例：**

```typescript
import type { ActionSpec } from '../ap/oql'

const spec: ActionSpec = {
  objectType: 'cn.byteawake.ap.arche.User',
  actionName: 'signup',
  payload: {
    account: 'zhangsan',
    email: 'zhangsan@example.com',
    password: 'P@ssw0rd123',
    confirmPassword: 'P@ssw0rd123',
  }
}
// 响应 result.data[0] 包含 userId、userStatus、sessionId、sessionAal
```

#### authenticate — 身份认证

**requestType:** `AuthenticateRequest` | **responseType:** `AuthenticateResponse`

| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| account | string | 否 | 登录账号（account/email/phone 三选一） |
| email | string | 否 | 邮箱 |
| phone | string | 否 | 手机号 |
| password | string | 是 | 密码 |

**校验规则：** 至少提供 account、email、phone 其中一个。

**响应字段：** `userId`、`userStatus`、`sessionId`、`sessionAal`

**TypeScript 调用示例：**

```typescript
const spec: ActionSpec = {
  objectType: 'cn.byteawake.ap.arche.User',
  actionName: 'authenticate',
  payload: {
    email: 'zhangsan@example.com',
    password: 'P@ssw0rd123',
  }
}
```

#### recover — 密码恢复

| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| email | string | 是 | 注册邮箱，系统发送重置链接 |

#### sendOTP — 发送验证码

| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| phone | string | 否 | 手机号（phone/email 二选一） |
| email | string | 否 | 邮箱 |
| channel | string | 否 | 发送渠道 |
| createUser | boolean | 否 | 不存在时是否自动创建用户 |

#### sendMagicLink — 发送魔法链接

| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| email | string | 是 | 目标邮箱 |
| createUser | boolean | 否 | 不存在时是否自动创建用户 |

#### enableUser — 启用用户

无额外参数。需要管理员权限（`require_admin`）。校验用户当前为停用状态。

#### disable — 停用用户

无额外参数。需要管理员权限。校验用户为正常状态且非当前登录用户。停用后级联处理成员关系。

#### deleteUser — 注销用户

无额外参数。需要 step-up 认证（`require_step_up`）。执行前匿名化个人信息并记录注销时间。

#### changeProfile — 修改资料

| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| realName | string | 否 | 真实姓名 |
| nickname | string | 否 | 昵称 |
| avatar | string | 否 | 头像 URL |

需要本人权限（`require_owner`）。

#### changeEmail — 修改邮箱

| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| newEmail | string | 是 | 新邮箱地址 |

需要 step-up 认证。触发双令牌确认流程，邮箱变更状态变为 PENDING。

#### confirmEmailChange — 确认邮箱变更

| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| emailChangeStatus | EmailChangeStatus | 是 | 变更状态确认 |

需要本人权限。校验变更处于 PENDING 状态且目标邮箱唯一。

#### inviteUser — 邀请用户

| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| email | string | 是 | 被邀请用户邮箱 |
| data | string | 否 | 用户元数据（JSON） |

需要管理员权限。

#### adminCreateUser — 管理员创建用户

| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| email | string | 否 | 邮箱 |
| phone | string | 否 | 手机号 |
| password | string | 否 | 密码（8-72位） |
| emailConfirm | boolean | 否 | 是否直接确认邮箱（默认 false） |
| phoneConfirm | boolean | 否 | 是否直接确认手机（默认 false） |
| userMetadata | string | 否 | 用户元数据（JSON） |
| appMetadata | string | 否 | 应用元数据（JSON） |

需要管理员权限。

#### lockAccount — 锁定账户

无额外参数。需要管理员权限。执行后吊销该用户所有会话。

#### unlockAccount — 解锁账户

无额外参数。需要管理员权限。

#### detail — 详情

接受 `QuerySpec`。需要管理员或本人权限（`require_admin_or_owner`）。

#### list — 列表

接受 `QuerySpec`。需要管理员权限。

---

### Enterprise（企业）

#### createEnterprise — 创建企业

| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| name | string | 是 | 企业名称 |
| integrationCode | string | 否 | 统一社会信用代码 |
| creditCode | string | 否 | 信用代码 |
| legalPerson | string | 否 | 法人代表 |
| contactName | string | 否 | 联系人 |
| contactPhone | string | 否 | 联系人手机 |
| contactEmail | string | 否 | 联系人邮箱 |
| industryId | string | 否 | 所属行业 ID |

需要登录会话（`require_session_context`）。创建后初始状态为 REGISTERED。

#### updateEnterprise — 修改企业

| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| name | string | 是 | 企业名称 |
| registerAddress | string | 否 | 工商注册地址 |
| contactName | string | 否 | 联系人 |
| contactPhone | string | 否 | 联系人手机 |
| contactEmail | string | 否 | 联系人邮箱 |
| logo | string | 否 | Logo URL |
| scale | string | 否 | 企业规模 |
| website | string | 否 | 企业官网 |
| industryId | string | 否 | 所属行业 ID |

需要企业管理员权限（`require_enterprise_admin`）。

#### submitAuthentication — 提交认证

| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| integrationCode | string | 是 | 统一社会信用代码 |
| legalPerson | string | 是 | 法人代表 |

需要企业管理员权限。仅 REGISTERED 或 REJECTED 状态可提交。

#### approveAuthentication — 通过认证

无额外参数。需要平台管理员权限。通过后状态变为 AUTHENTICATED，并自动创建默认租户。

#### rejectAuthentication — 拒绝认证

无额外参数。需要平台管理员权限。状态变为 REJECTED。

#### detail — 详情

接受 `QuerySpec`。

#### list — 列表

接受 `QuerySpec`。

---

### Tenant（租户）

#### createTenant — 创建租户

| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| name | string | 是 | 租户名称 |
| code | string | 否 | 租户编码 |
| fullName | string | 否 | 租户全称 |
| area | string | 否 | 注册地区 |
| contactName | string | 否 | 联系人 |
| contactPhone | string | 否 | 联系人手机 |
| contactEmail | string | 否 | 联系人邮箱 |
| logo | string | 否 | 徽标 URL |
| lang | string | 否 | 默认语言（默认 zh_CN） |
| timezone | string | 否 | 时区（默认 Asia/Shanghai） |

需要企业管理员权限。创建后自动初始化租户配置并创建管理员成员。

#### updateTenant — 修改租户

| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| name | string | 是 | 租户名称 |
| fullName | string | 否 | 租户全称 |
| area | string | 否 | 注册地区 |
| contactName | string | 否 | 联系人 |
| contactPhone | string | 否 | 联系人手机 |
| contactEmail | string | 否 | 联系人邮箱 |
| logo | string | 否 | 徽标 URL |
| lang | string | 否 | 默认语言 |
| timezone | string | 否 | 时区 |
| allowExit | boolean | 否 | 允许退出 |
| invitePermission | boolean | 否 | 允许邀请 |
| joinPermission | boolean | 否 | 允许加入 |

需要租户管理员权限（`require_tenant_admin`）。

#### stopTenant — 停用租户

无额外参数。需要平台管理员权限。校验无活跃订阅，停用后级联停用成员。

#### enableTenant — 启用租户

无额外参数。需要平台管理员权限。仅停用状态可启用。

#### detail — 详情

接受 `QuerySpec`。

#### list — 列表

接受 `QuerySpec`。


---

## cn.byteawake.prh — 公租房保障监管

### Resident（保障居民）

居民生命周期：草稿（DRAFT）→ 已认证（VERIFIED）→ 已激活（ACTIVATED）→ 已归档（ARCHIVED）

#### add — 新增居民

| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| fullName | string | 是 | 姓名 |
| idCardNo | string | 是 | 身份证号（18位，全局唯一） |
| phone | string | 是 | 手机号 |
| email | string | 否 | 邮箱 |
| gender | Gender | 否 | 性别 |
| birthDate | string（ISO DateTime） | 否 | 出生日期 |
| maritalStatus | MaritalStatus | 否 | 婚姻状况 |
| guaranteeType | GuaranteeType | 否 | 保障类型 |
| idCardFrontPhoto | string | 否 | 身份证正面照片 URL |
| idCardBackPhoto | string | 否 | 身份证背面照片 URL |
| householdBookPhoto | string | 否 | 户口本照片 URL |
| bankFlowPhoto | string | 否 | 银行流水照片 URL |
| marriageCertPhoto | string | 否 | 婚姻证明照片 URL |
| incomeCertPhoto | string | 否 | 收入证明照片 URL |
| socialSecurityPhoto | string | 否 | 社保证明照片 URL |

需要 `require_prh_admin` 权限。校验身份证号唯一（18位格式）、手机号格式。创建后状态为 DRAFT。

#### modify — 修改居民信息

所有字段均为可选修改，包括 fullName、idCardNo、phone、email、gender、birthDate、maritalStatus、guaranteeType 及各类照片。需要 `require_prh_admin` 权限。仅草稿状态可修改。

#### verify — 验证

| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| facePhoto | string | 是 | 人脸照片 URL，用于人脸比对 |

需要 `require_prh_admin` 权限。执行前校验状态为草稿或未认证，进行手机验证码校验和人脸比对，通过后状态变为 VERIFIED。

#### submit — 提交审核

无额外参数。需要 `require_prh_admin` 权限。仅草稿状态可提交，提交后状态变为 VERIFIED。

#### activate — 激活居民

无额外参数。需要 `require_prh_admin` 权限。仅已认证（VERIFIED）状态可激活，激活后状态变为 ACTIVATED。

#### archive — 归档退出

| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| archiveReason | TerminationReason | 是 | 归档原因 |
| archiveNote | string | 否 | 归档备注 |

需要 `require_prh_admin` 权限。仅已激活状态可归档，归档后记录归档日期。

#### list — 列表

接受 `QuerySpec`。需要 `require_prh_admin` 权限。

#### detail — 详情

接受 `QuerySpec`。需要 `require_prh_admin` 权限。

---

### Household（保障家庭）

家庭生命周期：草稿（DRAFT）→ 已激活（ACTIVE）→ 已归档（ARCHIVED）

#### add — 创建家庭

| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| applicant | string（Resident id） | 是 | 主申请人（必须为已激活居民） |
| guaranteeType | GuaranteeType | 是 | 保障类型 |
| householdSize | number | 是 | 家庭人口数（必须大于0） |

创建后状态为 DRAFT。

#### modify — 修改家庭信息

| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| guaranteeType | GuaranteeType | 否 | 保障类型 |
| householdSize | number | 否 | 家庭人口数 |

仅草稿状态可修改。

#### invite — 邀请家庭成员

无额外参数。仅草稿状态可邀请，执行后发送邀请通知。

#### submit — 提交家庭

无额外参数。校验家庭至少有一个成员，仅草稿状态可提交，提交后状态变为 ACTIVE。

#### archive — 归档退出

| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| archiveReason | TerminationReason | 是 | 归档原因 |
| archiveNote | string | 否 | 归档备注 |

需要 `require_prh_admin` 权限。仅已激活状态可归档。

#### list — 列表

接受 `QuerySpec`。需要 `require_prh_admin` 权限。

#### detail — 详情

接受 `QuerySpec`。需要 `require_prh_admin` 权限。

---

### EligibilityApplication（保障资质申请）

申请生命周期：草稿（DRAFT）→ 已提交（SUBMITTED）→ 审批中 → 通过/驳回

**TypeScript 调用示例：**

```typescript
import type { ActionSpec } from '../ap/oql'

// 新增保障申请
const addSpec: ActionSpec = {
  objectType: 'cn.byteawake.prh.EligibilityApplication',
  actionName: 'add',
  payload: {
    household: 'household-id-xxx',
    applicationType: 'INITIAL',
    guaranteeType: 'PUBLIC_RENTAL',
  }
}

// 提交保障申请
const submitSpec: ActionSpec = {
  objectType: 'cn.byteawake.prh.EligibilityApplication',
  actionName: 'submit',
  payload: { id: 'application-id-xxx' }
}
```

#### add — 新增保障申请

| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| household | string（Household id） | 是 | 所属家庭（必须为已激活状态） |
| applicationType | ApplicationType | 是 | 申请类型 |
| guaranteeType | GuaranteeType | 是 | 保障类型 |

校验家庭已激活且无进行中申请。创建后状态为 DRAFT。

#### modify — 修改保障申请

| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| applicationType | ApplicationType | 否 | 申请类型 |
| guaranteeType | GuaranteeType | 否 | 保障类型 |

仅草稿状态可修改。

#### submit — 提交保障申请

无额外参数。仅草稿状态可提交，提交后状态变为 SUBMITTED 并记录提交时间。

#### unsubmit — 撤回保障申请

无额外参数。校验已提交且无审批记录，撤回后状态退回 DRAFT。

#### list — 列表

接受 `QuerySpec`。需要 `require_prh_admin` 权限。

#### detail — 详情

接受 `QuerySpec`。需要 `require_prh_admin` 权限。

---

### HousingAllocation（实物配租）

配租生命周期：草稿（DRAFT）→ 生效（ACTIVE）→ 终止（TERMINATED）/ 到期（EXPIRED）

**TypeScript 调用示例：**

```typescript
// 新增配租
const addSpec: ActionSpec = {
  objectType: 'cn.byteawake.prh.HousingAllocation',
  actionName: 'add',
  payload: {
    household: 'household-id-xxx',
    projectName: '幸福家园公租房项目',
    buildingNo: 'A栋',
    unitNo: '2单元',
    roomNo: '301',
    area: 45.5,
    monthlyRent: 800,
    leaseStartDate: '2026-05-01T00:00:00Z',
    leaseEndDate: '2029-04-30T23:59:59Z',
  }
}

// 提交生效
const submitSpec: ActionSpec = {
  objectType: 'cn.byteawake.prh.HousingAllocation',
  actionName: 'submit',
  payload: { id: 'allocation-id-xxx' }
}
```

#### add — 新增配租

| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| household | string（Household id） | 是 | 所属家庭（必须为候选状态） |
| projectName | string | 是 | 项目名称 |
| leaseStartDate | string（ISO DateTime） | 是 | 租赁开始日期 |
| buildingNo | string | 否 | 楼栋号 |
| unitNo | string | 否 | 单元号 |
| roomNo | string | 否 | 房号 |
| area | number | 否 | 面积（m²） |
| monthlyRent | number | 否 | 月租金 |
| leaseEndDate | string | 否 | 租赁结束日期 |

需要 `require_prh_admin` 权限。校验家庭为候选状态且无生效配租。创建后状态为 DRAFT。

#### modify — 修改配租信息

仅草稿状态可修改，可修改所有非关联字段。

#### submit — 提交生效

无额外参数。仅草稿状态可提交，提交后状态变为 ACTIVE。

#### unsubmit — 撤回配租

无额外参数。状态退回 DRAFT。

#### terminate — 终止配租

无额外参数。需要 `require_prh_admin` 权限。仅生效状态可终止，终止后状态变为 TERMINATED。

#### expire — 配租到期

无额外参数（系统触发）。校验生效且已到期，到期后状态变为 EXPIRED。

#### list — 列表

接受 `QuerySpec`。需要 `require_prh_admin` 权限。

#### detail — 详情

接受 `QuerySpec`。需要 `require_prh_admin` 权限。

---

### RentalSubsidy（租赁补贴）

补贴生命周期：草稿（DRAFT）→ 生效（ACTIVE）→ 暂停（SUSPENDED）→ 终止（TERMINATED）/ 到期（EXPIRED）

#### add — 新增补贴

| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| household | string（Household id） | 是 | 所属家庭（必须为候选状态） |
| monthlyAmount | number | 是 | 月补贴金额（必须大于0） |
| startDate | string（ISO DateTime） | 是 | 补贴开始日期 |
| endDate | string | 否 | 补贴结束日期 |
| bankAccount | string | 否 | 收款账户 |
| bankName | string | 否 | 开户行 |

需要 `require_prh_admin` 权限。创建后状态为 DRAFT。

#### modify — 修改补贴信息

仅草稿状态可修改。

#### submit — 提交生效

无额外参数。仅草稿状态可提交，提交后状态变为 ACTIVE。

#### unsubmit — 撤回补贴

无额外参数。状态退回 DRAFT。

#### suspend — 暂停补贴

无额外参数。需要 `require_prh_admin` 权限。仅生效状态可暂停，暂停后状态变为 SUSPENDED。

#### resume — 恢复补贴

无额外参数。需要 `require_prh_admin` 权限。仅暂停状态可恢复，恢复后状态变为 ACTIVE。

#### terminate — 终止补贴

无额外参数。需要 `require_prh_admin` 权限。生效或暂停状态均可终止，终止后状态变为 TERMINATED。

#### expire — 补贴到期

无额外参数（系统触发）。生效或暂停状态且已到期，到期后状态变为 EXPIRED。

#### list — 列表

接受 `QuerySpec`。需要 `require_prh_admin` 权限。

#### detail — 详情

接受 `QuerySpec`。需要 `require_prh_admin` 权限。

---

### Attendance（考勤打卡）

#### checkin — 打卡

| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| attendanceType | AttendanceType | 是 | 出勤类型 |
| face | Attachment | 否 | 人脸识别照片（含 name/url/mimeType） |
| environment | Attachment | 否 | 环境视频 |
| location | GeoPoint | 否 | 地理坐标（longitude/latitude） |
| deviceId | string | 否 | 设备标识 |
| ipAddress | string | 否 | 打卡 IP |
| browser | string | 否 | 客户端 UA |

`resident` 和 `mode` 由系统自动注入，不可手动传入。执行前校验居民状态并进行人脸比对，首次打卡可激活未认证居民。

#### list — 列表

接受 `QuerySpec`。需要 `require_prh_admin` 权限。

#### detail — 详情

接受 `QuerySpec`。需要 `require_prh_admin` 权限。

---

### Leave（请假）

请假生命周期：草稿（DRAFT）→ 已提交（SUBMITTED）→ 已取消（CANCELLED）

#### add — 新增请假

| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| leaveType | LeaveType | 是 | 请假类型 |
| startDate | string（ISO DateTime） | 是 | 开始日期 |
| endDate | string（ISO DateTime） | 是 | 结束日期 |
| reason | string | 否 | 请假原因 |

`resident` 由系统自动注入。创建后状态为 DRAFT。

#### modify — 修改请假

仅草稿状态可修改 leaveType、startDate、endDate、reason。

#### submit — 提交请假

无额外参数。仅草稿状态可提交，提交后状态变为 SUBMITTED。

#### unsubmit — 撤回请假

无额外参数。校验可撤回，撤回后状态退回 DRAFT。

#### cancel — 取消请假

无额外参数。校验可取消，取消后状态变为 CANCELLED，并补生成打卡任务。

#### list — 列表

接受 `QuerySpec`。需要 `require_prh_admin` 权限。

#### detail — 详情

接受 `QuerySpec`。需要 `require_prh_admin` 权限。

---

### AttendanceMakeup（补卡申请）

补卡生命周期：草稿（DRAFT）→ 已提交（SUBMITTED）→ 审批通过（完成打卡）

#### add — 新增补卡申请

| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| targetAttendance | string（Attendance id） | 是 | 关联的打卡记录 |
| reason | string | 是 | 补卡原因 |

`resident` 由系统自动注入。创建后状态为 DRAFT。

#### modify — 修改补卡申请

仅草稿状态可修改 reason。

#### submit — 提交补卡申请

无额外参数。仅草稿状态可提交，提交后状态变为 SUBMITTED。

#### unsubmit — 撤回补卡申请

无额外参数。校验可撤回，撤回后状态退回 DRAFT。

#### approve — 审批通过

无额外参数。审批通过后将关联打卡记录标记为已完成。

#### list — 列表

接受 `QuerySpec`。需要 `require_prh_admin` 权限。

#### detail — 详情

接受 `QuerySpec`。需要 `require_prh_admin` 权限。

---

### 其他 class 动作简表

以下 class 均遵循标准 add/modify/submit/unsubmit/list/detail 模式，草稿状态可修改，提交后状态变为 SUBMITTED，撤回后退回 DRAFT。

| Class | 中文 | 必填参数（add） | 特殊说明 |
|-------|------|----------------|---------|
| Residence | 居住信息 | resident（系统注入）、addressType、address、isMonitoringTarget | 同类型居住记录不重复；另有 archive 动作归档生效记录 |
| Employment | 工作信息 | resident（系统注入）、unitName、addressType、isMonitoringTarget | 同类型工作记录不重复；另有 archive 动作 |
| PersonalIncome | 个人收入 | resident（系统注入）、incomeType、amount | 另有 archive 动作归档收入记录 |
| MigrantWork | 外出务工申请 | resident（系统注入）、residentAddress、startDate | 支持 add/modify/submit/unsubmit/list/detail |
| ResidenceChange | 居住地址变更申请 | resident（系统注入）、address | 支持 add/modify/submit/unsubmit/list/detail |
| EmploymentChange | 工作地址变更申请 | resident（系统注入）、company、companyAddress | 支持 add/modify/submit/unsubmit/list/detail |
| EligibilityTermination | 保障资格终止 | household、terminationType | 校验无进行中终止申请；支持 add/modify/submit/unsubmit/list/detail |
| HouseholdMemberChange | 家庭成员变更 | household、changeType | 支持 add/modify/submit/unsubmit/list/detail |
| AttendanceSolution | 考勤方案 | code、name、calendar | 支持 add/modify/enable/stop/list/detail |
| AttendanceMakeupAttachment | 补卡附件 | makeup（系统注入）、file | 仅支持 list/detail |

