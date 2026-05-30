import { Column, Pie } from '@ant-design/charts';
import { Card, Col, Row, Spin, Statistic } from 'antd';
import React, { useEffect, useMemo, useState } from 'react';
import { invokeQuery } from '@/services/ontology/client';
import { OT } from '@/services/ontology/object-types';
import { qb } from '@/services/ontology/query';
import { dictLabel } from '@/stores/dictStore';
import type { AttendanceFact } from '@/types/ontology/prh/facts/attendance_fact';
import type { LeaveFact } from '@/types/ontology/prh/facts/leave_fact';
import type { MigrantWorkFact } from '@/types/ontology/prh/facts/migrant_work_fact';
import { EnumLabels } from '@/utils/enum-options';

const ReportStatistics: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [att, setAtt] = useState<AttendanceFact[]>([]);
  const [leaves, setLeaves] = useState<LeaveFact[]>([]);
  const [migrant, setMigrant] = useState<MigrantWorkFact[]>([]);
  const [residentTotal, setResidentTotal] = useState(0);

  useEffect(() => {
    setLoading(true);
    Promise.all([
      invokeQuery<AttendanceFact>(
        OT.AttendanceFact,
        qb(OT.AttendanceFact).page(1, 1000).build(),
      ),
      invokeQuery<LeaveFact>(
        OT.LeaveFact,
        qb(OT.LeaveFact).page(1, 1000).build(),
      ),
      invokeQuery<MigrantWorkFact>(
        OT.MigrantWorkFact,
        qb(OT.MigrantWorkFact).page(1, 1000).build(),
      ),
      invokeQuery(OT.Resident, qb(OT.Resident).page(1, 1).build()),
    ])
      .then(([a, l, m, r]) => {
        setAtt(a.data);
        setLeaves(l.data);
        setMigrant(m.data);
        setResidentTotal(r.page?.total ?? 0);
      })
      .finally(() => setLoading(false));
  }, []);

  const stats = useMemo(() => {
    const valid = att.filter((f: any) => f.attendanceStatus === 'VALID').length;
    const invalid = att.filter(
      (f: any) => f.attendanceStatus === 'INVALID',
    ).length;
    const missed = att.filter(
      (f: any) => f.attendanceStatus === 'MISSED',
    ).length;
    const total = att.length || 1;
    return {
      total,
      valid,
      invalid,
      missed,
      rate: `${Math.round((valid / total) * 100)}%`,
    };
  }, [att]);

  // 按状态分布饼图
  const statusPie = useMemo(() => {
    const map = new Map<string, number>();
    att.forEach((f: any) => {
      const key =
        EnumLabels.AttendanceStatus[
          f.attendanceStatus as keyof typeof EnumLabels.AttendanceStatus
        ] ?? f.attendanceStatus;
      map.set(key, (map.get(key) ?? 0) + 1);
    });
    return Array.from(map.entries()).map(([type, value]) => ({ type, value }));
  }, [att]);

  // 近 7 天趋势柱图
  const trend = useMemo(() => {
    const buckets = new Map<string, { valid: number; alert: number }>();
    const now = Date.now();
    for (let i = 6; i >= 0; i--) {
      const d = new Date(now - i * 86400000).toISOString().slice(0, 10);
      buckets.set(d, { valid: 0, alert: 0 });
    }
    att.forEach((f: any) => {
      const d = String(f.checkIn ?? '').slice(0, 10);
      const b = buckets.get(d);
      if (!b) return;
      if (f.attendanceStatus === 'VALID') b.valid++;
      else if (
        f.attendanceStatus === 'INVALID' ||
        f.attendanceStatus === 'MISSED'
      )
        b.alert++;
    });
    const out: Array<{ date: string; type: string; value: number }> = [];
    buckets.forEach((v, date) => {
      out.push({ date, type: '正常', value: v.valid });
      out.push({ date, type: '异常', value: v.alert });
    });
    return out;
  }, [att]);

  // 请假类型分布
  const leavePie = useMemo(() => {
    const map = new Map<string, number>();
    leaves.forEach((f: any) => {
      const key = String(f.leaveType ?? '其他');
      map.set(key, (map.get(key) ?? 0) + 1);
    });
    return Array.from(map.entries()).map(([type, value]) => ({ type, value }));
  }, [leaves]);

  // 备案类型分布
  const migrantPie = useMemo(() => {
    const map = new Map<string, number>();
    migrant.forEach((f: any) => {
      const key = dictLabel('MigrantWorkType', f.type, f.type ?? '其他');
      map.set(key, (map.get(key) ?? 0) + 1);
    });
    return Array.from(map.entries()).map(([type, value]) => ({ type, value }));
  }, [migrant]);

  if (loading) {
    return (
      <div style={{ padding: 48, textAlign: 'center' }}>
        <Spin />
      </div>
    );
  }

  return (
    <div style={{ padding: 24 }}>
      <Row gutter={16} style={{ marginBottom: 16 }}>
        <Col xs={12} sm={6}>
          <Card>
            <Statistic title="居民总数" value={residentTotal} />
          </Card>
        </Col>
        <Col xs={12} sm={6}>
          <Card>
            <Statistic
              title="出勤率"
              value={stats.rate}
              valueStyle={{ color: '#52c41a' }}
            />
          </Card>
        </Col>
        <Col xs={12} sm={6}>
          <Card>
            <Statistic
              title="无效打卡"
              value={stats.invalid}
              valueStyle={{ color: '#ff4d4f' }}
            />
          </Card>
        </Col>
        <Col xs={12} sm={6}>
          <Card>
            <Statistic
              title="缺勤"
              value={stats.missed}
              valueStyle={{ color: '#faad14' }}
            />
          </Card>
        </Col>
      </Row>

      <Row gutter={16}>
        <Col xs={24} lg={12}>
          <Card title="近 7 天打卡趋势" style={{ marginBottom: 16 }}>
            <Column
              data={trend}
              xField="date"
              yField="value"
              colorField="type"
              isGroup
              height={280}
            />
          </Card>
        </Col>
        <Col xs={24} lg={12}>
          <Card title="打卡状态分布" style={{ marginBottom: 16 }}>
            <Pie
              data={statusPie}
              angleField="value"
              colorField="type"
              radius={0.85}
              height={280}
            />
          </Card>
        </Col>
        <Col xs={24} lg={12}>
          <Card title="请假类型分布" style={{ marginBottom: 16 }}>
            <Pie
              data={leavePie}
              angleField="value"
              colorField="type"
              radius={0.85}
              height={280}
            />
          </Card>
        </Col>
        <Col xs={24} lg={12}>
          <Card title="备案类型分布" style={{ marginBottom: 16 }}>
            <Pie
              data={migrantPie}
              angleField="value"
              colorField="type"
              radius={0.85}
              height={280}
            />
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default ReportStatistics;
