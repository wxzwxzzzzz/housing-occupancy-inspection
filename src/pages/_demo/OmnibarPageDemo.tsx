/**
 * OmnibarPage 组件库 demo 页(临时,不接路由)
 *
 * 通过 import { OmnibarListPage, OmnibarDetailPage } from '@/components/OmnibarPage'
 * 测试两个壳组件 + 各子部件能否正常组装
 */
import React, { useState } from 'react';
import {
  OmnibarListPage,
  OmnibarDetailPage,
  type FilterConfig,
  type ToolbarAction,
  type DetailSection,
  type DetailTabItem,
} from '@/components/OmnibarPage';
import { Table } from 'antd';
import {
  PlusOutlined,
  ReloadOutlined,
  SettingOutlined,
  ExpandOutlined,
} from '@ant-design/icons';

interface OntologyRow {
  id: string;
  code: string;
  name: string;
  namespace: string;
  kind: string;
  status: string;
  updatedBy: string;
  updatedAt: string;
}

const MOCK_DATA: OntologyRow[] = [
  { id: '1', code: 'Resident', name: '居民', namespace: 'cn.byteawake.prh', kind: 'object', status: 'published', updatedBy: '菲利普斯', updatedAt: '2026-05-06 10:12' },
  { id: '2', code: 'Household', name: '户籍家庭', namespace: 'cn.byteawake.prh', kind: 'object', status: 'published', updatedBy: '菲利普斯', updatedAt: '2026-05-06 09:48' },
  { id: '3', code: 'Attendance', name: '考勤记录', namespace: 'cn.byteawake.prh', kind: 'object', status: 'published', updatedBy: '王工', updatedAt: '2026-05-04 14:20' },
  { id: '4', code: 'Leave', name: '请假记录', namespace: 'cn.byteawake.prh', kind: 'object', status: 'draft', updatedBy: '李工', updatedAt: '2026-05-04 10:06' },
  { id: '5', code: 'IAuditInfo', name: '审计信息', namespace: 'cn.byteawake.ap.oms', kind: 'interface', status: 'published', updatedBy: '系统', updatedAt: '2026-04-28 09:00' },
];

