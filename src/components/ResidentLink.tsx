/**
 * 居民引用组件
 *
 * - 显示居民姓名(从 cache / 接口拉),hover 显示富信息卡
 * - 点击跳转到 /profile/residents/detail/:id 居民详情
 *
 * 特性:
 *  - useRequest 缓存 detail 调用,同一个 id 在同一会话只查一次
 *  - 当父组件直接传 record(已知所有字段)时不再发请求
 */

import { UserOutlined } from '@ant-design/icons';
import { Link } from '@umijs/max';
import { useRequest } from 'ahooks';
import { Avatar, Popover, Skeleton, Space, Tag } from 'antd';
import React from 'react';
import { residentService } from '@/services/domains/resident';
import type { Resident } from '@/types/ontology/prh/entities/resident';
import { EnumLabels, StatusColors } from '@/utils/enum-options';

export interface ResidentLinkProps {
  /** 居民 id */
  id: string;
  /** 已知 record,传了就不再查 */
  record?: Partial<Resident>;
  /** 自定义显示文案,默认显示 fullName */
  children?: React.ReactNode;
  /** 是否启用 hover 卡(默认 true) */
  hoverable?: boolean;
  /** 是否点击跳转(默认 true) */
  clickable?: boolean;
}

const cache = new Map<string, Promise<Resident | null>>();

function getResident(id: string): Promise<Resident | null> {
  if (cache.has(id)) return cache.get(id)!;
  const p = residentService
    .detail(id)
    .then((env) => env.data as Resident | null)
    .catch(() => null);
  cache.set(id, p);
  return p;
}

/** 让外部刷新 cache(创建/编辑居民后调用) */
export function clearResidentCache(id?: string) {
  if (id) cache.delete(id);
  else cache.clear();
}

function maskIdCard(idCard?: string): string {
  if (!idCard) return '';
  if (idCard.length < 11) return idCard;
  return `${idCard.slice(0, 4)}***${idCard.slice(-4)}`;
}

function maskPhone(phone?: string): string {
  if (!phone) return '';
  if (phone.length < 7) return phone;
  return `${phone.slice(0, 3)}****${phone.slice(-4)}`;
}

const HoverCard: React.FC<{ id: string; record?: Partial<Resident> }> = ({
  id,
  record,
}) => {
  const { data, loading } = useRequest(
    () => (record ? Promise.resolve(record as Resident) : getResident(id)),
    { refreshDeps: [id, record] },
  );

  if (loading || !data) {
    return (
      <div style={{ width: 280 }}>
        <Skeleton active paragraph={{ rows: 3 }} />
      </div>
    );
  }

  return (
    <div style={{ width: 280 }}>
      <Space align="center" size={12} style={{ marginBottom: 12 }}>
        <Avatar size={48} icon={<UserOutlined />} src={(data as any).facePhoto}>
          {data.fullName?.[0]}
        </Avatar>
        <div>
          <div style={{ fontSize: 16, fontWeight: 600 }}>
            {data.fullName ?? '-'}
          </div>
          <div style={{ color: '#8c8c8c', fontSize: 12, marginTop: 2 }}>
            {maskIdCard((data as any).idCardNo)}
          </div>
        </div>
      </Space>

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: '64px 1fr',
          rowGap: 6,
          fontSize: 13,
        }}
      >
        <span style={{ color: '#8c8c8c' }}>状态</span>
        <span>
          <Tag color={(StatusColors.ResidentStatus as any)[data.status as any]}>
            {EnumLabels.ResidentStatus[
              data.status as keyof typeof EnumLabels.ResidentStatus
            ] ?? data.status}
          </Tag>
        </span>

        <span style={{ color: '#8c8c8c' }}>性别</span>
        <span>
          {EnumLabels.Gender[data.gender as keyof typeof EnumLabels.Gender] ??
            '-'}
        </span>

        <span style={{ color: '#8c8c8c' }}>电话</span>
        <span>{maskPhone((data as any).phone) || '-'}</span>

        <span style={{ color: '#8c8c8c' }}>保障类型</span>
        <span>
          {EnumLabels.GuaranteeType[
            (data as any).guaranteeType as keyof typeof EnumLabels.GuaranteeType
          ] ?? '-'}
        </span>
      </div>

      <div
        style={{
          marginTop: 12,
          paddingTop: 8,
          borderTop: '1px solid #f0f0f0',
          textAlign: 'right',
        }}
      >
        <Link to={`/profile/residents/detail/${id}`} target="_blank">
          查看居民详情 →
        </Link>
      </div>
    </div>
  );
};

const ResidentLink: React.FC<ResidentLinkProps> = ({
  id,
  record,
  children,
  hoverable = true,
  clickable = true,
}) => {
  const label = children ?? (record?.fullName as React.ReactNode) ?? id;

  const inner = clickable ? (
    <Link to={`/profile/residents/detail/${id}`} style={{ color: '#1677ff' }}>
      {label}
    </Link>
  ) : (
    <span>{label}</span>
  );

  if (!hoverable) return inner;

  return (
    <Popover
      destroyOnHidden
      mouseEnterDelay={0.3}
      placement="rightTop"
      content={<HoverCard id={id} record={record} />}
    >
      {inner}
    </Popover>
  );
};

export default ResidentLink;
