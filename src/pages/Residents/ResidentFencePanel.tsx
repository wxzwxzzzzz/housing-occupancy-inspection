/**
 * 居民围栏 Tab — 嵌入在 ResidentDetail 里
 *
 * 取该居民"生效中"的居住记录,看其 fence 字段:
 *  - 有围栏:展示地图(只读),提供"编辑围栏"按钮
 *  - 无围栏:展示空状态,提供"新增围栏"按钮
 *
 * 编辑/新增都打开 Drawer,内嵌 FenceMapEditor 完成绘制。
 * 保存后,自动把生成的 Fence.id 回写到 Residence.fence。
 */

import {
  EditOutlined,
  EnvironmentOutlined,
  PlusOutlined,
  ReloadOutlined,
} from '@ant-design/icons';
import { useRequest } from 'ahooks';
import {
  Alert,
  Button,
  Drawer,
  Empty,
  InputNumber,
  message,
  Radio,
  Skeleton,
  Space,
  Tag,
} from 'antd';
import React, { useEffect, useMemo, useState } from 'react';
import FenceMapEditor from '@/components/FenceMapEditor';
import { fenceService } from '@/services/domains/fence';
import { residenceService } from '@/services/domains/household';
import { OT } from '@/services/ontology/object-types';
import { qb } from '@/services/ontology/query';
import type { Fence } from '@/types/ontology/ap/oms/fence';
import type { FenceType } from '@/types/ontology/ap/oms/fence_type';
import type { FenceVertex } from '@/types/ontology/ap/oms/fence_vertex';
import type { GeoPoint } from '@/types/ontology/ap/oms/geo_point';
import type { Residence } from '@/types/ontology/prh/entities/residence';

const FenceTypeLabel: Record<string, string> = {
  CIRCLE: '圆形',
  POLYGON: '多边形',
};

export interface ResidentFencePanelProps {
  residentId: string;
}

interface EditState {
  fenceType: FenceType;
  center?: GeoPoint;
  radius: number;
  vertices: GeoPoint[];
}

