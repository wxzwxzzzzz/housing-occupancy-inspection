# TypeScript 领域模型参考手册

> 由本体 XML 自动生成的 TypeScript 类型定义完整参考。
> 覆盖 7 个命名空间：oms / oql / arche / approval / basedoc / resource / prh。

## 目录

- [类型映射规则](#类型映射规则)
- [命名空间与导入路径](#命名空间与导入路径)
- [cn.byteawake.ap.oms — 基础平台](#cnbyteawakeapoms--基础平台)
- [cn.byteawake.ap.oql — 查询语言](#cnbyteawakeapoql--查询语言)
- [cn.byteawake.ap.arche — 启元](#cnbyteawakeaparche--启元)
- [cn.byteawake.ap.approval — 审批流程](#cnbyteawakeapapproval--审批流程)
- [cn.byteawake.ap.basedoc — 基础档案](#cnbyteawakeapbasedoc--基础档案)
- [cn.byteawake.ap.resource — 资源排班](#cnbyteawakeapresource--资源排班)
- [cn.byteawake.prh — 公租房保障监管](#cnbyteawakeprh--公租房保障监管)

---

## 类型映射规则

| XML 类型 | TypeScript 类型 | 说明 |
|---|---|---|
| `String` | `string` | — |
| `Text` | `string` | 长文本 |
| `DateTime` | `string` | ISO 8601 格式 |
| `Timestamp` | `string` | ISO 8601 格式 |
| `Boolean` | `boolean` | — |
| `Integer` | `number` | — |
| `Long` | `number` | — |
| `Short` | `number` | — |
| `Decimal(p,s)` | `number` | — |
| `Any` | `unknown` | 动态类型 |
| enum 引用 | 枚举值联合类型 | 如 `'MALE' \| 'FEMALE'` |
| class 引用 | 引用类型 | 如 `User`、`Fence` |
| `isRequired="true"` | 必填属性 | 无 `?` 后缀 |
| `isCollection="true"` | 数组 | 如 `unknown[]` |

## 命名空间与导入路径

| XML 命名空间 | TS 目录 | 导入示例 |
|---|---|---|
| `cn.byteawake.ap.oms` | `ap/oms/` | `import type { OntologyObject } from '../../ap/oms'` |
| `cn.byteawake.ap.oql` | `ap/oql/` | `import type { QuerySpec } from '../oql'` |
| `cn.byteawake.ap.arche` | `ap/arche/` | `import type { User } from '../../ap/arche'` |
| `cn.byteawake.ap.approval` | `ap/approval/` | `import type { ISubmitInfo } from '../../ap/approval'` |
| `cn.byteawake.ap.basedoc` | `ap/basedoc/` | `import type { AdministrativeRegion } from '../../ap/basedoc'` |
| `cn.byteawake.ap.resource` | `ap/resource/` | `import type { Calendar } from '../../ap/resource'` |
| `cn.byteawake.prh` | `prh/` | `import type { Resident } from '../entities/resident'` |

---

## cn.byteawake.ap.oms — 基础平台

> serviceDomain: `byteawake-ap-oms`
> 被所有其他本体 import，提供基础类型、接口、公共函数和动作类型定义。

### 类型定义 (typedef)

| 名称 | 标题 | 基础类型 | 约束 |
|---|---|---|---|
| `Phone` | 手机号 | `String` | length=20, pattern=`^1[3-9][0-9]{9}$` |
| `Email` | 邮箱 | `String` | length=100, pattern=`^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$` |

### 枚举 (enum)

#### ImportMode — 导入模式

| 成员 | code | 标题 |
|---|---|---|
| `UPSERT` | 10 | 新增或更新 |
| `INSERT_ONLY` | 20 | 仅新增 |
| `UPDATE_ONLY` | 30 | 仅更新 |
| `VALIDATE_ONLY` | 40 | 仅校验 |

#### FenceType — 围栏类型

| 成员 | code | 标题 |
|---|---|---|
| `CIRCLE` | 10 | 圆形 |
| `POLYGON` | 20 | 多边形 |

#### OntologyLevelKind — 级别类别

| 成员 | code | 标题 |
|---|---|---|
| `INFO` | 10 | 提示 |
| `WARN` | 20 | 警告 |
| `ERROR` | 30 | 错误 |
| `FATAL` | 40 | 严重错误 |

#### TimeGrainKind — 时间粒度

| 成员 | code | 标题 |
|---|---|---|
| `DAY` | 10 | 日 |
| `WEEK` | 20 | 周 |
| `MONTH` | 30 | 月 |
| `QUARTER` | 40 | 季 |
| `YEAR` | 50 | 年 |

#### AdditivityKind — 可加性

| 成员 | code | 标题 |
|---|---|---|
| `ADDITIVE` | 10 | 完全可加 |
| `SEMI_ADDITIVE` | 20 | 半可加 |
| `NON_ADDITIVE` | 30 | 不可加 |

#### DataSetKind — 数据集类别

| 成员 | code | 标题 |
|---|---|---|
| `ONTOLOGY_OBJECT` | 10 | 本体对象 |
| `PHYSICAL_TABLE` | 20 | 物理表 |

#### EnumMemberAliasKind — 枚举项别名类别

| 成员 | code | 标题 |
|---|---|---|
| `LEGACY` | 10 | 历史别名 |
| `INPUT` | 20 | 输入别名 |
| `EXTERNAL` | 30 | 外部别名 |
| `SYMBOL` | 40 | 符号别名 |

### 结构体 (struct)

#### GeoPoint — 地理坐标

| 属性 | 标题 | TS 类型 | 必填 |
|---|---|---|---|
| `longitude` | 经度 | `number` | — |
| `latitude` | 纬度 | `number` | — |

#### Attachment — 附件

| 属性 | 标题 | TS 类型 | 必填 |
|---|---|---|---|
| `name` | 文件名 | `string` | — |
| `url` | URL | `string` | — |
| `mimeType` | MIME类型 | `string` | — |

### 类 (class)

#### OntologyObject — 本体对象 (抽象, 非持久化)

所有实体的根类型。

| 属性 | 标题 | TS 类型 | 必填 | 说明 |
|---|---|---|---|---|
| `id` | 标识 | `string` | — | 主键, length=32 |
| `pubts` | 时间戳 | `string` | — | — |

#### OntologyResult — 操作结果 (非持久化)

| 属性 | 标题 | TS 类型 | 必填 |
|---|---|---|---|
| `success` | 是否成功 | `boolean` | ✓ |
| `code` | 结果编码 | `string` | ✓ |
| `message` | 结果消息 | `string` | — |
| `detailMsg` | 详细消息 | `string` | — |
| `level` | 结果级别 | `OntologyLevelKind` | — |
| `traceId` | 追踪标识 | `string` | — |

链接：`data` → `OntologyObject[]`，`fieldErrors` → `FieldError[]`

#### NavigationSpec — 导航声明 (非持久化)

继承自 `QuerySpec`。

| 属性 | 标题 | TS 类型 | 必填 |
|---|---|---|---|
| `currentId` | 当前对象标识 | `string` | — |

#### ImportRequest — 导入请求 (非持久化)

| 属性 | 标题 | TS 类型 | 必填 |
|---|---|---|---|
| `fileToken` | 文件令牌 | `string` | ✓ |
| `mode` | 导入模式 | `ImportMode` | ✓ |
| `templateCode` | 模板编码 | `string` | — |

#### FieldError — 字段错误 (非持久化)

| 属性 | 标题 | TS 类型 | 必填 |
|---|---|---|---|
| `path` | 字段路径 | `string` | ✓ |
| `message` | 错误消息 | `string` | ✓ |
| `level` | 错误级别 | `OntologyLevelKind` | — |

#### Fence — 电子围栏

dataSet: `oms_fence`，实现 `ILogicDelete`、`ITenant`、`IAuditInfo`。

| 属性 | 标题 | TS 类型 | 必填 |
|---|---|---|---|
| `fenceType` | 围栏类型 | `FenceType` | ✓ |
| `center` | 中心坐标 | `GeoPoint` | — |
| `radius` | 半径 | `number` | — |

链接：`vertices` → `FenceVertex[]`

#### FenceVertex — 围栏顶点

dataSet: `oms_fence_vertex`，实现 `ITenant`、`IAuditInfo`。

| 属性 | 标题 | TS 类型 | 必填 |
|---|---|---|---|
| `fence` | 所属围栏 | `Fence` | ✓ |
| `ordinal` | 顶点序号 | `number` | ✓ |
| `point` | 顶点坐标 | `GeoPoint` | ✓ |

### 接口 (interface)

接口不独立持久化，由 class 通过 `<implements>` 混入。

#### ILogicDelete — 逻辑删除

| 属性 | 标题 | TS 类型 | 默认值 |
|---|---|---|---|
| `dr` | 逻辑删除标记 | `boolean` | `false` |

#### ITenant — 租户

| 属性 | 标题 | TS 类型 | 必填 |
|---|---|---|---|
| `tenant` | 租户 | `string` | ✓ |

#### ITree — 树型结构

| 属性 | 标题 | TS 类型 | 默认值 |
|---|---|---|---|
| `name` | 名称 | `string` | — |
| `parent` | 上级 | `string` | — |
| `level` | 层级 | `number` | — |
| `path` | 路径 | `string` | — |
| `ordinal` | 序号 | `number` | — |
| `isEnd` | 是否末级 | `boolean` | `true` |

#### IAuditInfo — 审计信息

| 属性 | 标题 | TS 类型 |
|---|---|---|
| `creator` | 创建人 | `string` |
| `createAt` | 创建时间 | `string` |
| `modifier` | 修改人 | `string` |
| `modifyAt` | 修改时间 | `string` |

#### IEnable — 启用

| 属性 | 标题 | TS 类型 | 默认值 |
|---|---|---|---|
| `enable` | 启用 | `boolean` | `false` |
| `enableAt` | 启用时间 | `string` | — |
| `disableAt` | 停用时间 | `string` | — |

#### ITimeline — 时间轴

| 属性 | 标题 | TS 类型 |
|---|---|---|
| `startTime` | 生效时间 | `string` |
| `endTime` | 失效时间 | `string` |

#### ISysPreset — 系统预置

| 属性 | 标题 | TS 类型 | 默认值 |
|---|---|---|---|
| `isSys` | 是否系统预置 | `boolean` | `false` |
| `sysId` | 系统标识 | `string` | — |

### 动作类型 (actionKinds)

OMS 平台预定义的全部动作类型：

| 名称 | 标题 | 类别 |
|---|---|---|
| `add` | 新增 | CRUD |
| `modify` | 修改 | CRUD |
| `delete` | 删除 | CRUD |
| `copy` | 复制 | CRUD |
| `detail` | 详情 | 查询 |
| `list` | 列表 | 查询 |
| `listdetail` | 列表详情 | 查询 |
| `query` | 查询 | 查询 |
| `querytree` | 树查询 | 查询 |
| `audit` | 审核 | 审批 |
| `unaudit` | 弃审 | 审批 |
| `submit` | 提交 | 流程 |
| `unsubmit` | 取消提交 | 流程 |
| `stop` | 停用 | 生命周期 |
| `enable` | 启用 | 生命周期 |
| `refer` | 参照 | 参考 |
| `referrefresh` | 参照刷新 | 参考 |
| `invalid` | 作废 | 流程 |
| `close` | 关闭 | 流程 |
| `open` | 打开 | 流程 |
| `check` | 校验 | 验证 |
| `signup` | 注册 | 认证 |
| `authenticate` | 认证 | 认证 |
| `verify` | 验证 | 认证 |
| `recover` | 恢复 | 认证 |
| `logout` | 登出 | 认证 |
| `archive` | 归档 | 生命周期 |
| `invite` | 邀请 | 协作 |
| `checkin` | 打卡 | 业务 |
| `terminate` | 终止 | 生命周期 |
| `expire` | 到期 | 生命周期 |
| `suspend` | 暂停 | 生命周期 |
| `resume` | 恢复 | 生命周期 |

---

## cn.byteawake.ap.oql — 查询语言

> serviceDomain: `byteawake-ap-oql`
> 定义通用查询元数据，被 oms import 后服务所有本体查询场景。

### 枚举

#### QueryLogicalOperator — 逻辑操作符

| 成员 | code | 标题 |
|---|---|---|
| `AND` | 10 | 且 |
| `OR` | 20 | 或 |

#### QueryComparisonOperator — 比较操作符

| 成员 | code | 标题 |
|---|---|---|
| `EQ` | 10 | 等于 |
| `NE` | 20 | 不等于 |
| `GT` | 30 | 大于 |
| `GE` | 40 | 大于等于 |
| `LT` | 50 | 小于 |
| `LE` | 60 | 小于等于 |
| `LIKE` | 70 | 包含 |
| `IN` | 80 | 包含于 |
| `BETWEEN` | 90 | 区间 |
| `IS_NULL` | 100 | 为空 |
| `NOT_NULL` | 110 | 不为空 |

#### QuerySortDirection — 排序方向

| 成员 | code | 标题 |
|---|---|---|
| `ASC` | 10 | 升序 |
| `DESC` | 20 | 降序 |

#### TreeQueryScope — 树查询范围

| 成员 | code | 标题 |
|---|---|---|
| `ROOT_CHILDREN` | 10 | 根节点子级 |
| `SUBTREE` | 20 | 子树 |
| `ANCESTORS` | 30 | 祖先路径 |

### 类 (非持久化)

#### QueryFilterCondition — 查询条件项

| 属性 | 标题 | TS 类型 | 必填 |
|---|---|---|---|
| `field` | 查询路径 | `string` | ✓ |
| `operator` | 比较操作符 | `QueryComparisonOperator` | ✓ |
| `value1` | 条件值1 | `string` | — |
| `value2` | 条件值2 | `string` | — |
| `values` | 条件值列表 | `unknown[]` | — |

#### QueryFilterGroup — 查询条件组

| 属性 | 标题 | TS 类型 | 必填 |
|---|---|---|---|
| `operator` | 逻辑操作符 | `QueryLogicalOperator` | ✓ |

链接：`conditions` → `QueryFilterCondition[]`，`groups` → `QueryFilterGroup[]`（递归嵌套）

#### QuerySortItem — 查询排序项

| 属性 | 标题 | TS 类型 | 必填 |
|---|---|---|---|
| `path` | 查询路径 | `string` | ✓ |
| `direction` | 排序方向 | `QuerySortDirection` | ✓ |

#### QueryPage — 查询分页

| 属性 | 标题 | TS 类型 |
|---|---|---|
| `pageNo` | 页码 | `number` |
| `pageSize` | 页大小 | `number` |
| `first` | 向前条数 | `number` |
| `after` | 起始游标 | `string` |
| `last` | 向后条数 | `number` |
| `before` | 结束游标 | `string` |

#### QuerySpec — 查询声明

| 属性 | 标题 | TS 类型 | 必填 |
|---|---|---|---|
| `objectType` | 目标本体 | `string` | ✓ |
| `selection` | 查询字段 | `string` | — |
| `filter` | 过滤条件 | `QueryFilterGroup` | — |
| `metrics` | 聚合指标 | `string` | — |
| `dimensions` | 分组维度 | `string` | — |
| `having` | 聚合后过滤 | `QueryFilterGroup` | — |

链接：`sortItems` → `QuerySortItem[]`，`page` → `QueryPage`（0..1），`treeOptions` → `TreeQueryOptions`（0..1）

#### ActionSpec — 动作声明

| 属性 | 标题 | TS 类型 | 必填 |
|---|---|---|---|
| `objectType` | 目标本体 | `string` | ✓ |
| `actionName` | 动作名称 | `string` | ✓ |

链接：`payload` → `OntologyObject`（0..1）

#### TreeQueryOptions — 树查询选项

| 属性 | 标题 | TS 类型 | 默认值 |
|---|---|---|---|
| `rootId` | 根节点标识 | `string` | — |
| `parentId` | 父节点标识 | `string` | — |
| `maxDepth` | 最大层级 | `number` | — |
| `includeRoot` | 是否包含根节点 | `boolean` | `false` |
| `recursive` | 是否递归 | `boolean` | `true` |
| `scope` | 查询范围 | `TreeQueryScope` | — |

---

## cn.byteawake.ap.arche — 启元

> serviceDomain: `byteawake-ap-arche`
> 统一账户、企业、租户管理平台。import oms。

### 枚举

#### UserStatus — 用户状态

| 成员 | code | 标题 | 默认 |
|---|---|---|---|
| `ACTIVE` | 0 | 正常 | — |
| `DISABLED` | 1 | 停用 | — |
| `INACTIVE` | 2 | 未激活 | ✓ |
| `CANCELLED` | 3 | 注销 | — |

#### UserType — 用户类型

| 成员 | code | 标题 |
|---|---|---|
| `SYSTEM` | 0 | 系统用户 |
| `ROOT` | 1 | 根用户 |
| `ENTERPRISE_ADMIN` | 2 | 企业管理员 |
| `ISV` | 3 | ISV用户 |
| `NORMAL` | 4 | 普通用户 |

#### EnterpriseState — 企业状态

| 成员 | code | 标题 | 默认 |
|---|---|---|---|
| `REGISTERED` | 0 | 已注册 | ✓ |
| `AUTHENTICATED` | 1 | 已认证 | — |
| `REJECTED` | 2 | 已拒绝 | — |

#### TenantStatus — 租户状态

| 成员 | code | 标题 | 默认 |
|---|---|---|---|
| `ACTIVE` | 0 | 正常 | — |
| `STOPPED` | 1 | 停用 | ✓ |
| `EXPIRED` | 2 | 已过期 | — |

#### EmailChangeStatus — 邮箱变更状态

| 成员 | code | 标题 | 默认 |
|---|---|---|---|
| `NONE` | 0 | 无变更 | ✓ |
| `PENDING` | 1 | 待确认 | — |
| `CONFIRMED` | 2 | 已确认 | — |

#### MemberRole — 成员角色

| 成员 | code | 标题 | 默认 |
|---|---|---|---|
| `ADMIN` | 0 | 租户管理员 | — |
| `NORMAL` | 1 | 普通成员 | ✓ |

#### MemberKind — 成员主体类型

| 成员 | code | 标题 | 默认 |
|---|---|---|---|
| `HUMAN` | 0 | 真人成员 | ✓ |
| `ROBOT` | 1 | 机器人成员 | — |
| `DIGITAL_EMPLOYEE` | 2 | 数字员工 | — |

#### MemberStatus — 成员状态

| 成员 | code | 标题 | 默认 |
|---|---|---|---|
| `ACTIVE` | 0 | 正常 | ✓ |
| `DISABLED` | 1 | 停用 | — |

#### AALevel — 认证保证级别

| 成员 | code | 标题 | 默认 |
|---|---|---|---|
| `AAL1` | 0 | 单因素认证 | ✓ |
| `AAL2` | 1 | 双因素认证 | — |
| `AAL3` | 2 | 硬件因素认证 | — |

#### FactorType — MFA因子类型

| 成员 | code | 标题 | 默认 |
|---|---|---|---|
| `TOTP` | 0 | 时间一次性密码 | ✓ |
| `PHONE` | 1 | 手机短信 | — |
| `WEBAUTHN` | 2 | WebAuthn公钥认证 | — |

#### FactorStatus — MFA因子状态

| 成员 | code | 标题 | 默认 |
|---|---|---|---|
| `UNVERIFIED` | 0 | 未验证 | ✓ |
| `VERIFIED` | 1 | 已验证 | — |

#### AuthenticationMethod — 认证方法

| 成员 | code | 标题 |
|---|---|---|
| `PASSWORD` | 0 | 密码认证 |
| `OTP` | 1 | 一次性密码 |
| `TOTP` | 2 | 时间一次性密码 |
| `OAUTH` | 3 | OAuth/OIDC |
| `WEBAUTHN` | 4 | WebAuthn/Passkey |
| `SSO` | 5 | 企业SSO |
| `RECOVERY` | 6 | 恢复码 |
| `MAGIC_LINK` | 7 | Magic Link |
| `WEB3` | 8 | Web3钱包签名 |
| `ANONYMOUS` | 10 | 匿名登录 |
| `CUSTOM` | 99 | 自定义 |

#### OneTimeTokenType — 一次性令牌类型

| 成员 | code | 标题 |
|---|---|---|
| `CONFIRMATION` | 0 | 注册确认 |
| `RECOVERY` | 1 | 密码恢复 |
| `EMAIL_CHANGE_NEW` | 2 | 邮箱变更新邮箱 |
| `EMAIL_CHANGE_CURRENT` | 3 | 邮箱变更当前邮箱 |
| `PHONE_CHANGE` | 4 | 手机变更 |
| `REAUTHENTICATION` | 5 | 重新认证 |
| `MAGIC_LINK` | 6 | Magic Link登录 |
| `INVITATION` | 7 | 邀请注册 |
| `SMS_VERIFICATION` | 8 | 短信验证 |
| `EMAIL_VERIFICATION` | 9 | 邮箱验证 |

#### CredentialStatus — 凭据状态

| 成员 | code | 标题 | 默认 |
|---|---|---|---|
| `ACTIVE` | 0 | 有效 | ✓ |
| `REVOKED` | 1 | 已吊销 | — |
| `EXPIRED` | 2 | 已过期 | — |

#### SubscriptionStatus — 订阅状态

| 成员 | code | 标题 | 默认 |
|---|---|---|---|
| `ACTIVE` | 0 | 已开通 | ✓ |
| `STOPPED` | 1 | 已停用 | — |
| `EXPIRED` | 2 | 已过期 | — |

#### ProductActivationStatus — 产品激活状态

| 成员 | code | 标题 | 默认 |
|---|---|---|---|
| `PENDING` | 0 | 待激活 | ✓ |
| `ACTIVATING` | 1 | 激活中 | — |
| `ACTIVE` | 2 | 已激活 | — |
| `FAILED` | 3 | 激活失败 | — |
| `EXPIRED` | 4 | 已过期 | — |

### 类

#### User — 用户

实现 `IAuditInfo`。

| 属性 | 标题 | TS 类型 | 必填 |
|---|---|---|---|
| `account` | 登录账号 | `string` | ✓ |
| `realName` | 真实姓名 | `string` | — |
| `nickname` | 昵称 | `string` | — |
| `phone` | 手机号 | `string` | — |
| `email` | 邮箱 | `string` | — |
| `avatar` | 头像 | `string` | — |
| `status` | 状态 | `UserStatus` | ✓ |
| `userType` | 用户类型 | `UserType` | ✓ |
| `activateAt` | 激活时间 | `string` | — |
| `disableAt` | 停用时间 | `string` | — |
| `deleteAt` | 注销时间 | `string` | — |
| `failedLoginAttempts` | 连续登录失败次数 | `number` | — |
| `lockedUntil` | 锁定截止时间 | `string` | — |
| `isAnonymous` | 是否匿名用户 | `boolean` | ✓ |
| `isSSOUser` | 是否SSO用户 | `boolean` | ✓ |
| `emailConfirmedAt` | 邮箱确认时间 | `string` | — |
| `phoneConfirmedAt` | 手机确认时间 | `string` | — |
| `lastSignInAt` | 最后登录时间 | `string` | — |
| `bannedUntil` | 封禁截止时间 | `string` | — |
| `confirmedAt` | 确认时间 | `string` | — |
| `rawAppMetaData` | 应用元数据 | `string` | — |
| `rawUserMetaData` | 用户元数据 | `string` | — |
| `emailChangeStatus` | 邮箱变更状态 | `EmailChangeStatus` | ✓ |
| `emailChangeTarget` | 邮箱变更目标 | `string` | — |
| `invitedAt` | 邀请时间 | `string` | — |

**动作**：signup / authenticate / signInAnonymously / recover / sendOTP / sendMagicLink / resendConfirmation / reauthenticate / enableUser / disable / deleteUser / unlockUser / changeProfile / changePhone / bindEmail / changeEmail / confirmEmailChange

#### Enterprise — 企业

| 属性 | 标题 | TS 类型 | 必填 |
|---|---|---|---|
| `name` | 企业名称 | `string` | — |
| `integrationCode` | 统一社会信用代码 | `string` | — |
| `legalPerson` | 法人代表 | `string` | — |
| `state` | 认证状态 | `EnterpriseState` | — |

#### Tenant — 租户

| 属性 | 标题 | TS 类型 | 必填 |
|---|---|---|---|
| `name` | 租户名称 | `string` | — |
| `status` | 运营状态 | `TenantStatus` | — |

---

## cn.byteawake.ap.approval — 审批流程

> serviceDomain: `byteawake-ap-approval`
> import oql、arche。定义审批公共接口和枚举。

### 枚举

#### VerifyState — 审批流状态

| 成员 | code | 标题 |
|---|---|---|
| `PENDING` | 10 | 待审批 |
| `APPROVED` | 20 | 已通过 |
| `REJECTED` | 30 | 已驳回 |
| `RETURNED` | 40 | 已退回 |
| `CANCELLED` | 50 | 已取消 |

#### ApprovalResult — 审批结果

| 成员 | code | 标题 |
|---|---|---|
| `APPROVED` | 10 | 通过 |
| `REJECTED` | 20 | 驳回 |
| `RETURNED` | 30 | 退回 |

### 接口

#### ISubmitInfo — 提交信息

| 属性 | 标题 | TS 类型 | field |
|---|---|---|---|
| `submittedAt` | 提交时间 | `string` | submitted_at |
| `submittedBy` | 提交人 | `User` | submitted_by_id |
| `withdrawnAt` | 撤回时间 | `string` | withdrawn_at |
| `withdrawnBy` | 撤回人 | `User` | withdrawn_by_id |

#### IApprovalInfo — 审批信息

| 属性 | 标题 | TS 类型 | field |
|---|---|---|---|
| `approver` | 审批人 | `User` | approver_id |
| `approvalTime` | 审批时间 | `string` | approval_time |
| `approvalOpinion` | 审批意见 | `string` | approval_opinion |
| `approvalResult` | 审批结果 | `ApprovalResult` | approval_result |

#### IApprovalFlow — 审批流信息

| 属性 | 标题 | TS 类型 | field | 默认值 |
|---|---|---|---|---|
| `approvalFlowEnabled` | 是否启用审批流 | `boolean` | approval_flow_enabled | `false` |
| `verifyState` | 审批流状态 | `number` | verify_state | — |
| `returnCount` | 退回次数 | `number` | return_count | — |
| `processInstance` | 流程实例 | `string` | process_instance_id | — |
| `approvalStep` | 审批环节 | `string` | approval_step | — |
| `pendingApprover` | 待审批人 | `User` | pending_approver_id | — |
| `task` | 任务 | `string` | task_id | — |

---

## cn.byteawake.ap.basedoc — 基础档案

> serviceDomain: `byteawake-ap-basedoc`
> import oms。提供行政区划等基础档案。

### 枚举

#### RegionType — 行政区划类型

按国标五级行政区域编码（code 前缀编码层级）：

| 成员 | code | 标题 | 层级 |
|---|---|---|---|
| `PROVINCE` | 11 | 省 | 省级 |
| `AUTONOMOUS_REGION` | 12 | 自治区 | 省级 |
| `MUNICIPALITY` | 13 | 直辖市 | 省级 |
| `SAR` | 14 | 特别行政区 | 省级 |
| `PREFECTURE_CITY` | 21 | 地级市 | 地级 |
| `PREFECTURE` | 22 | 地区 | 地级 |
| `AUTONOMOUS_PREFECTURE` | 23 | 自治州 | 地级 |
| `LEAGUE` | 24 | 盟 | 地级 |
| `DISTRICT` | 31 | 市辖区 | 县级 |
| `COUNTY` | 32 | 县 | 县级 |
| `COUNTY_CITY` | 33 | 县级市 | 县级 |
| `AUTONOMOUS_COUNTY` | 34 | 自治县 | 县级 |
| `BANNER` | 35 | 旗 | 县级 |
| `AUTONOMOUS_BANNER` | 36 | 自治旗 | 县级 |
| `SPECIAL_DISTRICT` | 37 | 特区 | 县级 |
| `FORESTRY_AREA` | 38 | 林区 | 县级 |
| `SUBDISTRICT` | 41 | 街道 | 乡级 |
| `TOWN` | 42 | 镇 | 乡级 |
| `TOWNSHIP` | 43 | 乡 | 乡级 |
| `ETHNIC_TOWNSHIP` | 44 | 民族乡 | 乡级 |
| `SUM` | 45 | 苏木 | 乡级 |
| `ETHNIC_SUM` | 46 | 民族苏木 | 乡级 |
| `NEIGHBORHOOD_COMMITTEE` | 51 | 居委会 | 村级 |
| `VILLAGE_COMMITTEE` | 52 | 村委会 | 村级 |
| `SIMILAR_VILLAGE_UNIT` | 53 | 类似村级单位 | 村级 |

### 类

#### AdministrativeRegion — 行政区划

dataSet: `ap_basedoc_admin_region`，实现 `ITree`、`ITenant`、`IAuditInfo`、`IEnable`、`ISysPreset`、`ILogicDelete`、`ITimeline`。

| 属性 | 标题 | TS 类型 | 必填 |
|---|---|---|---|
| `code` | 编码 | `string` | ✓ |
| `nationalCode` | 国标码 | `string` | ✓ |
| `countryCode` | 国家码 | `string` | ✓ |
| `regionType` | 区划类型 | `RegionType` | ✓ |
| `shortName` | 简称 | `string` | — |
| `pinyin` | 拼音 | `string` | — |
| `pinyinShort` | 拼音缩写 | `string` | — |
| `longitude` | 中心点经度 | `number` | — |
| `latitude` | 中心点纬度 | `number` | — |

**动作**：add / modify / delete / list / detail / querytree / import / enable / stop / refer

---

## cn.byteawake.ap.resource — 资源排班

> serviceDomain: `byteawake-ap-resource`
> import oms。对齐 Odoo Resource 模型。

### 枚举

#### ResourceType — 资源类型

| 成员 | code | 标题 |
|---|---|---|
| `HUMAN` | 1 | 人员 |
| `MATERIAL` | 2 | 物料 |

#### Weekday — 星期

| 成员 | code | 标题 |
|---|---|---|
| `MONDAY` | 1 | 周一 |
| `TUESDAY` | 2 | 周二 |
| `WEDNESDAY` | 3 | 周三 |
| `THURSDAY` | 4 | 周四 |
| `FRIDAY` | 5 | 周五 |
| `SATURDAY` | 6 | 周六 |
| `SUNDAY` | 7 | 周日 |

#### DayPeriod — 日内时段

| 成员 | code | 标题 |
|---|---|---|
| `MORNING` | 1 | 上午 |
| `BREAK` | 2 | 休息 |
| `AFTERNOON` | 3 | 下午 |
| `FULL_DAY` | 4 | 全天 |

#### WeekType — 双周类型

| 成员 | code | 标题 |
|---|---|---|
| `FIRST` | 0 | 第一周 |
| `SECOND` | 1 | 第二周 |

#### LeaveEffect — 休班效果

| 成员 | code | 标题 |
|---|---|---|
| `TIME_OFF` | 0 | 休班 |
| `MAKE_UP_WORKDAY` | 1 | 补班工作日 |

#### TimeType — 时间类型

| 成员 | code | 标题 |
|---|---|---|
| `LEAVE` | 1 | 缺勤 |
| `OTHER` | 2 | 其他工作安排 |

#### ScheduleType — 调度类型

| 成员 | code | 标题 |
|---|---|---|
| `FIXED` | 1 | 固定 |
| `FLEXIBLE` | 2 | 弹性 |

### 类

#### Resource — 资源

dataSet: `ap_resource_resource`，实现 `ITenant`、`IAuditInfo`、`IEnable`、`ILogicDelete`。

| 属性 | 标题 | TS 类型 | 必填 |
|---|---|---|---|
| `code` | 编码 | `string` | ✓ |
| `name` | 名称 | `string` | ✓ |
| `resourceType` | 资源类型 | `ResourceType` | ✓ |
| `calendar` | 默认日历 | `Calendar` | — |
| `timezone` | 时区 | `string` | — |
| `efficiencyFactor` | 效率因子 | `number` | — |

**动作**：add / modify / delete / list / detail / enable / stop / refer

#### Calendar — 资源日历

dataSet: `ap_resource_calendar`，实现 `ITenant`、`IAuditInfo`、`IEnable`、`ILogicDelete`。

| 属性 | 标题 | TS 类型 | 必填 |
|---|---|---|---|
| `code` | 编码 | `string` | ✓ |
| `name` | 名称 | `string` | ✓ |
| `timezone` | 时区 | `string` | — |
| `hoursPerDay` | 每日小时数 | `number` | — |
| `hoursPerWeek` | 每周小时数 | `number` | — |
| `scheduleType` | 调度类型 | `ScheduleType` | ✓ |
| `twoWeeksCalendar` | 双周日历 | `boolean` | — |
| `description` | 描述 | `string` | — |

**动作**：add / modify / delete / list / detail / enable / stop / refer

#### CalendarAttendance — 工作时段

dataSet: `ap_resource_calendar_attendance`，实现 `ITenant`、`IAuditInfo`、`IEnable`、`ILogicDelete`。

| 属性 | 标题 | TS 类型 | 必填 |
|---|---|---|---|
| `calendar` | 所属日历 | `Calendar` | ✓ |
| `name` | 名称 | `string` | ✓ |
| `dayOfWeek` | 星期 | `Weekday` | ✓ |
| `hourFrom` | 开始小时 | `number` | ✓ |
| `hourTo` | 结束小时 | `number` | ✓ |
| `dayPeriod` | 日内时段 | `DayPeriod` | — |
| `weekType` | 双周类型 | `WeekType` | — |
| `ordinal` | 序号 | `number` | — |

**动作**：add / modify / delete / list / detail / enable / stop / refer

#### CalendarLeave — 日历休班

dataSet: `ap_resource_calendar_leave`，实现 `ITenant`、`IAuditInfo`、`IEnable`、`ILogicDelete`。

| 属性 | 标题 | TS 类型 | 必填 |
|---|---|---|---|
| `calendar` | 所属日历 | `Calendar` | — |
| `resource` | 所属资源 | `Resource` | — |
| `name` | 名称 | `string` | ✓ |
| `dateFrom` | 开始时间 | `string` | ✓ |
| `dateTo` | 结束时间 | `string` | ✓ |
| `effect` | 休班效果 | `LeaveEffect` | ✓ |
| `timeType` | 时间类型 | `TimeType` | — |
| `description` | 描述 | `string` | — |

**动作**：add / modify / delete / list / detail / enable / stop / refer

---

## cn.byteawake.prh — 公租房保障监管

> serviceDomain: `byteawake-prh`
> import arche、approval、basedoc、resource。保障居民全生命周期管理。

### 枚举

#### Gender — 性别

| 成员 | code | 标题 |
|---|---|---|
| `MALE` | 10 | 男 |
| `FEMALE` | 20 | 女 |

#### MaritalStatus — 婚姻状况

| 成员 | code | 标题 | 默认 |
|---|---|---|---|
| `UNMARRIED` | 10 | 未婚 | ✓ |
| `MARRIED` | 20 | 已婚 | — |
| `DIVORCED` | 30 | 离异 | — |
| `WIDOWED` | 40 | 丧偶 | — |

#### GuaranteeType — 保障类型

| 成员 | code | 标题 |
|---|---|---|
| `NEW_EMPLOYEE` | 10 | 新就业无房职工 |
| `MINIMUM_LIVING` | 20 | 城市低保家庭 |
| `EXTREME_POVERTY` | 30 | 特困家庭 |
| `LOW_INCOME` | 40 | 城市低收入家庭 |
| `MIDDLE_INCOME` | 50 | 城市中等收入家庭 |
| `EXTERNAL_WORKER` | 60 | 稳定就业外来务工家庭 |

#### ResidentStatus — 居民状态

| 成员 | code | 标题 | 默认 |
|---|---|---|---|
| `DRAFT` | 10 | 草稿 | ✓ |
| `UNVERIFIED` | 20 | 未认证 | — |
| `VERIFIED` | 30 | 已认证 | — |
| `ACTIVATED` | 40 | 已激活 | — |
| `ARCHIVED` | 50 | 已退出 | — |

#### HouseholdStatus — 保障家庭状态

| 成员 | code | 标题 | 默认 |
|---|---|---|---|
| `DRAFT` | 10 | 草稿 | ✓ |
| `ACTIVE` | 20 | 已激活 | — |
| `CANDIDATE` | 30 | 候选 | — |
| `ARCHIVED` | 40 | 已退出 | — |

#### RecordStatus — 记录状态

| 成员 | code | 标题 | 默认 |
|---|---|---|---|
| `RECORD_ACTIVE` | 10 | 生效 | ✓ |
| `RECORD_ARCHIVED` | 20 | 归档 | — |

#### ApplicationStatus — 申请状态

| 成员 | code | 标题 | 默认 |
|---|---|---|---|
| `DRAFT` | 10 | 草稿 | ✓ |
| `UNDER_APPROVAL` | 20 | 审批中 | — |
| `COMPLETED` | 30 | 已完成 | — |
| `CANCELLED` | 40 | 已取消 | — |

#### ApplicationType — 申请类型

| 成员 | code | 标题 | 默认 |
|---|---|---|---|
| `INITIAL` | 10 | 首次准入 | ✓ |
| `REACTIVATION` | 20 | 重新激活 | — |
| `ANNUAL_REVIEW` | 30 | 年度复审 | — |

#### AttendanceType — 出勤类型

| 成员 | code | 标题 |
|---|---|---|
| `RESIDENCE` | 10 | 居住出勤 |
| `EMPLOYMENT` | 20 | 工作出勤 |

#### AttendanceStatus — 考勤状态

| 成员 | code | 标题 | 默认 |
|---|---|---|---|
| `PENDING` | 10 | 待打卡 | ✓ |
| `VALID` | 20 | 有效 | — |
| `INVALID` | 30 | 无效 | — |
| `MISSED` | 40 | 缺勤 | — |
| `EXEMPTED` | 50 | 豁免 | — |

#### AttendanceMode — 打卡方式

| 成员 | code | 标题 |
|---|---|---|
| `MINI_PROGRAM` | 10 | 小程序 |
| `KIOSK` | 20 | 自助终端 |
| `MANUAL` | 30 | 管理员代录 |
| `MAKEUP` | 40 | 补卡 |

#### AttendancePeriod — 考核周期

| 成员 | code | 标题 |
|---|---|---|
| `WEEKLY` | 10 | 每周 |
| `BIWEEKLY` | 20 | 每两周 |
| `MONTHLY` | 30 | 每月 |

#### IncomeType — 收入类型

| 成员 | code | 标题 | 默认 |
|---|---|---|---|
| `SALARY` | 10 | 工资薪金 | ✓ |
| `BUSINESS` | 20 | 经营所得 | — |
| `PROPERTY` | 30 | 财产性收入 | — |
| `TRANSFER` | 40 | 转移性收入 | — |

#### AllocationStatus — 分配状态

| 成员 | code | 标题 | 默认 |
|---|---|---|---|
| `DRAFT` | 00 | 草稿 | — |
| `ALLOC_ACTIVE` | 10 | 生效 | ✓ |
| `ALLOC_TERMINATED` | 20 | 已终止 | — |
| `ALLOC_EXPIRED` | 30 | 已到期 | — |

#### SubsidyStatus — 补贴状态

| 成员 | code | 标题 | 默认 |
|---|---|---|---|
| `SUBSIDY_ACTIVE` | 10 | 生效 | ✓ |
| `SUBSIDY_SUSPENDED` | 20 | 暂停 | — |
| `SUBSIDY_TERMINATED` | 30 | 已终止 | — |
| `SUBSIDY_EXPIRED` | 40 | 已到期 | — |

#### TerminationReason — 退出原因

| 成员 | code | 标题 |
|---|---|---|
| `VOLUNTARY` | 10 | 主动放弃 |
| `INCOME_EXCEED` | 20 | 收入超标 |
| `VIOLATION` | 30 | 违规退出 |
| `DECEASED` | 40 | 居民死亡 |
| `QUALIFICATION_CANCELLED` | 50 | 资格取消 |
| `HOUSING_ACQUIRED` | 60 | 自购/继承住房 |
| `RENT_ARREARS` | 70 | 欠租 |
| `OTHER` | 90 | 其他 |

#### MemberChangeType — 成员变更类型

| 成员 | code | 标题 |
|---|---|---|
| `ADD_MEMBER` | 10 | 新增成员 |
| `REMOVE_MEMBER` | 20 | 移除成员 |

#### ResidenceType — 居住地址类型

| 成员 | code | 标题 | 默认 |
|---|---|---|---|
| `SUBSIDIZED_HOUSING` | 10 | 保障房 | — |
| `MARKET_RENTAL` | 20 | 市场租赁 | — |
| `SELF_OWNED` | 30 | 自有住房 | — |
| `MIGRANT_RENTAL` | 40 | 外出务工租赁 | — |
| `OTHER` | 90 | 其他 | ✓ |

#### EmploymentAddressType — 工作地址类型

| 成员 | code | 标题 | 默认 |
|---|---|---|---|
| `FIXED_WORKPLACE` | 10 | 固定工作场所 | — |
| `FLEXIBLE_EMPLOYMENT` | 20 | 灵活就业 | — |
| `MIGRANT_WORK` | 30 | 外出务工 | — |
| `OTHER` | 90 | 其他 | ✓ |

#### AlertLevel — 预警等级

| 成员 | code | 标题 |
|---|---|---|
| `ALERT_INFO` | 10 | 提示 |
| `ALERT_WARNING` | 20 | 预警 |
| `ALERT_RED` | 30 | 红色预警 |

#### AgeGroup — 年龄分层（语义模型）

| 成员 | code | 标题 | 默认 |
|---|---|---|---|
| `UNDER_30` | 10 | 30岁以下 | — |
| `AGE_30_44` | 20 | 30-44岁 | — |
| `AGE_45_59` | 30 | 45-59岁 | — |
| `AGE_60_PLUS` | 40 | 60岁及以上 | — |
| `UNKNOWN` | 90 | 未知 | ✓ |

#### HouseholdSizeBand — 家庭人口规模分层（语义模型）

| 成员 | code | 标题 | 默认 |
|---|---|---|---|
| `SINGLE_PERSON` | 10 | 1人户 | — |
| `TWO_PERSON` | 20 | 2人户 | — |
| `THREE_PERSON` | 30 | 3人户 | — |
| `FOUR_PLUS_PERSON` | 40 | 4人及以上户 | — |
| `UNKNOWN` | 90 | 未知 | ✓ |

#### AttendanceTimeliness — 考勤准时性（语义模型）

| 成员 | code | 标题 | 默认 |
|---|---|---|---|
| `ON_TIME` | 10 | 准时 | — |
| `LATE` | 20 | 迟到 | — |
| `MISSED` | 30 | 缺勤 | — |
| `EXEMPTED` | 40 | 豁免 | — |
| `PENDING` | 50 | 待打卡 | — |
| `UNKNOWN` | 90 | 未知 | ✓ |

### 结构体 (struct)

#### PrhAddress — 地址

| 属性 | 标题 | TS 类型 | 必填 |
|---|---|---|---|
| `region` | 行政区划 | `AdministrativeRegion` | ✓ |
| `detail` | 详细地址 | `string` | ✓ |
| `geoPoint` | 定位坐标 | `GeoPoint` | — |

### 类

#### Resident — 保障居民

dataSet: `prh_resident`，实现 `ILogicDelete`、`ITenant`、`IAuditInfo`。

| 属性 | 标题 | TS 类型 | 必填 |
|---|---|---|---|
| `fullName` | 姓名 | `string` | ✓ |
| `idCardNo` | 身份证号 | `string` | ✓ |
| `phone` | 手机号 | `string` | — |
| `email` | 邮箱 | `string` | — |
| `gender` | 性别 | `Gender` | — |
| `birthDate` | 出生日期 | `string` | — |
| `maritalStatus` | 婚姻状况 | `MaritalStatus` | — |
| `guaranteeType` | 保障类型 | `GuaranteeType` | — |
| `status` | 居民状态 | `ResidentStatus` | ✓ |
| `idCardFrontPhoto` | 身份证正面照片 | `string` | — |
| `idCardBackPhoto` | 身份证背面照片 | `string` | — |
| `facePhoto` | 人脸照片 | `string` | — |
| `householdBookPhoto` | 户口本照片 | `string` | — |
| `bankFlowPhoto` | 银行流水照片 | `string` | — |
| `marriageCertPhoto` | 婚姻证明照片 | `string` | — |
| `incomeCertPhoto` | 收入证明照片 | `string` | — |
| `socialSecurityPhoto` | 社保证明照片 | `string` | — |
| `user` | 关联系统用户 | `User` | — |
| `archiveReason` | 归档原因 | `TerminationReason` | — |
| `archiveDate` | 归档日期 | `string` | — |
| `archiveNote` | 归档备注 | `string` | — |

**动作**：add / modify / verify / submit / activate / archive / list / detail

#### Household — 保障家庭

dataSet: `prh_household`，实现 `ILogicDelete`、`ITenant`、`IAuditInfo`。

| 属性 | 标题 | TS 类型 | 必填 |
|---|---|---|---|
| `applicantName` | 申请人姓名 | `string` | ✓ |
| `guaranteeType` | 保障类型 | `GuaranteeType` | ✓ |
| `householdSize` | 家庭人口数 | `number` | ✓ |
| `status` | 家庭状态 | `HouseholdStatus` | ✓ |
| `activeApplicationId` | 当前申请单标识 | `string` | — |
| `applicant` | 主申请人 | `Resident` | ✓ |
| `archiveReason` | 归档原因 | `TerminationReason` | — |
| `archiveDate` | 归档日期 | `string` | — |
| `archiveNote` | 归档备注 | `string` | — |
| `waitlistNo` | 轮候序号 | `number` | — |

**动作**：add / modify / invite / submit / archive / list / detail

#### HouseholdMember — 家庭成员

dataSet: `prh_household_member`，实现 `ILogicDelete`、`ITenant`、`IAuditInfo`。

| 属性 | 标题 | TS 类型 | 必填 |
|---|---|---|---|
| `household` | 所属家庭 | `Household` | ✓ |
| `resident` | 关联居民 | `Resident` | — |
| `fullName` | 成员姓名 | `string` | ✓ |
| `idCardNo` | 身份证号 | `string` | ✓ |
| `relationship` | 与申请人关系 | `string` | — |
| `isIncluded` | 是否计入家庭人口 | `boolean` | ✓ |
| `joinAt` | 加入时间 | `string` | — |

#### Residence — 居住信息

dataSet: `prh_residence`，实现 `ILogicDelete`、`ITenant`、`IAuditInfo`。

| 属性 | 标题 | TS 类型 | 必填 |
|---|---|---|---|
| `resident` | 所属居民 | `Resident` | ✓ |
| `addressType` | 居住地址类型 | `ResidenceType` | ✓ |
| `address` | 居住地址 | `PrhAddress` | ✓ |
| `fence` | 电子围栏 | `Fence` | — |
| `livingPattern` | 居住规律 | `string` | — |
| `reminderStart` | 提醒开始时间 | `string` | — |
| `reminderEnd` | 提醒结束时间 | `string` | — |
| `isMonitoringTarget` | 是否监测目标 | `boolean` | ✓ |
| `status` | 记录状态 | `RecordStatus` | ✓ |
| `effectiveDate` | 生效日期 | `string` | — |
| `archiveDate` | 归档日期 | `string` | — |

**动作**：add / modify / archive / list / detail

#### Employment — 工作信息

dataSet: `prh_employment`，实现 `ILogicDelete`、`ITenant`、`IAuditInfo`。

| 属性 | 标题 | TS 类型 | 必填 |
|---|---|---|---|
| `resident` | 所属居民 | `Resident` | ✓ |
| `unitName` | 工作单位名称 | `string` | ✓ |
| `addressType` | 工作地址类型 | `EmploymentAddressType` | ✓ |
| `workAddress` | 工作地址 | `PrhAddress` | — |
| `fence` | 电子围栏 | `Fence` | — |
| `workPattern` | 工作规律 | `string` | — |
| `reminderStart` | 提醒开始时间 | `string` | — |
| `reminderEnd` | 提醒结束时间 | `string` | — |
| `isMonitoringTarget` | 是否监测目标 | `boolean` | ✓ |
| `status` | 记录状态 | `RecordStatus` | ✓ |
| `effectiveDate` | 生效日期 | `string` | — |
| `archiveDate` | 归档日期 | `string` | — |

**动作**：add / modify / archive / list / detail

#### PersonalIncome — 个人收入

dataSet: `prh_personal_income`，实现 `ILogicDelete`、`ITenant`、`IAuditInfo`。

| 属性 | 标题 | TS 类型 | 必填 |
|---|---|---|---|
| `resident` | 所属居民 | `Resident` | ✓ |
| `incomeType` | 收入类型 | `IncomeType` | ✓ |
| `amount` | 金额 | `number` | ✓ |
| `period` | 所属期间 | `string` | — |
| `employer` | 收入来源单位 | `string` | — |
| `certPhoto` | 收入证明附件 | `string` | — |
| `status` | 记录状态 | `RecordStatus` | ✓ |

**动作**：add / modify / archive / list / detail

#### EligibilityApplication — 保障资质申请

dataSet: `prh_eligibility_application`，实现 `ILogicDelete`、`ITenant`、`IAuditInfo`、`ISubmitInfo`、`IApprovalInfo`、`IApprovalFlow`。

| 属性 | 标题 | TS 类型 | 必填 |
|---|---|---|---|
| `household` | 所属家庭 | `Household` | ✓ |
| `applicationType` | 申请类型 | `ApplicationType` | ✓ |
| `guaranteeType` | 保障类型 | `GuaranteeType` | ✓ |
| `status` | 申请状态 | `ApplicationStatus` | ✓ |
| `reviewStartDate` | 复审开始日期 | `string` | — |
| `reviewEndDate` | 复审结束日期 | `string` | — |

**动作**：add / modify / submit / unsubmit / list / detail

#### HousingAllocation — 实物配租

dataSet: `prh_housing_allocation`，实现 `ILogicDelete`、`ITenant`、`IAuditInfo`。

| 属性 | 标题 | TS 类型 | 必填 |
|---|---|---|---|
| `household` | 所属家庭 | `Household` | ✓ |
| `projectName` | 项目名称 | `string` | ✓ |
| `buildingNo` | 楼栋号 | `string` | — |
| `unitNo` | 单元号 | `string` | — |
| `roomNo` | 房号 | `string` | — |
| `area` | 面积 | `number` | — |
| `monthlyRent` | 月租金 | `number` | — |
| `leaseStartDate` | 租赁开始日期 | `string` | ✓ |
| `leaseEndDate` | 租赁结束日期 | `string` | — |
| `status` | 分配状态 | `AllocationStatus` | ✓ |

**动作**：add / modify / submit / unsubmit / terminate / expire / list / detail

#### RentalSubsidy — 租赁补贴

dataSet: `prh_rental_subsidy`，实现 `ILogicDelete`、`ITenant`、`IAuditInfo`。

| 属性 | 标题 | TS 类型 | 必填 |
|---|---|---|---|
| `household` | 所属家庭 | `Household` | ✓ |
| `monthlyAmount` | 月补贴金额 | `number` | ✓ |
| `startDate` | 补贴开始日期 | `string` | ✓ |
| `endDate` | 补贴结束日期 | `string` | — |
| `bankAccount` | 收款账户 | `string` | — |
| `bankName` | 开户行 | `string` | — |
| `status` | 补贴状态 | `SubsidyStatus` | ✓ |

**动作**：add / modify / submit / unsubmit / suspend / resume / terminate / expire / list / detail

#### Attendance — 考勤打卡

dataSet: `prh_attendance`，实现 `ITenant`、`IAuditInfo`。

| 属性 | 标题 | TS 类型 | 必填 |
|---|---|---|---|
| `resident` | 打卡居民 | `Resident` | ✓ |
| `attendanceType` | 出勤类型 | `AttendanceType` | ✓ |
| `checkIn` | 打卡时间 | `string` | ✓ |
| `deadline` | 应打卡截止 | `string` | ✓ |
| `face` | 人脸识别照片 | `Attachment` | — |
| `environment` | 环境视频 | `Attachment` | — |
| `location` | 地理坐标 | `GeoPoint` | — |
| `deviceId` | 设备标识 | `string` | — |
| `ipAddress` | 打卡IP | `string` | — |
| `browser` | 客户端UA | `string` | — |
| `mode` | 打卡方式 | `AttendanceMode` | ✓ |
| `status` | 考勤状态 | `AttendanceStatus` | ✓ |

**动作**：checkin / list / detail

### 其他实体

以下实体具有标准 CRUD + archive 动作模式，实现 `ILogicDelete`、`ITenant`、`IAuditInfo`：

| 类名 | 标题 | dataSet |
|---|---|---|
| `AttendanceMakeup` | 补卡申请 | prh_attendance_makeup |
| `AttendanceMakeupAttachment` | 补卡附件 | prh_attendance_makeup_attachment |
| `LeaveType` | 请假类型 | prh_leave_type |
| `Leave` | 请假单 | prh_leave |
| `LeaveAttachment` | 请假附件 | prh_leave_attachment |
| `AttendanceSolution` | 考勤方案 | prh_attendance_solution |
| `AttendanceRule` | 考勤规则 | prh_attendance_rule |
| `EligibilityTermination` | 资格终止 | prh_eligibility_termination |
| `HouseholdMemberChange` | 家庭成员变更 | prh_household_member_change |
| `MigrantWork` | 外出务工 | prh_migrant_work |
| `ResidenceChange` | 居住变更 | prh_residence_change |
| `EmploymentChange` | 工作变更 | prh_employment_change |

### 语义模型事实 (Fact)

以下为分析型语义模型事实，用于统计查询，`isPersistent="false"`：

| 事实名 | 标题 |
|---|---|
| `HouseholdSnapshotFact` | 家庭快照事实 |
| `HouseholdMemberSnapshotFact` | 家庭成员快照事实 |
| `ResidentSnapshotFact` | 居民快照事实 |
| `ResidenceSnapshotFact` | 居住快照事实 |
| `EmploymentSnapshotFact` | 就业快照事实 |
| `PersonalIncomeFact` | 个人收入事实 |
| `EligibilityApplicationFact` | 资格申请事实 |
| `HousingAllocationFact` | 配租事实 |
| `RentalSubsidyFact` | 租赁补贴事实 |
| `AttendanceFact` | 考勤事实 |
| `LeaveFact` | 请假事实 |
| `AttendanceMakeupFact` | 补卡事实 |
| `MigrantWorkFact` | 外出务工事实 |
| `EligibilityTerminationFact` | 资格终止事实 |
| `ResidenceChangeFact` | 居住变更事实 |
| `EmploymentChangeFact` | 工作变更事实 |
| `HouseholdMemberChangeFact` | 家庭成员变更事实 |
