import React, { useEffect, useState } from 'react';
import {
  Alert,
  Button,
  Card,
  Drawer,
  Form,
  Input,
  message,
  Modal,
  Popconfirm,
  Space,
  Table,
  Tag,
} from 'antd';
import { DeleteOutlined, EditOutlined, EnvironmentOutlined, PlusOutlined, SettingOutlined } from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
import { fenceService } from '@/services/domains/fence';
import FenceMapEditor from '@/components/FenceMapEditor';
import { getTianDiTuToken, setTianDiTuToken } from '@/utils/tianditu';
import type { Fence } from '@/types/ontology/ap/oms/fence';
import type { FenceVertex } from '@/types/ontology/ap/oms/fence_vertex';
import type { FenceType } from '@/types/ontology/ap/oms/fence_type';
import type { GeoPoint } from '@/types/ontology/ap/oms/geo_point';

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
      // 第一次进入提示填 token
      setTokenModalOpen(true);
    }
  }, []);

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

  const handleDelete = async (record: Fence) => {
    await fenceService.deleteWithVertices((record as any).id);
    message.success('已删除');
    load();
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
        // 编辑:简化处理 — 删旧建新(对围栏这种低频对象足够)
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

  const columns: ColumnsType<Fence> = [
    {
      title: '名称',
      dataIndex: 'name',
      width: 200,
      render: (v: string) => (
        <Space>
          <EnvironmentOutlined />
          {v ?? '-'}
        </Space>
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
      width: 240,
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
      width: 240,
      fixed: 'right' as const,
      render: (_: any, r: Fence) => (
        <Space size="small">
          <Button type="link" size="small" onClick={() => handlePreview(r)}>
            查看
          </Button>
          <Button type="link" size="small" icon={<EditOutlined />} onClick={() => handleEdit(r)}>
            编辑
          </Button>
          <Popconfirm
            title="删除围栏?"
            description="同时会删除其顶点"
            onConfirm={() => handleDelete(r)}
            okType="danger"
          >
            <Button type="link" size="small" danger icon={<DeleteOutlined />}>
              删除
            </Button>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <div style={{ padding: 24 }}>
      <Card
        title={
          <Space>
            <EnvironmentOutlined />
            电子围栏管理
          </Space>
        }
        extra={
          <Space>
            <Button icon={<SettingOutlined />} onClick={() => setTokenModalOpen(true)}>
              天地图 token
            </Button>
            <Button type="primary" icon={<PlusOutlined />} onClick={handleCreate}>
              新建围栏
            </Button>
          </Space>
        }
      >
        {!getTianDiTuToken() && (
          <Alert
            type="info"
            style={{ marginBottom: 16 }}
            message="请先配置天地图 token"
            description="点击右上角「天地图 token」按钮填入开发者 key,否则地图无法显示"
            showIcon
          />
        )}

        <Table<Fence>
          rowKey={(r) => (r as any).id}
          columns={columns}
          dataSource={list}
          loading={loading}
          pagination={{ pageSize: 10, showTotal: (t) => `共 ${t} 条` }}
        />
      </Card>

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
              // 切换类型时清空对方数据
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