const ResidentFencePanel: React.FC<ResidentFencePanelProps> = ({
  residentId,
}) => {
  // 1. 拉该居民"生效中"的居住记录(理论上只有 1 条)
  const {
    data: activeResidence,
    loading: residenceLoading,
    refresh: reloadResidence,
  } = useRequest(
    async () => {
      const env = await residenceService.list(
        qb(OT.Residence)
          .eq('resident', residentId)
          .eq('status', 'RECORD_ACTIVE')
          .page(1, 1)
          .build() as any,
      );
      return (env.data?.[0] ?? null) as Residence | null;
    },
    { refreshDeps: [residentId] },
  );

  // 2. 拉对应的围栏数据
  const fenceId = (activeResidence as any)?.fence as string | undefined;
  const {
    data: fenceData,
    loading: fenceLoading,
    refresh: reloadFence,
  } = useRequest(
    async () => {
      if (!fenceId)
        return { fence: null as Fence | null, vertices: [] as FenceVertex[] };
      return fenceService.detailWithVertices(fenceId);
    },
    { refreshDeps: [fenceId] },
  );

  const fence = fenceData?.fence ?? null;
  const vertices = fenceData?.vertices ?? [];
  const vertexPoints: GeoPoint[] = vertices.map((v: any) => v.point);

  // 3. Drawer 编辑态
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [editing, setEditing] = useState<EditState>({
    fenceType: 'CIRCLE',
    center: undefined,
    radius: 200,
    vertices: [],
  });
  const [submitting, setSubmitting] = useState(false);

  const isEditMode = !!fence; // true=编辑现有,false=新建

  const openDrawer = () => {
    if (fence) {
      setEditing({
        fenceType: (fence as any).fenceType ?? 'CIRCLE',
        center: (fence as any).center,
        radius: (fence as any).radius ?? 200,
        vertices: vertexPoints,
      });
    } else {
      setEditing({
        fenceType: 'CIRCLE',
        center: undefined,
        radius: 200,
        vertices: [],
      });
    }
    setDrawerOpen(true);
  };

  const closeDrawer = () => {
    if (submitting) return;
    setDrawerOpen(false);
  };

  const isValid = useMemo(() => {
    if (editing.fenceType === 'CIRCLE') {
      return !!editing.center && editing.radius > 0;
    }
    return editing.vertices.length >= 3;
  }, [editing]);

  const handleSubmit = async () => {
    if (!isValid) {
      message.warning(
        editing.fenceType === 'CIRCLE'
          ? '请在地图上选择中心点并设置半径'
          : '多边形围栏至少需要 3 个顶点',
      );
      return;
    }
    if (!activeResidence) {
      message.error('该居民没有生效中的居住记录,无法绑定围栏');
      return;
    }
    setSubmitting(true);
    try {
      let nextFenceId: string;
      if (isEditMode && fence) {
        // 现有围栏:删除重建(简化实现:CIRCLE 与 POLYGON 切换、顶点改动都需要重建顶点表)
        await fenceService.deleteWithVertices((fence as any).id);
        const env =
          editing.fenceType === 'CIRCLE'
            ? await fenceService.createCircle({
                center: editing.center!,
                radius: editing.radius,
              })
            : await fenceService.createPolygon({ vertices: editing.vertices });
        nextFenceId = (env.data as any)?.id;
      } else {
        const env =
          editing.fenceType === 'CIRCLE'
            ? await fenceService.createCircle({
                center: editing.center!,
                radius: editing.radius,
              })
            : await fenceService.createPolygon({ vertices: editing.vertices });
        nextFenceId = (env.data as any)?.id;
      }

      // 把围栏 id 回写到 Residence.fence
      await residenceService.modify({
        id: (activeResidence as any).id,
        fence: nextFenceId,
      } as any);

      message.success(isEditMode ? '围栏已更新' : '围栏已新增');
      setDrawerOpen(false);
      reloadResidence();
      reloadFence();
    } catch (err: any) {
      message.error(err?.message ?? '保存失败');
    } finally {
      setSubmitting(false);
    }
  };

  const loading = residenceLoading || fenceLoading;

  if (loading) {
    return (
      <div style={{ padding: 16 }}>
        <Skeleton active paragraph={{ rows: 4 }} />
      </div>
    );
  }

  // 没有生效居住记录:无法绑定围栏
  if (!activeResidence) {
    return (
      <div style={{ padding: 24 }}>
        <Empty
          description={
            <span style={{ color: '#888' }}>
              该居民暂无"生效中"的居住信息,无法绑定电子围栏。
              <br />
              请先到"居住信息"Tab 登记一条居住记录。
            </span>
          }
        />
      </div>
    );
  }

  // 有居住记录但没围栏:显示新增按钮
  if (!fence) {
    return (
      <div style={{ padding: 24 }}>
        <Empty
          image={
            <EnvironmentOutlined style={{ fontSize: 56, color: '#bfbfbf' }} />
          }
          description={
            <span style={{ color: '#888' }}>
              当前居住地址{' '}
              <strong>{(activeResidence as any).address?.detail ?? '-'}</strong>{' '}
              尚未绑定电子围栏
            </span>
          }
        >
          <Button type="primary" icon={<PlusOutlined />} onClick={openDrawer}>
            新增围栏
          </Button>
        </Empty>

        <FenceDrawer
          open={drawerOpen}
          isEdit={false}
          editing={editing}
          setEditing={setEditing}
          onClose={closeDrawer}
          onSubmit={handleSubmit}
          submitting={submitting}
          isValid={isValid}
        />
      </div>
    );
  }

  // 有围栏:展示 + 编辑
  return (
    <div style={{ padding: 16 }}>
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: 12,
        }}
      >
        <Space size={12}>
          <Tag
            color={(fence as any).fenceType === 'CIRCLE' ? 'blue' : 'purple'}
          >
            {FenceTypeLabel[(fence as any).fenceType] ??
              (fence as any).fenceType}
          </Tag>
          {(fence as any).fenceType === 'CIRCLE' && (
            <span style={{ color: '#595959' }}>
              中心点 {(fence as any).center?.longitude?.toFixed(6)},{' '}
              {(fence as any).center?.latitude?.toFixed(6)}
              <span style={{ color: '#bfbfbf', margin: '0 8px' }}>·</span>
              半径 {(fence as any).radius} 米
            </span>
          )}
          {(fence as any).fenceType === 'POLYGON' && (
            <span style={{ color: '#595959' }}>
              {vertexPoints.length} 个顶点
            </span>
          )}
        </Space>
        <Space>
          <Button icon={<ReloadOutlined />} onClick={reloadFence}>
            刷新
          </Button>
          <Button type="primary" icon={<EditOutlined />} onClick={openDrawer}>
            编辑围栏
          </Button>
        </Space>
      </div>

      <FenceMapEditor
        mode="readonly"
        fenceType={(fence as any).fenceType}
        center={(fence as any).center}
        radius={(fence as any).radius}
        vertices={vertexPoints}
        height={520}
      />

      <FenceDrawer
        open={drawerOpen}
        isEdit
        editing={editing}
        setEditing={setEditing}
        onClose={closeDrawer}
        onSubmit={handleSubmit}
        submitting={submitting}
        isValid={isValid}
      />
    </div>
  );
};

