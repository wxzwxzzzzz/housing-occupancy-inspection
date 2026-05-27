import React, { useEffect, useMemo, useState } from 'react';
import {
  Alert,
  Button,
  Drawer,
  Form,
  Input,
  message,
  Modal,
  Space,
  Tag,
} from 'antd';
import {
  DeleteOutlined,
  EditOutlined,
  EnvironmentOutlined,
  PlusOutlined,
  ReloadOutlined,
  SettingOutlined,
} from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
import { fenceService } from '@/services/domains/fence';
import FenceMapEditor from '@/components/FenceMapEditor';
import { getTianDiTuToken, setTianDiTuToken } from '@/utils/tianditu';
import type { Fence } from '@/types/ontology/ap/oms/fence';
import type { FenceType } from '@/types/ontology/ap/oms/fence_type';
import type { GeoPoint } from '@/types/ontology/ap/oms/geo_point';
import {
  OmnibarListPage,
  type FilterConfig,
  type ToolbarAction,
} from '@/components/OmnibarPage';

interface EditState {
  id?: string;
  name: string;
  fenceType: FenceType;
  center?: GeoPoint;
  radius?: number;
  vertices: GeoPoint[];
}

const initialEdit: EditState = {
  name: '',
  fenceType: 'CIRCLE',
  center: undefined,
  radius: 500,
  vertices: [],
};

