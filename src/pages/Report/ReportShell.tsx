/**
 * 报表壳页 — 根据 path 反查 reportConfigs,渲染对应的 FactPage。
 *
 * 使用方式:每个具体报表只是一行 wrapper:
 *   import ReportShell from './ReportShell';
 *   export default () => <ReportShell configKey="residentSnapshot" />;
 */

import React from 'react';
import FactPage from '@/components/FactPage';
import { reportConfigs } from './configs';

export interface ReportShellProps {
  configKey: keyof typeof reportConfigs;
}

const ReportShell: React.FC<ReportShellProps> = ({ configKey }) => {
  const config = reportConfigs[configKey];
  if (!config) {
    return (
      <div style={{ padding: 24, color: '#888' }}>未知报表 {configKey}</div>
    );
  }
  return (
    <FactPage
      title={config.title}
      factService={config.factService}
      dimensions={config.dimensions}
      metrics={config.metrics}
    />
  );
};

export default ReportShell;
