import React from 'react';
import { Card, Empty } from 'antd';

const ReportStatistics: React.FC = () => {
  return (
    <div style={{ padding: '24px' }}>
      <Card title="数据统计">
        <Empty description="功能开发中..." />
      </Card>
    </div>
  );
};

export default ReportStatistics;