const FencePage: React.FC = () => {
  const [list, setList] = useState<Fence[]>([]);
  const [loading, setLoading] = useState(false);
  const [filterValues, setFilterValues] = useState<Record<string, any>>({});
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(20);
  const [selectedKeys, setSelectedKeys] = useState<React.Key[]>([]);

  const [drawerOpen, setDrawerOpen] = useState(false);
  const [editing, setEditing] = useState<EditState>(initialEdit);
  const [submitting, setSubmitting] = useState(false);
  const [tokenModalOpen, setTokenModalOpen] = useState(false);
  const [tokenInput, setTokenInput] = useState(getTianDiTuToken());
  const [previewVertices, setPreviewVertices] = useState<GeoPoint[]>([]);
  const [preview, setPreview] = useState<Fence | null>(null);

  async function load() {
    setLoading(true);
    try {
      const env = await fenceService.list({ page: { pageNo: 1, pageSize: 200 } });
      setList(env.data);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
    if (!getTianDiTuToken()) {
      setTokenModalOpen(true);
    }
  }, []);

  const filtered = useMemo(() => {
    const v = filterValues;
    return list.filter((f: any) => {
      if (v.keyword && !String(f.name ?? '').toLowerCase().includes(String(v.keyword).toLowerCase()))
        return false;
      if (v.fenceType && f.fenceType !== v.fenceType) return false;
      return true;
    });
  }, [list, filterValues]);

  const paged = filtered.slice((page - 1) * pageSize, page * pageSize);

  const handleSaveToken = () => {
    setTianDiTuToken(tokenInput.trim());
    setTokenModalOpen(false);
    message.success('token 已保存');
  };

  const handleCreate = () => {
    setEditing(initialEdit);
    setDrawerOpen(true);
  };

  const handleEdit = async (record: Fence) => {
    const id = (record as any).id;
    const { fence, vertices } = await fenceService.detailWithVertices(id);
    if (!fence) return;
    setEditing({
      id,
      name: (fence as any).name ?? '',
      fenceType: (fence as any).fenceType,
      center: (fence as any).center,
      radius: (fence as any).radius,
      vertices: vertices.map((v) => (v as any).point),
    });
    setDrawerOpen(true);
  };

  const handlePreview = async (record: Fence) => {
    const id = (record as any).id;
    const { fence, vertices } = await fenceService.detailWithVertices(id);
    if (!fence) return;
    setPreview(fence);
    setPreviewVertices(vertices.map((v) => (v as any).point));
  };

  const handleDelete = (record: Fence) => {
    Modal.confirm({
      title: '删除围栏?',
      content: '同时会删除其顶点',
      okType: 'danger',
      onOk: async () => {
        await fenceService.deleteWithVertices((record as any).id);
        message.success('已删除');
        load();
      },
    });
  };

  const handleBatchDelete = () => {
    if (selectedKeys.length === 0) return;
    Modal.confirm({
      title: `批量删除 ${selectedKeys.length} 个围栏?`,
      content: '同时会删除其顶点',
      okType: 'danger',
      onOk: async () => {
        await Promise.all(
          selectedKeys.map((id) => fenceService.deleteWithVertices(String(id))),
        );
        setSelectedKeys([]);
        message.success('已删除');
        load();
      },
    });
  };

  const handleSubmit = async () => {
    if (!editing.name.trim()) {
      message.warning('请填写围栏名称');
      return;
    }
    if (editing.fenceType === 'CIRCLE') {
      if (!editing.center || !editing.radius) {
        message.warning('请在地图上点选圆心并设置半径');
        return;
      }
    } else if (editing.vertices.length < 3) {
      message.warning('多边形至少需要 3 个顶点');
      return;
    }

    setSubmitting(true);
    try {
      if (editing.id) {
        await fenceService.deleteWithVertices(editing.id);
      }
      if (editing.fenceType === 'CIRCLE') {
        await fenceService.createCircle({
          name: editing.name,
          center: editing.center!,
          radius: editing.radius!,
        });
      } else {
        await fenceService.createPolygon({
          name: editing.name,
          vertices: editing.vertices,
        });
      }
      message.success('已保存');
      setDrawerOpen(false);
      load();
    } finally {
      setSubmitting(false);
    }
  };

  const filters: FilterConfig[] = [
    { key: 'keyword', label: '关键字', type: 'input', placeholder: '围栏名称' },
    {
      key: 'fenceType',
      label: '类型',
      type: 'quick',
      options: [
        { value: '', label: '全部' },
        { value: 'CIRCLE', label: '圆形' },
        { value: 'POLYGON', label: '多边形' },
      ],
    },
  ];

  const toolbarActions: ToolbarAction[] = [
    {
      key: 'create',
      type: 'primary',
      label: '新建围栏',
      icon: <PlusOutlined />,
      onClick: handleCreate,
    },
    {
      key: 'batchDelete',
      label: '批量删除',
      danger: true,
      disabled: selectedKeys.length === 0,
      onClick: handleBatchDelete,
    },
    { divider: true },
    {
      key: 'token',
      label: '天地图 token',
      icon: <SettingOutlined />,
      onClick: () => setTokenModalOpen(true),
    },
    {
      key: 'refresh',
      type: 'icon',
      icon: <ReloadOutlined />,
      title: '刷新',
      onClick: load,
    },
  ];

  const columns: ColumnsType<Fence> = [
    {
      title: '名称',
      dataIndex: 'name',
      width: 200,
      render: (v: string) => (
        <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
          <EnvironmentOutlined style={{ color: '#1677ff' }} />
          {v ?? '-'}
        </span>
      ),
    },
    {
      title: '类型',
      dataIndex: 'fenceType',
      width: 120,
      render: (v: FenceType) => (
        <Tag color={v === 'CIRCLE' ? 'blue' : 'green'}>
          {v === 'CIRCLE' ? '圆形' : '多边形'}
        </Tag>
      ),
    },
    {
      title: '中心/半径',
      key: 'circleInfo',
      width: 280,
      render: (_: any, r: any) =>
        r.fenceType === 'CIRCLE' && r.center
          ? `(${r.center.longitude.toFixed(4)}, ${r.center.latitude.toFixed(4)}) · 半径 ${r.radius} m`
          : '-',
    },
    {
      title: '创建时间',
      dataIndex: 'createAt',
      width: 200,
      render: (v: string) => (v ? new Date(v).toLocaleString() : '-'),
    },
    {
      title: '操作',
      key: 'op',
      width: 200,
      fixed: 'right' as const,
      render: (_: any, r: Fence) => (
        <span className="opp-row-actions">
          <span
            className="opp-row-action"
            onClick={(e) => {
              e.stopPropagation();
              handlePreview(r);
            }}
          >
            查看
          </span>
          <span
            className="opp-row-action"
            onClick={(e) => {
              e.stopPropagation();
              handleEdit(r);
            }}
          >
            <EditOutlined /> 编辑
          </span>
          <span
            className="opp-row-action danger"
            onClick={(e) => {
              e.stopPropagation();
              handleDelete(r);
            }}
          >
            <DeleteOutlined /> 删除
          </span>
        </span>
      ),
    },
  ];

  const topSlot = !getTianDiTuToken() ? (
    <Alert
      type="info"
      message="请先配置天地图 token"
      description='点击工具栏「天地图 token」按钮填入开发者 key,否则地图无法显示。'
      showIcon
    />
  ) : null;

  return (
    <div style={{ height: '100%' }}>
      <OmnibarListPage<Fence>
        topSlot={topSlot}
        filters={filters}
        filterValues={filterValues}
        onFilterChange={setFilterValues}
        onSearch={() => setPage(1)}
        toolbarActions={toolbarActions}
        data={paged}
        columns={columns}
        loading={loading}
        rowKey={(r: any) => r.id}
        selectedKeys={selectedKeys}
        onSelectionChange={setSelectedKeys}
        showCheckbox
        showIndex
        onRowClick={(r) => handlePreview(r)}
        total={filtered.length}
        page={page}
        pageSize={pageSize}
        onPageChange={(p, s) => {
          setPage(p);
          setPageSize(s);
        }}
      />

      {/* 新建/编辑抽屉 */}
      <Drawer
        title={editing.id ? '编辑围栏' : '新建围栏'}
        open={drawerOpen}
        width={Math.min(900, typeof window !== 'undefined' ? window.innerWidth - 80 : 900)}
        onClose={() => setDrawerOpen(false)}
        extra={
          <Space>
            <Button onClick={() => setDrawerOpen(false)}>取消</Button>
            <Button type="primary" loading={submitting} onClick={handleSubmit}>
              保存
            </Button>
          </Space>
        }
      >
        <Form layout="vertical" style={{ marginBottom: 12 }}>
          <Form.Item label="围栏名称" required>
            <Input
              value={editing.name}
              onChange={(e) => setEditing((s) => ({ ...s, name: e.target.value }))}
              placeholder="例如:天河保障花园-外出务工区"
              maxLength={64}
            />
          </Form.Item>
        </Form>

        <FenceMapEditor
          mode="edit"
          fenceType={editing.fenceType}
          center={editing.center}
          radius={editing.radius}
          vertices={editing.vertices}
          onChangeType={(t) =>
            setEditing((s) => ({
              ...s,
              fenceType: t,
              center: t === 'CIRCLE' ? s.center : undefined,
              radius: t === 'CIRCLE' ? s.radius ?? 500 : undefined,
              vertices: t === 'POLYGON' ? s.vertices : [],
            }))
          }
          onChangeCenter={(c) => setEditing((s) => ({ ...s, center: c }))}
          onChangeRadius={(r) => setEditing((s) => ({ ...s, radius: r }))}
          onChangeVertices={(vs) => setEditing((s) => ({ ...s, vertices: vs }))}
          height={520}
        />
      </Drawer>

      {/* 预览 */}
      <Drawer
        title={preview ? `查看围栏 · ${(preview as any).name ?? ''}` : ''}
        open={!!preview}
        width={Math.min(900, typeof window !== 'undefined' ? window.innerWidth - 80 : 900)}
        onClose={() => setPreview(null)}
      >
        {preview && (
          <FenceMapEditor
            mode="readonly"
            fenceType={(preview as any).fenceType}
            center={(preview as any).center}
            radius={(preview as any).radius}
            vertices={previewVertices}
            height={560}
          />
        )}
      </Drawer>

      {/* token 配置 */}
      <Modal
        title="天地图 token 设置"
        open={tokenModalOpen}
        onOk={handleSaveToken}
        onCancel={() => setTokenModalOpen(false)}
        okText="保存"
      >
        <Alert
          type="info"
          message="天地图开发者 key"
          description={
            <span>
              请到{' '}
              <a
                href="https://console.tianditu.gov.cn/api/key"
                target="_blank"
                rel="noreferrer"
              >
                天地图开发者中心
              </a>
              {' '}申请「浏览器端」key,粘贴到下方输入框即可。
            </span>
          }
          showIcon
          style={{ marginBottom: 16 }}
        />
        <Input
          value={tokenInput}
          onChange={(e) => setTokenInput(e.target.value)}
          placeholder="形如 1234567890abcdef..."
          maxLength={128}
        />
      </Modal>
    </div>
  );
};

export default FencePage;