// ============ 内嵌的编辑 Drawer ============

interface FenceDrawerProps {
  open: boolean;
  isEdit: boolean;
  editing: EditState;
  setEditing: (s: EditState) => void;
  onClose: () => void;
  onSubmit: () => void;
  submitting: boolean;
  isValid: boolean;
}

const FenceDrawer: React.FC<FenceDrawerProps> = ({
  open,
  isEdit,
  editing,
  setEditing,
  onClose,
  onSubmit,
  submitting,
  isValid,
}) => (
  <Drawer
    title={isEdit ? '编辑电子围栏' : '新增电子围栏'}
    width={780}
    open={open}
    onClose={onClose}
    footer={
      <div style={{ textAlign: 'right' }}>
        <Space>
          <Button onClick={onClose} disabled={submitting}>
            取消
          </Button>
          <Button
            type="primary"
            onClick={onSubmit}
            loading={submitting}
            disabled={!isValid}
          >
            保存
          </Button>
        </Space>
      </div>
    }
  >
    <Space direction="vertical" size={12} style={{ width: '100%' }}>
      <Alert
        type="info"
        showIcon
        message={
          editing.fenceType === 'CIRCLE'
            ? '点击地图选择中心点,使用下方滑杆调整半径(米)。'
            : '点击地图依次添加顶点,双击或右键结束;至少 3 个顶点。'
        }
      />
      <Space size={16}>
        <span>围栏类型:</span>
        <Radio.Group
          value={editing.fenceType}
          onChange={(e) =>
            setEditing({
              ...editing,
              fenceType: e.target.value,
              center: undefined,
              vertices: [],
            })
          }
        >
          <Radio.Button value="CIRCLE">圆形</Radio.Button>
          <Radio.Button value="POLYGON">多边形</Radio.Button>
        </Radio.Group>
        {editing.fenceType === 'CIRCLE' && (
          <Space>
            <span>半径(米):</span>
            <InputNumber
              min={20}
              max={5000}
              step={10}
              value={editing.radius}
              onChange={(v) =>
                setEditing({ ...editing, radius: Number(v ?? 200) })
              }
              style={{ width: 120 }}
            />
          </Space>
        )}
      </Space>
      <FenceMapEditor
        mode="edit"
        fenceType={editing.fenceType}
        center={editing.center}
        radius={editing.radius}
        vertices={editing.vertices}
        height={520}
        onChangeType={(t) =>
          setEditing({
            ...editing,
            fenceType: t,
            center: undefined,
            vertices: [],
          })
        }
        onChangeCenter={(c) => setEditing({ ...editing, center: c })}
        onChangeRadius={(r) => setEditing({ ...editing, radius: r })}
        onChangeVertices={(vs) => setEditing({ ...editing, vertices: vs })}
      />
    </Space>
  </Drawer>
);

export default ResidentFencePanel;