const OmnibarPageDemo: React.FC = () => {
  // ----- 列表页 state -----
  const [filterValues, setFilterValues] = useState<Record<string, any>>({});
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [selectedKeys, setSelectedKeys] = useState<React.Key[]>([]);
  const [showOnlySelected, setShowOnlySelected] = useState(false);
  const [showDetail, setShowDetail] = useState(false);

  const filters: FilterConfig[] = [
    { key: 'code', label: '对象编码', type: 'input' },
    {
      key: 'kind',
      label: '对象类型',
      type: 'quick',
      options: [
        { value: '', label: '全部' },
        { value: 'object', label: '对象' },
        { value: 'interface', label: '接口' },
        { value: 'action', label: '动作' },
      ],
    },
    {
      key: 'status',
      label: '状态',
      type: 'quick',
      options: [
        { value: '', label: '全部' },
        { value: 'draft', label: '草稿' },
        { value: 'published', label: '已发布' },
        { value: 'deprecated', label: '已弃用' },
      ],
    },
    {
      key: 'namespace',
      label: '命名空间',
      type: 'select',
      options: [
        { value: 'cn.byteawake.prh', label: 'cn.byteawake.prh' },
        { value: 'cn.byteawake.ap.oms', label: 'cn.byteawake.ap.oms' },
      ],
    },
    { key: 'updatedAt', label: '修改时间', type: 'dateRange' },
  ];

  const toolbarActions: ToolbarAction[] = [
    { key: 'create', label: '新建', type: 'primary', icon: <PlusOutlined />, dropdown: true, dropdownItems: [{ key: 'a', label: '对象' }, { key: 'b', label: '接口' }] },
    { key: 'submit', label: '提交' },
    { key: 'audit', label: '审核' },
    { key: 'publish', label: '发布' },
    { divider: true },
    { key: 'deprecate', label: '弃用' },
    { key: 'delete', label: '删除', danger: true },
    { divider: true },
    { key: 'export', label: '导出' },
    { key: 'import', label: '导入' },
    { divider: true },
    { key: 'refresh', type: 'icon', icon: <ReloadOutlined />, title: '刷新' },
    { key: 'columns', type: 'icon', icon: <SettingOutlined />, title: '列设置' },
  ];

  const columns = [
    {
      title: '对象编码',
      dataIndex: 'code',
      render: (v: string) => (
        <a className="opp-link-cell" onClick={() => setShowDetail(true)}>
          {v}
        </a>
      ),
    },
    { title: '对象名称', dataIndex: 'name' },
    { title: '命名空间', dataIndex: 'namespace' },
    { title: '类型', dataIndex: 'kind' },
    { title: '状态', dataIndex: 'status' },
    { title: '修改人', dataIndex: 'updatedBy' },
    { title: '修改时间', dataIndex: 'updatedAt' },
    {
      title: '操作',
      key: 'action',
      render: () => (
        <span className="opp-row-actions">
          <span className="opp-row-action">编辑</span>
          <span className="opp-row-action">复制</span>
          <span className="opp-row-action-more" title="更多">
            ⋯
          </span>
        </span>
      ),
    },
  ];

  if (showDetail) {
    // ----- 详情页 demo -----
    const sections: DetailSection[] = [
      {
        key: 'base',
        title: '基础信息',
        fields: [
          { label: '对象编码', value: 'Resident' },
          { label: '对象名称', value: '居民' },
          { label: '命名空间', value: 'cn.byteawake.prh' },
          { label: '类型', value: '对象' },
          { label: '状态', value: '已发布' },
        ],
      },
      {
        key: 'inherit',
        title: '继承与实现',
        defaultCollapsed: true,
        fields: [
          { label: '父类', value: '--' },
          { label: '实现接口', value: 'IAuditInfo, ITenant' },
        ],
      },
      {
        key: 'extra',
        title: '扩展配置',
        defaultCollapsed: true,
        fields: [
          { label: '数据集', value: '--' },
          { label: '业务域', value: 'prh' },
          { label: '标签', value: '--' },
        ],
      },
    ];

    const tabs: DetailTabItem[] = [
      {
        key: 'fact',
        label: 'Fact 属性',
        content: (
          <Table
            size="small"
            pagination={false}
            dataSource={[
              { id: '1', name: 'fullName', type: 'String', required: '是', defaultVal: '--', desc: '姓名' },
              { id: '2', name: 'idCardNo', type: 'String', required: '是', defaultVal: '--', desc: '身份证号' },
              { id: '3', name: 'gender', type: 'Enum', required: '是', defaultVal: '--', desc: '性别' },
            ]}
            rowKey="id"
            columns={[
              { title: '属性名', dataIndex: 'name' },
              { title: '属性类型', dataIndex: 'type' },
              { title: '是否必填', dataIndex: 'required' },
              { title: '默认值', dataIndex: 'defaultVal' },
              { title: '描述', dataIndex: 'desc' },
            ]}
          />
        ),
      },
      { key: 'action', label: 'Action 动作', content: <div style={{ padding: 24 }}>暂无 Action</div> },
      { key: 'link', label: 'Link 关联', content: <div style={{ padding: 24 }}>暂无 Link</div> },
    ];

    return (
      <div style={{ padding: 16, background: '#f0f2f5', height: '100vh' }}>
        <OmnibarDetailPage
          title="Resident"
          statusBadge={{ text: '已发布', color: 'success' }}
          onBack={() => setShowDetail(false)}
          headerActions={[
            { key: 'edit', label: '编辑' },
            { key: 'publish', label: '发布', dropdown: true, dropdownItems: [{ key: 'a', label: '正式发布' }] },
            { divider: true },
            { key: 'deprecate', label: '弃用' },
            { key: 'delete', label: '删除', danger: true },
          ]}
          sections={sections}
          tabs={tabs}
          tabActions={[
            { key: 'add', label: '新增' },
            { key: 'del', label: '删除' },
            { divider: true },
            { key: 'fullscreen', type: 'icon', icon: <ExpandOutlined />, title: '全屏' },
          ]}
          footerFields={[
            { label: '修改人', value: '菲利普斯' },
            { label: '修改时间', value: '2026-05-06 10:12' },
            { label: '创建人', value: '系统' },
            { label: '创建时间', value: '2026-04-28 09:00' },
          ]}
        />
      </div>
    );
  }

  return (
    <div style={{ padding: 16, background: '#f0f2f5', height: '100vh' }}>
      <OmnibarListPage<OntologyRow>
        filters={filters}
        filterValues={filterValues}
        onFilterChange={setFilterValues}
        viewModes={[
          { value: 'header', label: '表头' },
          { value: 'detail', label: '表头+明细' },
        ]}
        viewMode="detail"
        toolbarActions={toolbarActions}
        data={MOCK_DATA}
        columns={columns}
        selectedKeys={selectedKeys}
        onSelectionChange={setSelectedKeys}
        subtotal="对象 4 · 接口 1 · 动作 0"
        grandtotal="对象 4 · 接口 1 · 动作 0"
        total={MOCK_DATA.length}
        page={page}
        pageSize={pageSize}
        onPageChange={(p, s) => {
          setPage(p);
          setPageSize(s);
        }}
        showOnlySelected={showOnlySelected}
        onShowOnlySelectedChange={setShowOnlySelected}
      />
    </div>
  );
};

export default OmnibarPageDemo;
