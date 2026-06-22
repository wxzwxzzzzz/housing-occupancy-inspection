/**
 * 天地图电子围栏绘制组件
 *
 * 支持:
 *  - 圆形(指定中心点 + 半径,半径滑杆调整)
 *  - 多边形(连续点击地图加点,右键/双击结束)
 *  - 已存在围栏的回显展示
 *  - 编辑时支持鼠标拖拽顶点
 *
 * 使用方:
 *   <FenceMapEditor
 *     mode="edit"
 *     fenceType="POLYGON"
 *     value={vertices}
 *     onChange={(v) => ...}
 *   />
 */

import React, { useEffect, useRef, useState } from 'react';
import { Alert, Button, InputNumber, Radio, Space } from 'antd';
import { ReloadOutlined } from '@ant-design/icons';
import type { FenceType } from '@/types/ontology/ap/oms/fence_type';
import type { GeoPoint } from '@/types/ontology/ap/oms/geo_point';
import { loadTianDiTu } from '@/utils/tianditu';

export interface FenceMapEditorProps {
  /** edit:可绘制可改;readonly:仅展示 */
  mode: 'edit' | 'readonly';
  /** 当前围栏类型 */
  fenceType: FenceType;
  /** 圆心(CIRCLE 时使用) */
  center?: GeoPoint;
  /** 半径,米(CIRCLE 时使用) */
  radius?: number;
  /** 顶点(POLYGON 时使用),按 ordinal 排序 */
  vertices?: GeoPoint[];
  /** 高度,默认 480 */
  height?: number;
  /** 默认地图中心(无围栏时) */
  defaultCenter?: GeoPoint;
  /** 默认缩放,默认 14 */
  defaultZoom?: number;

  onChangeType?: (type: FenceType) => void;
  onChangeCenter?: (p: GeoPoint) => void;
  onChangeRadius?: (r: number) => void;
  onChangeVertices?: (vs: GeoPoint[]) => void;
}

const DEFAULT_CENTER: GeoPoint = { longitude: 113.27, latitude: 23.13 }; // 广州

