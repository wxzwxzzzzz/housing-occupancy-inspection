/**
 * 资质申请详情 — 家庭佐证数据 Tab
 *
 * 审批资格时需要查看申请家庭的成员/居住/工作/收入数据。
 * 给定 householdId,先查家庭成员拿到 residentIds,再按居民查居住/工作/收入。
 */

import { useRequest } from 'ahooks';
import { Table } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import React from 'react';
import {
  employmentService,
  householdMemberService,
  personalIncomeService,
  residenceService,
} from '@/services/domains/household';
import { OT } from '@/services/ontology/object-types';
import { qb } from '@/services/ontology/query';
import { dictLabel } from '@/stores/dictStore';
import type { Employment } from '@/types/ontology/prh/entities/employment';
import type { HouseholdMember } from '@/types/ontology/prh/entities/household_member';
import type { PersonalIncome } from '@/types/ontology/prh/entities/personal_income';
import type { Residence } from '@/types/ontology/prh/entities/residence';

const tableProps = {
  size: 'small' as const,
  pagination: { pageSize: 10, showSizeChanger: false } as const,
};

/** 家庭成员表 */
export const FamilyMembersTab: React.FC<{ householdId?: string }> = ({
  householdId,
}) => {
  const { data = [], loading } = useRequest(
    async () => {
      if (!householdId) return [] as HouseholdMember[];
      const env = await householdMemberService.list(
        qb(OT.HouseholdMember).eq('household', householdId).page(1, 100).build() as any,
      );
      return env.data;
    },
    { refreshDeps: [householdId] },
  );

  const cols: ColumnsType<HouseholdMember> = [
    {
      title: '关联居民',
      dataIndex: 'resident',
      width: 140,
      render: (v: string) => (v ? `居民#${String(v).slice(-6)}` : '-'),
    },
    { title: '与申请人关系', dataIndex: 'relationship', width: 140 },
    {
      title: '是否计入人口',
      dataIndex: 'isIncluded',
      width: 120,
      render: (v: boolean) => (v ? '是' : '否'),
    },
    { title: '加入时间', dataIndex: 'joinAt', width: 160 },
  ];

  return (
    <Table<HouseholdMember>
      {...tableProps}
      rowKey={(r) => (r as any).id ?? Math.random().toString(36)}
      loading={loading}
      dataSource={data}
      columns={cols}
    />
  );
};

/** 用 householdId → residentIds 的公共 hook */
function useResidentIds(householdId?: string) {
  return useRequest(
    async () => {
      if (!householdId) return [] as string[];
      const env = await householdMemberService.list(
        qb(OT.HouseholdMember).eq('household', householdId).page(1, 100).build() as any,
      );
      return (env.data as any[]).map((m) => m.resident).filter(Boolean) as string[];
    },
    { refreshDeps: [householdId] },
  );
}

/** 按 residentIds 批量查子档案 */
function useByResidentIds<T>(
  objectType: string,
  service: { list: (q: any) => Promise<{ data: T[] }> },
  residentIds: string[],
) {
  return useRequest(
    async () => {
      if (!residentIds.length) return [] as T[];
      const env = await service.list(
        qb(objectType).in('resident', residentIds).page(1, 200).build() as any,
      );
      return env.data;
    },
    { refreshDeps: [residentIds.join(',')] },
  );
}

/** 居住信息表 */
export const FamilyResidencesTab: React.FC<{ householdId?: string }> = ({
  householdId,
}) => {
  const { data: residentIds = [] } = useResidentIds(householdId);
  const { data = [], loading } = useByResidentIds<Residence>(
    OT.Residence,
    residenceService,
    residentIds,
  );

  const cols: ColumnsType<Residence> = [
    {
      title: '所属居民',
      dataIndex: 'resident',
      width: 140,
      render: (v: string) => (v ? `居民#${String(v).slice(-6)}` : '-'),
    },
    {
      title: '居住类型',
      dataIndex: 'addressType',
      width: 120,
      render: (v: any) => dictLabel('ResidenceType', v),
    },
    {
      title: '居住地址',
      dataIndex: 'address',
      ellipsis: true,
      render: (v: any) => v?.detail ?? '-',
    },
    {
      title: '记录状态',
      dataIndex: 'status',
      width: 100,
      render: (v: any) => dictLabel('RecordStatus', v),
    },
  ];

  return (
    <Table<Residence>
      {...tableProps}
      rowKey={(r) => (r as any).id ?? Math.random().toString(36)}
      loading={loading}
      dataSource={data}
      columns={cols}
    />
  );
};

/** 工作信息表 */
export const FamilyEmploymentsTab: React.FC<{ householdId?: string }> = ({
  householdId,
}) => {
  const { data: residentIds = [] } = useResidentIds(householdId);
  const { data = [], loading } = useByResidentIds<Employment>(
    OT.Employment,
    employmentService,
    residentIds,
  );

  const cols: ColumnsType<Employment> = [
    {
      title: '所属居民',
      dataIndex: 'resident',
      width: 140,
      render: (v: string) => (v ? `居民#${String(v).slice(-6)}` : '-'),
    },
    { title: '工作单位', dataIndex: 'unitName', width: 180, ellipsis: true },
    {
      title: '工作地址',
      dataIndex: 'workAddress',
      ellipsis: true,
      render: (v: any) => v?.detail ?? '-',
    },
    {
      title: '记录状态',
      dataIndex: 'status',
      width: 100,
      render: (v: any) => dictLabel('RecordStatus', v),
    },
  ];

  return (
    <Table<Employment>
      {...tableProps}
      rowKey={(r) => (r as any).id ?? Math.random().toString(36)}
      loading={loading}
      dataSource={data}
      columns={cols}
    />
  );
};

/** 个人收入表 */
export const FamilyIncomesTab: React.FC<{ householdId?: string }> = ({
  householdId,
}) => {
  const { data: residentIds = [] } = useResidentIds(householdId);
  const { data = [], loading } = useByResidentIds<PersonalIncome>(
    OT.PersonalIncome,
    personalIncomeService,
    residentIds,
  );

  const cols: ColumnsType<PersonalIncome> = [
    {
      title: '所属居民',
      dataIndex: 'resident',
      width: 140,
      render: (v: string) => (v ? `居民#${String(v).slice(-6)}` : '-'),
    },
    {
      title: '收入类型',
      dataIndex: 'incomeType',
      width: 120,
      render: (v: any) => dictLabel('IncomeType', v),
    },
    {
      title: '金额(元)',
      dataIndex: 'amount',
      width: 120,
      render: (v: any) => (v != null ? v : '-'),
    },
    { title: '所属期间', dataIndex: 'period', width: 120 },
    {
      title: '记录状态',
      dataIndex: 'status',
      width: 100,
      render: (v: any) => dictLabel('RecordStatus', v),
    },
  ];

  return (
    <Table<PersonalIncome>
      {...tableProps}
      rowKey={(r) => (r as any).id ?? Math.random().toString(36)}
      loading={loading}
      dataSource={data}
      columns={cols}
    />
  );
};
