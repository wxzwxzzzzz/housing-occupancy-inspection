# 保障房入住核验管理系统（前端）

基于本体（Ontology）数据模型构建的公租房保障监管平台前端。

## 技术栈

- Umi Max 4 + React 19 + TypeScript 5
- Ant Design 5 + Pro Components
- MobX + ahooks
- ApexCharts / Ant Design Charts
- AntV X6 + LogicFlow（流程图）
- 天地图 JS API v4.0（电子围栏）
- `@react-awesome-query-builder/antd`（动态筛选器）

## 业务模块

- 工作台
- 居民档案（居民 360 视图）
- 监测与处置（打卡核验、预警列表、预警处置）
- 申请与审批（请假、备案、资格、补卡、变更、流程编辑）
- 分析与报表（统计图表、CSV 导出）
- 系统与运维（人员、角色、菜单、配置、日志、消息）
- 电子围栏
- 筛选器管理

## 数据访问

所有业务数据走本体网关 `POST /api/v1/ontology/{actionName}`。前端通过 `services/ontology` 协议层（client + qb 查询构建器 + buildEntityApi 工厂）和 `services/domains` 业务门面与之交互。本体类型在 `src/types/ontology` 下，由本体 XML 自动生成。

## 开发

环境要求：Node.js >= 20

```bash
npm install
npm start          # 启动开发服务器(默认带 mock)
npm run start:dev  # 启动开发服务器(关闭 mock,对接真实后端)
npm run build      # 生产构建
npm run lint       # Biome lint + tsc 类型检查
npm test           # 运行 Jest 测试
```
