/**
 * 考勤打卡详情 — 人脸 / 地图 Tab
 *
 * - 人脸 Tab:展示打卡时采集的人脸识别照片(Attendance.face)
 * - 地图 Tab:在天地图上标出打卡地理坐标(Attendance.location)
 */

import { Empty } from 'antd';
import React, { useEffect, useRef } from 'react';
import type { Attachment } from '@/types/ontology/ap/oms/attachment';
import type { GeoPoint } from '@/types/ontology/ap/oms/geo_point';
import { loadTianDiTu } from '@/utils/tianditu';

/** 人脸照片 Tab */
export const FaceTab: React.FC<{ face?: Attachment }> = ({ face }) => {
  const url = face?.url;
  if (!url) {
    return (
      <div style={{ padding: 40 }}>
        <Empty
          image={Empty.PRESENTED_IMAGE_SIMPLE}
          description="无人脸识别照片"
        />
      </div>
    );
  }
  return (
    <div
      style={{
        padding: 24,
        display: 'flex',
        justifyContent: 'center',
      }}
    >
      <img
        src={url}
        alt="人脸识别照片"
        style={{
          maxWidth: 360,
          maxHeight: 360,
          borderRadius: 8,
          border: '1px solid var(--ant-color-border-secondary)',
          objectFit: 'contain',
        }}
      />
    </div>
  );
};

/** 打卡地图 Tab */
export const LocationMapTab: React.FC<{ location?: GeoPoint }> = ({
  location,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const lng = location?.longitude;
  const lat = location?.latitude;

  useEffect(() => {
    if (!containerRef.current || lng == null || lat == null) return;
    let map: any;
    loadTianDiTu()
      .then((T: any) => {
        if (!containerRef.current) return;
        map = new T.Map(containerRef.current);
        const center = new T.LngLat(lng, lat);
        map.centerAndZoom(center, 16);
        const marker = new T.Marker(center);
        map.addOverLay(marker);
      })
      .catch(() => {
        // 加载失败时静默,下方有坐标兜底
      });
    return () => {
      try {
        map?.destroy?.();
      } catch {
        // noop
      }
    };
  }, [lng, lat]);

  if (lng == null || lat == null) {
    return (
      <div style={{ padding: 40 }}>
        <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} description="无打卡定位" />
      </div>
    );
  }

  return (
    <div style={{ padding: 12 }}>
      <div
        ref={containerRef}
        style={{
          width: '100%',
          height: 360,
          borderRadius: 8,
          overflow: 'hidden',
          border: '1px solid var(--ant-color-border-secondary)',
        }}
      />
      <div
        style={{
          marginTop: 8,
          fontSize: 12,
          color: 'var(--ant-color-text-tertiary)',
        }}
      >
        坐标:{lng}, {lat}
      </div>
    </div>
  );
};