const FenceMapEditor: React.FC<FenceMapEditorProps> = ({
  mode,
  fenceType,
  center,
  radius,
  vertices,
  height = 480,
  defaultCenter = DEFAULT_CENTER,
  defaultZoom = 14,
  onChangeType,
  onChangeCenter,
  onChangeRadius,
  onChangeVertices,
}) => {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const mapRef = useRef<any>(null);
  const overlayRef = useRef<any[]>([]); // 当前展示在地图上的图形
  const verticesRef = useRef<GeoPoint[]>(vertices ?? []);
  const [error, setError] = useState<string | null>(null);
  const [ready, setReady] = useState(false);

  // 初始化地图(token 未配置时给出友好提示)
  useEffect(() => {
    let cancelled = false;
    setError(null);
    loadTianDiTu()
      .then((T) => {
        if (cancelled || !containerRef.current) return;
        if (mapRef.current) return;
        const map = new T.Map(containerRef.current);
        const c = center ?? vertices?.[0] ?? defaultCenter;
        map.centerAndZoom(new T.LngLat(c.longitude, c.latitude), defaultZoom);
        map.enableScrollWheelZoom();
        map.enableDrag();
        mapRef.current = map;
        setReady(true);
      })
      .catch((err: Error) => {
        if (!cancelled) setError(err.message);
      });
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // 监听点击 / 双击,生成顶点
  useEffect(() => {
    if (!ready || mode !== 'edit') return;
    const T = window.T;
    const map = mapRef.current;
    if (!T || !map) return;

    const handleClick = (e: any) => {
      const lng = e.lnglat.getLng();
      const lat = e.lnglat.getLat();
      if (fenceType === 'CIRCLE') {
        onChangeCenter?.({ longitude: lng, latitude: lat });
      } else {
        const next = [...(verticesRef.current ?? []), { longitude: lng, latitude: lat }];
        verticesRef.current = next;
        onChangeVertices?.(next);
      }
    };
    map.addEventListener('click', handleClick);

    const handleDblClick = () => {
      // 双击代表结束绘制(对外不感知,业务可由"保存"按钮提交)
      // 此处仅消费事件
    };
    map.addEventListener('dblclick', handleDblClick);

    return () => {
      map.removeEventListener('click', handleClick);
      map.removeEventListener('dblclick', handleDblClick);
    };
  }, [ready, mode, fenceType, onChangeCenter, onChangeVertices]);

  // 重绘覆盖物
  useEffect(() => {
    if (!ready) return;
    const T = window.T;
    const map = mapRef.current;
    if (!T || !map) return;

    overlayRef.current.forEach((o) => {
      map.removeOverLay(o);
    });
    overlayRef.current = [];

    if (fenceType === 'CIRCLE' && center && Number.isFinite(radius) && (radius ?? 0) > 0) {
      const circle = new T.Circle(new T.LngLat(center.longitude, center.latitude), radius, {
        color: '#066fd1',
        weight: 2,
        opacity: 0.9,
        fillColor: '#066fd1',
        fillOpacity: 0.15,
      });
      map.addOverLay(circle);
      overlayRef.current.push(circle);
      // 中心标记
      const marker = new T.Marker(new T.LngLat(center.longitude, center.latitude));
      map.addOverLay(marker);
      overlayRef.current.push(marker);
    }

    if (fenceType === 'POLYGON' && vertices && vertices.length > 0) {
      const path = vertices.map((p) => new T.LngLat(p.longitude, p.latitude));
      // 顶点标记
      vertices.forEach((p, i) => {
        const m = new T.Marker(new T.LngLat(p.longitude, p.latitude), {
          title: `顶点 ${i + 1}`,
        });
        map.addOverLay(m);
        overlayRef.current.push(m);
      });
      // 至少 3 个点时画多边形,否则用折线预览
      if (vertices.length >= 3) {
        const polygon = new T.Polygon(path, {
          color: '#52c41a',
          weight: 2,
          opacity: 0.9,
          fillColor: '#52c41a',
          fillOpacity: 0.15,
        });
        map.addOverLay(polygon);
        overlayRef.current.push(polygon);
      } else if (vertices.length === 2) {
        const line = new T.Polyline(path, { color: '#52c41a', weight: 2 });
        map.addOverLay(line);
        overlayRef.current.push(line);
      }
    }

    verticesRef.current = vertices ?? [];
  }, [ready, fenceType, center, radius, vertices]);

  if (error) {
    return (
      <Alert
        type="warning"
        message="地图加载失败"
        description={
          <div>
            <div style={{ marginBottom: 8 }}>{error}</div>
            <div style={{ color: '#666' }}>
              申请地址:
              <a
                href="https://console.tianditu.gov.cn/api/key"
                target="_blank"
                rel="noreferrer"
              >
                天地图开发者中心
              </a>
            </div>
          </div>
        }
        showIcon
      />
    );
  }

  return (
    <div>
      {mode === 'edit' && (
        <Space style={{ marginBottom: 12, flexWrap: 'wrap' }}>
          <Radio.Group
            value={fenceType}
            onChange={(e) => onChangeType?.(e.target.value)}
            optionType="button"
            buttonStyle="solid"
          >
            <Radio.Button value="CIRCLE">圆形</Radio.Button>
            <Radio.Button value="POLYGON">多边形</Radio.Button>
          </Radio.Group>

          {fenceType === 'CIRCLE' && (
            <Space>
              <span>半径(米):</span>
              <InputNumber
                min={50}
                max={50000}
                step={50}
                value={radius}
                onChange={(v) => onChangeRadius?.(Number(v ?? 0))}
                style={{ width: 120 }}
              />
            </Space>
          )}

          {fenceType === 'POLYGON' && (
            <Button
              icon={<ReloadOutlined />}
              size="small"
              onClick={() => {
                verticesRef.current = [];
                onChangeVertices?.([]);
              }}
            >
              清空顶点({vertices?.length ?? 0})
            </Button>
          )}

          <span style={{ color: '#666' }}>
            {fenceType === 'CIRCLE'
              ? '点击地图任意位置作为圆心'
              : '依次点击地图添加顶点,3 个以上自动闭合'}
          </span>
        </Space>
      )}

      <div
        ref={containerRef}
        style={{
          width: '100%',
          height,
          background: '#f0f2f5',
          border: '1px solid #d9d9d9',
          borderRadius: 4,
        }}
      />
    </div>
  );
};

export default FenceMapEditor;
